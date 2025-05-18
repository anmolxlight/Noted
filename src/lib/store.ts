import { create } from 'zustand';
import type { Notebook, Folder, Note, AIQueryResponse, NoteListItem, ChatMessage, ChatMessageContent } from '@/types';
import { importAndSummarize } from '@/ai/flows/import-and-summarize';
import { queryNotes as queryNotesFlow } from '@/ai/flows/query-notes';
import { useTheme } from '@/hooks/use-theme'; // For theme state

interface NoteWiseState {
  notebooks: Notebook[];
  folders: Folder[];
  notes: Note[];
  selectedNotebookId: string | null;
  selectedFolderId: string | null;
  selectedNoteId: string | null;
  editingNoteId: string | null; // For modal
  
  currentAiQuery: string; // Renamed from aiQuestion
  aiChatHistory: ChatMessage[]; // To store the conversation
  isAiLoadingGlobal: boolean; // Renamed from isAiLoading to avoid conflict with message-specific loading

  highlightedLines: { noteId: string; lines: number[] } | null;
  searchTerm: string; 
  theme: 'light' | 'dark'; // Theme state

  // Actions
  addNotebook: (name: string) => Notebook;
  addFolder: (name: string, notebookId: string, parentId?: string | null) => Folder;
  addNote: (title: string, notebookId: string, folderId?: string | null, content?: string, imageUrl?: string | null) => Note;
  updateNote: (noteId: string, updates: Partial<Note>) => void;
  deleteNote: (noteId: string) => void; // This actually means trashNote
  trashNote: (noteId: string) => void;
  archiveNote: (noteId: string) => void; // Placeholder
  restoreNote: (noteId: string) => void; // Placeholder
  deleteNotePermanently: (noteId: string) => void; // Placeholder

  deleteFolder: (folderId: string) => void;
  deleteNotebook: (notebookId: string) => void;
  toggleNoteListItem: (noteId: string, itemId: string) => void;
  addNoteListItem: (noteId: string, text?: string, afterItemId?: string) => void;
  updateNoteListItem: (noteId: string, itemId: string, text: string) => void;
  deleteNoteListItem: (noteId: string, itemId: string) => void;

  updateNoteColor: (noteId: string, color: string | null) => void;
  updateNoteImage: (noteId: string, imageUrl: string | null) => void;
  togglePinNote: (noteId: string) => void;

  selectNotebook: (notebookId: string | null) => void;
  selectFolder: (folderId: string | null) => void;
  selectNote: (noteId: string | null) => void;
  setEditingNoteId: (noteId: string | null) => void; // For modal

  importNoteFromFile: (file: File, notebookId: string, folderId?: string | null) => Promise<Note | null>;
  
  queryNotes: (question: string) => Promise<void>;
  setCurrentAiQuery: (question: string) => void; // Renamed
  clearChatHistory: () => void; // Renamed

  setHighlightedLines: (noteId: string, lines: number[]) => void;
  clearHighlightedLines: () => void;
  setSearchTerm: (term: string) => void;
  toggleTheme: () => void; // Theme toggle action
}

const createId = () => Math.random().toString(36).substr(2, 9);
// Static IDs for initial sample data to ensure consistent SSR and hydration
const initialNotebookId = 'notebook-1';
const initialFolderId = 'folder-1';
const initialNoteId = 'note-1';
const initialListNoteId = 'note-2';
const initialImageNoteId = 'note-3';

// Initial shopping list items with static IDs
const initialShoppingListItems = [
  { id: 'listitem-1', text: 'Milk', checked: false },
  { id: 'listitem-2', text: 'Eggs', checked: false },
  { id: 'listitem-3', text: 'Bread', checked: true },
];

