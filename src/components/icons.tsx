import {
  Book,
  Folder as FolderIcon,
  FileText,
  PlusCircle,
  Edit3,
  Trash2,
  UploadCloud,
  Sparkles,
  Search,
  ChevronDown,
  ChevronRight,
  Brain,
  XCircle,
  Notebook as NotebookIcon,
  Home,
  Settings,
  MoreHorizontal,
  Save,
  Lightbulb, // Added
  Bell,      // Added
  Tag,       // Added (using Tag, Tags is also an option)
  Archive,   // Added
  RefreshCw, // For refresh icon
  LayoutGrid, // For grid view
  List, // For list view
  Menu, // For sidebar toggle on mobile
  Bot, // For AI floater
} from 'lucide-react';

export const Icons = {
  Notebook: NotebookIcon,
  Folder: FolderIcon,
  Note: FileText,
  Add: PlusCircle,
  Edit: Edit3,
  Delete: Trash2,
  Import: UploadCloud,
  AI: Sparkles,
  Search: Search,
  ChevronDown: ChevronDown,
  ChevronRight: ChevronRight,
  Settings: Settings,
  More: MoreHorizontal,
  Save: Save,
  Home: Home,
  Clear: XCircle,
  Lightbulb: Lightbulb,
  Bell: Bell,
  Tag: Tag,
  Archive: Archive,
  Trash: Trash2, // Already exists, re-confirming use
  Refresh: RefreshCw,
  GridView: LayoutGrid,
  ListView: List,
  Menu: Menu,
  Bot: Bot,
};

export type IconName = keyof typeof Icons;
