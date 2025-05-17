import { create } from 'zustand';
import type { Notebook, Folder, Note, AIQueryResponse, QueryReference } from '@/types';
import { importAndSummarize } from '@/ai/flows/import-and-summarize';
import { queryNotes as queryNotesFlow } from '@/ai/flows/query-notes';

interface NoteWiseState {
  notebooks: Notebook[];
  folders: Folder[];
  notes: Note[];
  selectedNotebookId: string | null;
  selectedFolderId: string | null;
  selectedNoteId: string | null;
  
  aiQuestion: string;
  aiResponse: AIQueryResponse | null;
  isAiLoading: boolean;
  highlightedLines: { noteId: string; lines: number[] } | null;

  // Actions
  addNotebook: (name: string) => Notebook;
  addFolder: (name: string, notebookId: string, parentId?: string | null) => Folder;
  addNote: (title: string, notebookId: string, folderId?: string | null, content?: string) => Note;
  updateNote: (noteId: string, updates: Partial<Note>) => void;
  deleteNote: (noteId: string) => void;
  deleteFolder: (folderId: string) => void;
  deleteNotebook: (notebookId: string) => void;

  selectNotebook: (notebookId: string | null) => void;
  selectFolder: (folderId: string | null) => void;
  selectNote: (noteId: string | null) => void;

  importNoteFromFile: (file: File, notebookId: string, folderId?: string | null) => Promise<Note | null>;
  queryNotes: (question: string) => Promise<void>;
  setAiQuestion: (question: string) => void;
  clearAiResponse: () => void;
  setHighlightedLines: (noteId: string, lines: number[]) => void;
  clearHighlightedLines: () => void;
}

const createId = () => Math.random().toString(36).substr(2, 9);

const initialNotebookId = createId();
const initialFolderId = createId();
const initialNoteId = createId();

