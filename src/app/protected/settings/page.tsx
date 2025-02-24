import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { ProfileForm } from '@/components/forms/profile-form'
import { PreferencesForm } from '@/components/forms/preferences-form'
import { NotificationsForm } from '@/components/forms/notifications-form'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Settings | Cloud Capture',
  description: 'Manage your account settings and preferences',
}

export default async function SettingsPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return (
    <div className="container max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      
      <Separator />
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile information and avatar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm 
                user={session.user}
                className="space-y-6"
                onSuccess={() => {
                  // Optionally refresh the page or show a success message
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Customize your experience and interface settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PreferencesForm 
                initialValues={{
                  theme: 'system',
                  emailDigest: true,
                  autoUpload: false,
                  highQualityPreviews: true,
                  language: 'en',
                  displayDensity: 'comfortable',
                  dateFormat: 'MM/DD/YYYY',
                  timeFormat: '12h',
                  defaultView: 'grid',
                }}
                onSubmit={async (values) => {
                  // Handle preferences update
                  console.log(values)
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage your notification preferences and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationsForm 
                initialValues={{
                  emailNotifications: true,
                  pushNotifications: true,
                  marketingEmails: false,
                  newEventAlerts: true,
                  photoComments: true,
                  photoLikes: true,
                  digestFrequency: 'weekly',
                  notificationSound: true,
                }}
                onSubmit={async (values) => {
                  // Handle notifications update
                  console.log(values)
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
