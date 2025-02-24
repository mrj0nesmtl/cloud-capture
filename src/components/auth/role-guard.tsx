'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: string[]
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter()
  const { user } = useAuth()
  
  useEffect(() => {
    if (!user?.role || !allowedRoles.includes(user.role)) {
      router.push('/dashboard')
    }
  }, [user, allowedRoles, router])

  if (!user?.role || !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
} 