export const useNoteWiseStore = create<NoteWiseState>((set, get) => ({
  notebooks: [{ id: initialNotebookId, name: 'My First Notebook', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
  folders: [{ id: initialFolderId, name: 'General Thoughts', notebookId: initialNotebookId, parentId: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
  notes: [{ id: initialNoteId, title: 'Welcome to NoteWise AI!', content: 'This is your first note.\nStart organizing your thoughts and query them with AI.\nTry asking a question about this note in the AI Panel!', notebookId: initialNotebookId, folderId: initialFolderId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), summary: 'A welcome note.' }],
  selectedNotebookId: initialNotebookId,
  selectedFolderId: initialFolderId,
  selectedNoteId: initialNoteId,
  aiQuestion: '',
  aiResponse: null,
  isAiLoading: false,
  highlightedLines: null,

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
  addNote: (title, notebookId, folderId = null, content = '') => {
    const newNote: Note = { id: createId(), title, content, notebookId, folderId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    set(state => ({ notes: [...state.notes, newNote] }));
    get().selectNote(newNote.id);
    return newNote;
  },
  updateNote: (noteId, updates) => {
    set(state => ({
      notes: state.notes.map(note => note.id === noteId ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note)
    }));
  },
  deleteNote: (noteId) => {
    set(state => ({
      notes: state.notes.filter(note => note.id !== noteId),
      selectedNoteId: state.selectedNoteId === noteId ? null : state.selectedNoteId,
      highlightedLines: state.highlightedLines?.noteId === noteId ? null : state.highlightedLines,
    }));
  },
  deleteFolder: (folderId) => {
    set(state => ({
      folders: state.folders.filter(folder => folder.id !== folderId),
      notes: state.notes.filter(note => note.folderId !== folderId), // Also delete notes in this folder
      selectedFolderId: state.selectedFolderId === folderId ? null : state.selectedFolderId,
      selectedNoteId: state.notes.find(n => n.id === state.selectedNoteId)?.folderId === folderId ? null : state.selectedNoteId,
    }));
  },
  deleteNotebook: (notebookId) => {
    set(state => ({
      notebooks: state.notebooks.filter(nb => nb.id !== notebookId),
      folders: state.folders.filter(folder => folder.notebookId !== notebookId),
      notes: state.notes.filter(note => note.notebookId !== notebookId),
      selectedNotebookId: state.selectedNotebookId === notebookId ? null : state.selectedNotebookId,
      selectedFolderId: state.folders.find(f => f.id === state.selectedFolderId)?.notebookId === notebookId ? null : state.selectedFolderId,
      selectedNoteId: state.notes.find(n => n.id === state.selectedNoteId)?.notebookId === notebookId ? null : state.selectedNoteId,
    }));
  },
  selectNotebook: (notebookId) => set({ selectedNotebookId: notebookId, selectedFolderId: null, selectedNoteId: null, highlightedLines: null }),
  selectFolder: (folderId) => {
    const folder = get().folders.find(f => f.id === folderId);
    set({ selectedFolderId: folderId, selectedNotebookId: folder?.notebookId || null, selectedNoteId: null, highlightedLines: null });
  },
  selectNote: (noteId) => {
    const note = get().notes.find(n => n.id === noteId);
    set({ selectedNoteId: noteId, selectedFolderId: note?.folderId || null, selectedNotebookId: note?.notebookId || null, highlightedLines: null });
  },
  
  importNoteFromFile: async (file, notebookId, folderId = null) => {
    const content = await file.text();
    let title = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
    let summary = '';

    try {
      const summaryResult = await importAndSummarize({ noteContent: content });
      summary = summaryResult.summary;
      // Optionally use summary to improve title if needed, or set it as note's summary
      if (summary.length > 0 && title.length < 5) { // Basic heuristic
         title = summary.substring(0,50) + (summary.length > 50 ? '...' : '');
      }
    } catch (error) {
      console.error("Error summarizing imported note:", error);
      // Proceed without summary
    }
    
    const newNote: Note = { id: createId(), title, content, notebookId, folderId, summary, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    set(state => ({ notes: [...state.notes, newNote] }));
    get().selectNote(newNote.id);
    return newNote;
  },

  queryNotes: async (question) => {
    set({ isAiLoading: true, aiResponse: null, aiQuestion: question, highlightedLines: null });
    const notesToQuery = get().notes.map(note => ({ title: note.title, content: note.content }));
    if (notesToQuery.length === 0) {
      set({ isAiLoading: false, aiResponse: { answer: "No notes available to query.", references: [] } });
      return;
    }
    try {
      const response = await queryNotesFlow({ question, notes: notesToQuery });
      set({ aiResponse: response, isAiLoading: false });
    } catch (error) {
      console.error("Error querying notes:", error);
      set({ aiResponse: { answer: "Error processing your question.", references: [] }, isAiLoading: false });
    }
  },
  setAiQuestion: (question) => set({ aiQuestion: question }),
  clearAiResponse: () => set({ aiResponse: null, aiQuestion: '', highlightedLines: null }),
  setHighlightedLines: (noteId, lines) => set({ highlightedLines: { noteId, lines } }),
  clearHighlightedLines: () => set({ highlightedLines: null }),
}));

// Helper to get selected note object
export const useSelectedNote = () => {
  const notes = useNoteWiseStore(state => state.notes);
  const selectedNoteId = useNoteWiseStore(state => state.selectedNoteId);
  return notes.find(note => note.id === selectedNoteId);
};

// Helper to get items for a notebook
export const useNotebookContents = (notebookId: string | null) => {
  const folders = useNoteWiseStore(state => state.folders);
  const notes = useNoteWiseStore(state => state.notes);
  if (!notebookId) return { foldersInNotebook: [], notesInNotebookRoot: [] };
  
  const foldersInNotebook = folders.filter(f => f.notebookId === notebookId && !f.parentId);
  const notesInNotebookRoot = notes.filter(n => n.notebookId === notebookId && !n.folderId);
  return { foldersInNotebook, notesInNotebookRoot };
};

// Helper to get items for a folder
export const useFolderContents = (folderId: string | null) => {
  const folders = useNoteWiseStore(state => state.folders);
  const notes = useNoteWiseStore(state => state.notes);
  if (!folderId) return { subFolders: [], notesInFolder: [] };

  const subFolders = folders.filter(f => f.parentId === folderId);
  const notesInFolder = notes.filter(n => n.folderId === folderId);
  return { subFolders, notesInFolder };
};

