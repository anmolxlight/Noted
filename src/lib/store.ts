
import { create } from 'zustand';
import type { Notebook, Folder, Note, AIQueryResponse, NoteListItem } from '@/types';
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
  toggleNoteListItem: (noteId: string, itemId: string) => void;
  updateNoteColor: (noteId: string, color: string | null) => void;

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
const initialListNoteId = createId();

export const useNoteWiseStore = create<NoteWiseState>((set, get) => ({
  notebooks: [{ id: initialNotebookId, name: 'My First Notebook', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
  folders: [{ id: initialFolderId, name: 'General Thoughts', notebookId: initialNotebookId, parentId: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
  notes: [
    { id: initialNoteId, title: 'Welcome to NoteWise AI!', content: 'This is your first note.\nStart organizing your thoughts and query them with AI.\nTry asking a question about this note in the AI Panel!', type: 'text', color: null, notebookId: initialNotebookId, folderId: initialFolderId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), summary: 'A welcome note.' },
    { id: initialListNoteId, title: 'My Shopping List', content: '- Milk\n- Eggs []\n- Bread [x]', type: 'list', items: [{id: createId(), text: 'Milk', checked: false}, {id: createId(), text: 'Eggs', checked: false}, {id: createId(), text: 'Bread', checked: true}], color: 'hsl(50, 95%, 90%)', notebookId: initialNotebookId, folderId: initialFolderId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), summary: 'A sample shopping list' }
  ],
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
  addNote: (title, notebookId, folderId = null, rawContent = '') => {
    const lines = rawContent.split('\n');
    const listItems: NoteListItem[] = [];
    let noteType: 'text' | 'list' = 'text';

    if (lines.some(line => line.trim().startsWith('[] ') || line.trim().startsWith('- ') || line.trim().match(/^\[([xX ])\] /))) {
      noteType = 'list';
      lines.forEach(line => {
        const text = line.replace(/^(\[([xX ])\] |\[\] |- )/, '').trim();
        if (text) { // Only add if there's actual text after the prefix
          const match = line.match(/^\[([xX])\] /); // Check for [x] or [X]
          listItems.push({
            id: createId(),
            text: text,
            checked: !!match, 
          });
        } else if (line.trim().startsWith('[] ') || line.trim().startsWith('- ')) { // Handle empty item prefixed lines
           listItems.push({
            id: createId(),
            text: '',
            checked: false,
          });
        }
      });
    }
    
    const newNote: Note = { 
      id: createId(), 
      title, 
      content: rawContent, // Store original raw content
      items: noteType === 'list' ? listItems : undefined,
      type: noteType,
      color: null, // Default to no color
      notebookId, 
      folderId, 
      createdAt: new Date().toISOString(), 
      updatedAt: new Date().toISOString() 
    };
    set(state => ({ notes: [newNote, ...state.notes] })); // Add to the top of the list
    get().selectNote(newNote.id);
    return newNote;
  },
  updateNote: (noteId, updates) => {
    set(state => ({
      notes: state.notes.map(note => {
        if (note.id === noteId) {
          const updatedNote = { ...note, ...updates, updatedAt: new Date().toISOString() };
          // If content is updated for a list note, re-parse items
          if (updates.content && updatedNote.type === 'list') {
            const lines = updatedNote.content.split('\n');
            const newListItems: NoteListItem[] = [];
            lines.forEach(line => {
              const text = line.replace(/^(\[([xX ])\] |\[\] |- )/, '').trim();
               if (text) {
                const match = line.match(/^\[([xX])\] /);
                newListItems.push({
                  id: createId(), // Consider preserving IDs if possible, but for now new IDs
                  text: text,
                  checked: !!match,
                });
              } else if (line.trim().startsWith('[] ') || line.trim().startsWith('- ')) {
                 newListItems.push({
                  id: createId(),
                  text: '',
                  checked: false,
                });
              }
            });
            updatedNote.items = newListItems;
          }
          return updatedNote;
        }
        return note;
      })
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
      notes: state.notes.filter(note => note.folderId !== folderId), 
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
  updateNoteColor: (noteId, color) => {
    set(state => ({
      notes: state.notes.map(note =>
        note.id === noteId ? { ...note, color, updatedAt: new Date().toISOString() } : note
      ),
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
    let title = file.name.replace(/\.[^/.]+$/, ""); 
    let summary = '';

    // Determine if it's a list note from file content
    const lines = content.split('\n');
    const listItems: NoteListItem[] = [];
    let noteType: 'text' | 'list' = 'text';

    if (lines.some(line => line.trim().startsWith('[] ') || line.trim().startsWith('- ') || line.trim().match(/^\[([xX ])\] /))) {
      noteType = 'list';
      lines.forEach(line => {
        const text = line.replace(/^(\[([xX ])\] |\[\] |- )/, '').trim();
        if (text) {
          const match = line.match(/^\[([xX])\] /);
          listItems.push({
            id: createId(),
            text: text,
            checked: !!match,
          });
        } else if (line.trim().startsWith('[] ') || line.trim().startsWith('- ')) {
           listItems.push({
            id: createId(),
            text: '',
            checked: false,
          });
        }
      });
    }
    
    // Generate summary for text notes or potentially from list items
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
      content, // Store raw content
      items: noteType === 'list' ? listItems : undefined,
      type: noteType,
      summary, 
      color: null, // Default to no color for imported notes
      notebookId, 
      folderId, 
      createdAt: new Date().toISOString(), 
      updatedAt: new Date().toISOString() 
    };
    set(state => ({ notes: [newNote, ...state.notes] }));
    get().selectNote(newNote.id);
    return newNote;
  },

  queryNotes: async (question) => {
    set({ isAiLoading: true, aiResponse: null, aiQuestion: question, highlightedLines: null });
    const notesToQuery = get().notes.map(note => ({ 
        title: note.title, 
        content: note.type === 'list' && note.items ? note.items.map(item => `${item.checked ? '[x]' : '[]'} ${item.text}`).join('\n') : note.content 
    }));

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
