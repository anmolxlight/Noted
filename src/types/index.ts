
export interface Notebook {
  id: string;
  name: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface Folder {
  id:string;
  name: string;
  notebookId: string;
  parentId: string | null; // For nested folders, null if directly under a notebook
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface NoteListItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string; // For text notes, or raw input for list notes before parsing
  items?: NoteListItem[]; // For list notes
  type: 'text' | 'list'; // Made type mandatory
  color: string | null;
  imageUrl: string | null;
  pinned: boolean;
  notebookId: string;
  folderId: string | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  summary?: string; // Optional AI-generated summary
  status: 'active' | 'archived' | 'trashed';
  deletedAt?: string | null;
}

// For AI Query results
export interface QueryReference {
  noteTitle: string;
  lines: number[];
}
export interface AIQueryResponse {
  answer: string;
  references: QueryReference[];
}

// Represents an item in the sidebar tree
export type TreeItemType = 'notebook' | 'folder' | 'note';
export interface TreeItem {
  id: string;
  name: string;
  type: TreeItemType;
  parentId?: string | null; // For folders and notes, refers to parent folder or notebook
  children?: TreeItem[]; // For notebooks and folders
  icon?: React.ElementType; // Lucide icon component
  notebookId?: string; // For folders and notes
  folderId?: string; // For notes
}

// For AI Chat History
export interface ChatMessageContent {
  answer?: string;
  references?: QueryReference[];
  error?: string;
  isLoading?: boolean; // Added to indicate AI is processing
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  queryText?: string; // For user messages
  content: ChatMessageContent; // For assistant messages (answer, references, error, or loading state)
  timestamp: string; // ISO date string
}
