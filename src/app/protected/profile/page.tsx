import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server-config'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/forms/profile-form'

export const metadata: Metadata = {
  title: 'Profile | Cloud Burst',
  description: 'Manage your profile settings and preferences',
}

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="container max-w-2xl py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
      </div>
      
      <div className="mt-8">
        <ProfileForm 
          user={session.user}
          className="space-y-8"
        />
      </div>
    </div>
  )
}
