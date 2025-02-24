import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server-config'

export const metadata: Metadata = {
  title: 'Events | Cloud Burst',
  description: 'Manage your photo events',
}

export default async function EventsPage() {
  const supabase = createClient()
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Events</h1>
        <button className="btn btn-primary">Create Event</button>
      </div>
      
      <div className="rounded-md border">
        {/* Event list will go here */}
        <div className="p-4 text-center text-sm text-muted-foreground">
          No events found. Create your first event to get started.
        </div>
      </div>
    </div>
  )
}
