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

export interface Note {
  id: string;
  title: string;
  content: string;
  notebookId: string;
  folderId: string | null; // ID of parent folder, or null if directly under a notebook
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  summary?: string; // Optional AI-generated summary
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
