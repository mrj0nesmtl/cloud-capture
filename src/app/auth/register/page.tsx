import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { EmailAuthForm } from "@/components/auth/email-auth-form"
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Create Account | Cloud Burst",
  description: "Join Cloud Burst and start capturing moments",
}

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <div className="flex justify-center mb-4">
          <Image
            src="/android-chrome-192x192.png"
            alt="Cloud Burst Logo"
            width={48}
            height={48}
            className="rounded-lg"
          />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email below to create your account
        </p>
      </div>
      
      <EmailAuthForm mode="signup" />
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <SocialAuthButtons />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link 
          href="/auth/login" 
          className="text-blue-500 hover:text-blue-600 font-medium"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
} 