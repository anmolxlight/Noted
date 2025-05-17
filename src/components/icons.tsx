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
  Save
} from 'lucide-react';

export const Icons = {
  Notebook: NotebookIcon,
  Folder: FolderIcon,
  Note: FileText,
  Add: PlusCircle,
  Edit: Edit3,
  Delete: Trash2,
  Import: UploadCloud,
  AI: Sparkles, // Or Brain
  Search: Search,
  ChevronDown: ChevronDown,
  ChevronRight: ChevronRight,
  Settings: Settings,
  More: MoreHorizontal,
  Save: Save,
  Home: Home,
  Clear: XCircle,
};

export type IconName = keyof typeof Icons;
