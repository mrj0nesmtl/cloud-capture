import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'

// Define valid user roles
type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'EVENT_HOST' | 'USER' | 'GUEST'

// Define route patterns based on security standards
const PUBLIC_ROUTES = [
  '/',
  '/auth/signin',
  '/auth/register',
  '/auth/reset-password',
  '/event/[code]'
] as const

const ROLE_PROTECTED_ROUTES: Record<UserRole, string[]> = {
  SUPER_ADMIN: [
    '/admin',
    '/dashboard',
    '/events/[id]',
    '/settings',
    '/profile'
  ],
  ADMIN: [
    '/admin',
    '/dashboard',
    '/events/[id]',
    '/settings',
    '/profile'
  ],
  EVENT_HOST: [
    '/dashboard',
    '/events/[id]',
    '/events/manage',
    '/settings',
    '/profile'
  ],
  USER: [
    '/dashboard',
    '/events/[id]',
    '/settings',
    '/profile'
  ],
  GUEST: [
    '/event/[code]',
    '/events/[id]/photos'  // Added based on permissions for photo viewing
  ]
}

// Add rate limiting configuration from security standards
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limit each IP to 100 requests per windowMs
}

// Add rate limit tracking
const ipRequests = new Map<string, { count: number; resetTime: number }>()

// Add role-specific dashboard routes
const ROLE_DASHBOARDS: Record<UserRole, string> = {
  SUPER_ADMIN: '/admin/dashboard',
  ADMIN: '/admin/dashboard',
  EVENT_HOST: '/events/manage',
  USER: '/dashboard',
  GUEST: '/event/browse'
}

// Define allowed methods for protected routes
const PROTECTED_METHODS: Record<string, string[]> = {
  '/api/events': ['GET', 'POST'],
  '/api/events/[id]': ['GET', 'PUT', 'DELETE'],
  '/api/photos': ['GET', 'POST'],
  '/api/photos/[id]': ['GET', 'DELETE'],
  '/api/users': ['GET'],
  '/api/users/[id]': ['GET', 'PUT']
}

// Helper function to convert route pattern to regex
function routeToRegex(route: string): RegExp {
  // Convert Next.js dynamic route syntax to regex pattern
  const pattern = route
    .replace(/\[([^\]]+)\]/g, '[^/]+') // Convert [param] to regex pattern
    .replace(/\//g, '\\/') // Escape forward slashes
  return new RegExp(`^${pattern}`)
}

export async function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const isDev = process.env.NODE_ENV === 'development'

  const cspHeader = isDev 
    ? // Development CSP
      [
        "default-src 'self'",
        `script-src 'self' 'unsafe-eval' 'unsafe-inline' ${request.nextUrl.origin}`,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: blob: https:",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self' ws: wss: *",
        "frame-src 'self'",
      ].join('; ')
    : // Production CSP
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: blob: https:",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self'",
        "frame-src 'self'",
      ].join('; ')

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('Content-Security-Policy', cspHeader)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    }
  })

  try {
    // Create response early for cookie handling
    const res = response

    // Update to new middleware client
    const supabase = createMiddlewareClient({ 
      req: request,
      res,
    })

    // Implement rate limiting
    const ip = request.ip ?? 'unknown'
    const now = Date.now()
    const requestData = ipRequests.get(ip) ?? { count: 0, resetTime: now + RATE_LIMIT.windowMs }

    // Reset count if window has expired
    if (now > requestData.resetTime) {
      requestData.count = 0
      requestData.resetTime = now + RATE_LIMIT.windowMs
    }

    // Increment request count
    requestData.count++
    ipRequests.set(ip, requestData)

    // Check if rate limit exceeded
    if (requestData.count > RATE_LIMIT.max) {
      return new NextResponse('Too Many Requests', { status: 429 })
    }

    // Add security headers from our standards
    Object.entries({
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Permissions-Policy': "camera=(), microphone=(), geolocation=()"
    }).forEach(([key, value]) => {
      res.headers.set(key, value)
    })

    // Get session with new client
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || (session?.expires_at && new Date(session.expires_at) <= new Date())) {
      // Clean up cookies for invalid/expired sessions
      await supabase.auth.signOut()
      
      // Redirect to signin unless already heading there
      const path = request.nextUrl.pathname
      if (!path.startsWith('/auth/signin')) {
        const loginUrl = new URL('/auth/signin', request.url)
        loginUrl.searchParams.set('message', 'Session expired. Please sign in again.')
        return NextResponse.redirect(loginUrl)
      }
    }

    const path = request.nextUrl.pathname
    const method = request.method

    // Check if path matches any protected API routes
    const isApiRoute = path.startsWith('/api/')
    if (isApiRoute) {
      // Find matching route pattern
      const matchedRoute = Object.keys(PROTECTED_METHODS).find(route => 
        routeToRegex(route).test(path)
      )

      if (matchedRoute) {
        // Check if method is allowed
        const allowedMethods = PROTECTED_METHODS[matchedRoute]
        if (!allowedMethods.includes(method)) {
          return new NextResponse('Method Not Allowed', { 
            status: 405,
            headers: {
              'Allow': allowedMethods.join(', ')
            }
          })
        }
      }
    }

    // Store the original URL for post-login redirect
    const returnTo = request.nextUrl.pathname + request.nextUrl.search

    // Check if route is public using regex patterns
    if (PUBLIC_ROUTES.some(route => routeToRegex(route).test(path))) {
      return res
    }

    // No session, redirect to login with return URL
    if (!session) {
      const loginUrl = new URL('/auth/signin', request.url)
      loginUrl.searchParams.set('returnTo', returnTo)
      return NextResponse.redirect(loginUrl)
    }

    // Get user role from session and ensure it's a valid role
    const userRole = (session.user.user_metadata.role || 'USER') as UserRole
    
    // Check if user has access to the route using regex patterns
    const hasAccess = ROLE_PROTECTED_ROUTES[userRole]?.some(route => 
      routeToRegex(route).test(path)
    ) || false

    if (!hasAccess) {
      return NextResponse.redirect(new URL(ROLE_DASHBOARDS[userRole], request.url))
    }

    // Add debug logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log('Session:', session)
      console.log('User role:', userRole)
      console.log('Accessing path:', path)
      console.log('Has access:', hasAccess)
    }

    return res
  } catch (error) {
    // Log the error (you might want to use a proper logging service in production)
    console.error('Middleware error:', error)
    
    // In production, redirect to error page; in development, redirect to signin
    return process.env.NODE_ENV === 'production'
      ? NextResponse.redirect(new URL('/500', request.url))
      : NextResponse.redirect(new URL('/auth/signin', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 