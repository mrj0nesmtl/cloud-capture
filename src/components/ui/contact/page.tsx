import { Facebook, Instagram, ExternalLink, Linkedin } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Facebook className="h-5 w-5 text-blue-500" />
        <div>
          <h3 className="font-medium">Facebook</h3>
          <a 
            href="https://facebook.com/cloudburst" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-blue-500 transition-colors"
          >
            @cloudburst
          </a>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Instagram className="h-5 w-5 text-blue-500" />
        <div>
          <h3 className="font-medium">Instagram</h3>
          <a 
            href="https://instagram.com/cloudburst" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-blue-500 transition-colors"
          >
            @cloudburst
          </a>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <ExternalLink className="h-5 w-5 text-blue-500" />
        <div>
          <h3 className="font-medium">BlueSky</h3>
          <a 
            href="https://bsky.app/profile/cloudburst.bsky.social" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-blue-500 transition-colors"
          >
            @cloudburst
          </a>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Linkedin className="h-5 w-5 text-blue-500" />
        <div>
          <h3 className="font-medium">LinkedIn</h3>
          <a 
            href="https://linkedin.com/company/cloudburst" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-blue-500 transition-colors"
          >
            Cloud Burst
          </a>
        </div>
      </div>
    </div>
  );
} 