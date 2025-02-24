import { Camera, Check, ChevronDown, ChevronLeft, ChevronRight, Command, CreditCard, File, FileText, HelpCircle, Image, Laptop, Loader2, LucideProps, Moon, MoreVertical, Pizza, Plus, Settings, SunMedium, Trash, Twitter, User, X, type Icon as LucideIcon } from "lucide-react"

export type Icon = LucideIcon

export const Icons = {
  logo: Command,
  close: X,
  spinner: Loader2,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  trash: Trash,
  post: FileText,
  page: File,
  media: Image,
  settings: Settings,
  billing: CreditCard,
  ellipsis: MoreVertical,
  add: Plus,
  warning: HelpCircle,
  user: User,
  camera: Camera,
  check: Check,
  sun: SunMedium,
  moon: Moon,
  laptop: Laptop,
} as const 