export const useNoteWiseStore = create<NoteWiseState>((set, get) => ({
  notebooks: [{ id: initialNotebookId, name: 'My First Notebook', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
  folders: [{ id: initialFolderId, name: 'General Thoughts', notebookId: initialNotebookId, parentId: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
  notes: [
    { id: initialNoteId, title: 'Welcome to NoteWise AI!', content: 'This is your first note.\nStart organizing your thoughts and query them with AI.\nTry asking a question about this note in the AI Panel!', type: 'text', color: null, imageUrl: null, pinned: false, notebookId: initialNotebookId, folderId: initialFolderId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), summary: 'A welcome note.', status: 'active' },
    { id: initialListNoteId, title: 'My Shopping List', content: '', type: 'list', items: initialShoppingListItems, color: 'hsl(50, 95%, 90%)', imageUrl: null, pinned: false, notebookId: initialNotebookId, folderId: initialFolderId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), summary: 'A sample shopping list', status: 'active' },
    { id: initialImageNoteId, title: 'Beautiful Scenery', content: 'A note with a placeholder image.', type: 'text', color: 'hsl(200, 80%, 90%)', imageUrl: 'https://placehold.co/600x400.png', pinned: true, notebookId: initialNotebookId, folderId: initialFolderId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), summary: 'Note with an image.', status: 'active' }
  ],
  selectedNotebookId: initialNotebookId,
  selectedFolderId: initialFolderId,
  selectedNoteId: null, // Default to null, modal will handle selection
  editingNoteId: null, // For modal

  currentAiQuery: '',
  aiChatHistory: [],
  isAiLoadingGlobal: false,

  highlightedLines: null,
  searchTerm: '',
  theme: 'light', // Default theme

  addNotebook: (name) => {
    const newNotebook: Notebook = { id: createId(), name, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    set(state => ({ notebooks: [...state.notebooks, newNotebook] }));
    return newNotebook;
  },
  addFolder: (name, notebookId, parentId = null) => {
    const newFolder: Folder = { id: createId(), name, notebookId, parentId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    set(state => ({ folders: [...state.folders, newFolder] }));
    return newFolder;
  },
  addNote: (title, notebookId, folderId = null, rawContent = '', imageUrl = null) => {
    const lines = rawContent.split('\n');
    const listItems: NoteListItem[] = [];
    let noteType: 'text' | 'list' = 'text';

    if (lines.some(line => line.trim().startsWith('[] ') || line.trim().startsWith('- ') || line.trim().match(/^\[([xX ])\] /))) {
      noteType = 'list';
      lines.forEach(line => {
        const text = line.replace(/^(\[([xX ])\] |\[\] |- )/, '').trim();
        const match = line.match(/^\[([xX])\] /);
        listItems.push({
          id: createId(),
          text: text,
          checked: !!match,
        });
      });
    }
    
    const newNote: Note = { 
      id: createId(), 
      title: title || (noteType === 'list' ? 'List' : 'Untitled Note'), 
      content: noteType === 'text' ? rawContent : '', // Store raw content only for text, list items handle list content
      items: noteType === 'list' ? listItems : undefined,
      type: noteType,
      color: null, 
      imageUrl: imageUrl,
      pinned: false,
      notebookId, 
      folderId, 
      createdAt: new Date().toISOString(), 
      updatedAt: new Date().toISOString(),
      status: 'active',
      deletedAt: null,
    };
    set(state => ({ notes: [newNote, ...state.notes] })); 
    // get().selectNote(newNote.id); // Don't auto-select, let modal handle it
    return newNote;
  },
  updateNote: (noteId, updates) => {
    set(state => ({
      notes: state.notes.map(note => {
        if (note.id === noteId) {
          const updatedNote = { ...note, ...updates, updatedAt: new Date().toISOString() };
          // If content is updated for a list note, and items are not part of the update, re-parse content to items
          if (updates.content && updatedNote.type === 'list' && !updates.items) {
            const lines = updatedNote.content.split('\n');
            const newListItems: NoteListItem[] = [];
            lines.forEach(line => {
              const text = line.replace(/^(\[([xX ])\] |\[\] |- )/, '').trim();
              const match = line.match(/^\[([xX])\] /);
              newListItems.push({
                id: createId(), 
                text: text,
                checked: !!match,
              });
            });
            updatedNote.items = newListItems;
            updatedNote.content = ''; // Clear raw content for list notes if items are primary
          } else if (updatedNote.type === 'list' && updatedNote.items) {
             updatedNote.content = ''; // Ensure raw content is empty for list notes
          }
          return updatedNote;
        }
        return note;
      })
    }));
  },
  deleteNote: (noteId) => { // This is actually "trash note" for now
    get().trashNote(noteId);
  },
  trashNote: (noteId) => {
    set(state => ({
      notes: state.notes.map(note => 
        note.id === noteId ? { ...note, status: 'trashed', deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : note
      ),
      selectedNoteId: state.selectedNoteId === noteId ? null : state.selectedNoteId,
      editingNoteId: state.editingNoteId === noteId ? null : state.editingNoteId,
      highlightedLines: state.highlightedLines?.noteId === noteId ? null : state.highlightedLines,
    }));
  },
  archiveNote: (noteId) => {
    set(state => ({
      notes: state.notes.map(note => 
        note.id === noteId ? { ...note, status: 'archived', updatedAt: new Date().toISOString() } : note
      ),
      selectedNoteId: state.selectedNoteId === noteId ? null : state.selectedNoteId,
      editingNoteId: state.editingNoteId === noteId ? null : state.editingNoteId,
    }));
  },
  restoreNote: (noteId) => { /* To be implemented */ },
  deleteNotePermanently: (noteId) => { /* To be implemented */ },

  deleteFolder: (folderId) => {
    set(state => ({
      folders: state.folders.filter(folder => folder.id !== folderId),
      notes: state.notes.map(note => note.folderId === folderId ? {...note, status: 'trashed', folderId: null, deletedAt: new Date().toISOString()} : note), 
      selectedFolderId: state.selectedFolderId === folderId ? null : state.selectedFolderId,
    }));
  },
  deleteNotebook: (notebookId) => {
    set(state => ({
      notebooks: state.notebooks.filter(nb => nb.id !== notebookId),
      folders: state.folders.filter(folder => folder.notebookId !== notebookId),
      notes: state.notes.map(note => note.notebookId === notebookId ? {...note, status: 'trashed', deletedAt: new Date().toISOString()} : note),
      selectedNotebookId: state.selectedNotebookId === notebookId ? null : state.selectedNotebookId,
    }));
  },
  toggleNoteListItem: (noteId, itemId) => {
    set(state => ({
      notes: state.notes.map(note => {
        if (note.id === noteId && note.type === 'list' && note.items) {
          return {
            ...note,
            items: note.items.map(item =>
              item.id === itemId ? { ...item, checked: !item.checked } : item
            ),
            updatedAt: new Date().toISOString(),
          };
        }
        return note;
      })
    }));
  },
   addNoteListItem: (noteId, text = '', afterItemId) => {
    set(state => ({
      notes: state.notes.map(note => {
        if (note.id === noteId && note.type === 'list') {
          const newItem: NoteListItem = { id: createId(), text, checked: false };
          const items = note.items ? [...note.items] : [];
          if (afterItemId) {
            const index = items.findIndex(item => item.id === afterItemId);
            if (index !== -1) {
              items.splice(index + 1, 0, newItem);
            } else {
              items.push(newItem); // Fallback if afterItemId not found
            }
          } else {
            items.push(newItem);
          }
          return { ...note, items, updatedAt: new Date().toISOString() };
        }
        return note;
      }),
    }));
  },
  updateNoteListItem: (noteId, itemId, text) => {
    set(state => ({
      notes: state.notes.map(note => {
        if (note.id === noteId && note.type === 'list' && note.items) {
          return {
            ...note,
            items: note.items.map(item =>
              item.id === itemId ? { ...item, text } : item
            ),
            updatedAt: new Date().toISOString(),
          };
        }
        return note;
      }),
    }));
  },
  deleteNoteListItem: (noteId, itemId) => {
    set(state => ({
      notes: state.notes.map(note => {
        if (note.id === noteId && note.type === 'list' && note.items) {
          return {
            ...note,
            items: note.items.filter(item => item.id !== itemId),
            updatedAt: new Date().toISOString(),
          };
        }
        return note;
      }),
    }));
  },
  updateNoteColor: (noteId, color) => {
    set(state => ({
      notes: state.notes.map(note =>
        note.id === noteId ? { ...note, color, updatedAt: new Date().toISOString() } : note
      ),
    }));
  },
  updateNoteImage: (noteId, imageUrl) => {
    set(state => ({
      notes: state.notes.map(note =>
        note.id === noteId ? { ...note, imageUrl, updatedAt: new Date().toISOString() } : note
      ),
    }));
  },
  togglePinNote: (noteId) => {
    set(state => ({
      notes: state.notes.map(note =>
        note.id === noteId ? { ...note, pinned: !note.pinned, updatedAt: new Date().toISOString() } : note
      ),
    }));
  },

  selectNotebook: (notebookId) => set({ selectedNotebookId: notebookId, selectedFolderId: null, selectedNoteId: null, highlightedLines: null }),
  selectFolder: (folderId) => {
    const folder = get().folders.find(f => f.id === folderId);
    set({ selectedFolderId: folderId, selectedNotebookId: folder?.notebookId || null, selectedNoteId: null, highlightedLines: null });
  },
  selectNote: (noteId) => { // Primarily used by NoteCard to signal which note to edit
    // const note = get().notes.find(n => n.id === noteId);
    // set({ selectedNoteId: noteId, editingNoteId: noteId, selectedFolderId: note?.folderId || null, selectedNotebookId: note?.notebookId || null, highlightedLines: null });
    get().setEditingNoteId(noteId);
  },
  setEditingNoteId: (noteId) => set({ editingNoteId: noteId }),
  
  importNoteFromFile: async (file, notebookId, folderId = null) => {
    const content = await file.text();
    let title = file.name.replace(/\.[^/.]+$/, ""); 
    let summary = '';
    let imageUrl = null; // No image import from .txt for now

    const lines = content.split('\n');
    const listItems: NoteListItem[] = [];
    let noteType: 'text' | 'list' = 'text';

    if (lines.some(line => line.trim().startsWith('[] ') || line.trim().startsWith('- ') || line.trim().match(/^\[([xX ])\] /))) {
      noteType = 'list';
      lines.forEach(line => {
        const text = line.replace(/^(\[([xX ])\] |\[\] |- )/, '').trim();
        const match = line.match(/^\[([xX])\] /);
        listItems.push({
          id: createId(),
          text: text,
          checked: !!match,
        });
      });
    }
    
    const contentForSummary = noteType === 'list' ? listItems.map(item => item.text).join('\n') : content;

    if (contentForSummary.trim()) {
      try {
        const summaryResult = await importAndSummarize({ noteContent: contentForSummary });
        summary = summaryResult.summary;
        if (summary.length > 0 && title.length < 5) { 
           title = summary.substring(0,50) + (summary.length > 50 ? '...' : '');
        }
      } catch (error) {
        console.error("Error summarizing imported note:", error);
      }
    }
    
    const newNote: Note = { 
      id: createId(), 
      title, 
      content: noteType === 'text' ? content : '',
      items: noteType === 'list' ? listItems : undefined,
      type: noteType,
      summary, 
      color: null, 
      imageUrl,
      pinned: false,
      notebookId, 
      folderId, 
      createdAt: new Date().toISOString(), 
      updatedAt: new Date().toISOString(),
      status: 'active',
      deletedAt: null,
    };
    set(state => ({ notes: [newNote, ...state.notes] }));
    // get().selectNote(newNote.id);
    return newNote;
  },

  queryNotes: async (question) => {
    const userMessage: ChatMessage = {
      id: createId(),
      role: 'user',
      queryText: question,
      content: {}, // No specific content for user message bubble, just queryText
      timestamp: new Date().toISOString(),
    };

    const assistantMessageId = createId();
    const assistantPendingMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: { isLoading: true },
      timestamp: new Date().toISOString(),
    };

    set(state => ({ 
      aiChatHistory: [...state.aiChatHistory, userMessage, assistantPendingMessage],
      isAiLoadingGlobal: true, 
      highlightedLines: null,
      currentAiQuery: '', // Clear input after sending
    }));
    
    const notesToQuery = get().notes
      .filter(note => note.status === 'active') // Only query active notes
      .map(note => ({ 
        title: note.title, 
        content: note.type === 'list' && note.items ? note.items.map(item => `${item.checked ? '[x]' : '[]'} ${item.text}`).join('\n') : note.content 
    }));

    if (notesToQuery.length === 0) {
      const noNotesResponse: ChatMessageContent = { answer: "No active notes available to query.", references: [], isLoading: false };
      set(state => ({
        aiChatHistory: state.aiChatHistory.map(msg => msg.id === assistantMessageId ? {...msg, content: noNotesResponse, timestamp: new Date().toISOString()} : msg),
        isAiLoadingGlobal: false,
      }));
      return;
    }

    try {
      const response = await queryNotesFlow({ question, notes: notesToQuery });
      const successResponse: ChatMessageContent = { ...response, isLoading: false };
      set(state => ({
        aiChatHistory: state.aiChatHistory.map(msg => msg.id === assistantMessageId ? {...msg, content: successResponse, timestamp: new Date().toISOString()} : msg),
        isAiLoadingGlobal: false,
      }));
    } catch (error) {
      console.error("Error querying notes:", error);
      const errorResponse: ChatMessageContent = { error: "Error processing your question.", isLoading: false };
      set(state => ({ 
        aiChatHistory: state.aiChatHistory.map(msg => msg.id === assistantMessageId ? {...msg, content: errorResponse, timestamp: new Date().toISOString()} : msg),
        isAiLoadingGlobal: false,
      }));
    }
  },
  setCurrentAiQuery: (question) => set({ currentAiQuery: question }),
  clearChatHistory: () => set({ aiChatHistory: [], currentAiQuery: '', highlightedLines: null }),
  setHighlightedLines: (noteId, lines) => set({ highlightedLines: { noteId, lines } }),
  clearHighlightedLines: () => set({ highlightedLines: null }),
  setSearchTerm: (term: string) => set({ searchTerm: term }),
  toggleTheme: () => {
    set(state => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return { theme: newTheme };
    });
  },
}));

// Helper to get selected note object for the modal
export const useEditingNote = () => {
  const notes = useNoteWiseStore(state => state.notes);
  const editingNoteId = useNoteWiseStore(state => state.editingNoteId);
  return notes.find(note => note.id === editingNoteId);
};

// Initialize theme from localStorage or system preference
if (typeof window !== 'undefined') {
  const storedTheme = localStorage.getItem("theme") as 'light' | 'dark' | null;
  let initialTheme: 'light' | 'dark' = 'light';
  if (storedTheme) {
    initialTheme = storedTheme;
  } else {
    initialTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  useNoteWiseStore.setState({ theme: initialTheme });
  if (initialTheme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}
