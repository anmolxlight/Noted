
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useNoteWiseStore, useEditingNote } from '@/lib/store';
import type { Note, NoteListItem } from '@/types';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from '@/components/icons';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { NoteColorPopover } from './note-color-popover';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from '../ui/separator';

const createId = () => Math.random().toString(36).substr(2, 9);

export function NoteEditorModal() {
  const editingNote = useNoteWiseStore(state => state.notes.find(n => n.id === state.editingNoteId));
  const setEditingNoteId = useNoteWiseStore(state => state.setEditingNoteId);
  const updateNote = useNoteWiseStore(state => state.updateNote);
  const togglePinNote = useNoteWiseStore(state => state.togglePinNote);
  const trashNote = useNoteWiseStore(state => state.trashNote);
  const updateNoteColor = useNoteWiseStore(state => state.updateNoteColor);
  const addNoteListItem = useNoteWiseStore(state => state.addNoteListItem);
  const updateNoteListItem = useNoteWiseStore(state => state.updateNoteListItem);
  const deleteNoteListItem = useNoteWiseStore(state => state.deleteNoteListItem);
  const toggleNoteListItem = useNoteWiseStore(state => state.toggleNoteListItem);

  const [currentTitle, setCurrentTitle] = useState('');
  const [currentContent, setCurrentContent] = useState('');
  const [currentItems, setCurrentItems] = useState<NoteListItem[]>([]);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [currentColor, setCurrentColor] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [formattedUpdatedAt, setFormattedUpdatedAt] = useState<string | null>(null);
  const [showImageUrlInput, setShowImageUrlInput] = useState(false);
  const [newListItemText, setNewListItemText] = useState('');

  const { toast } = useToast();
  const contentAreaRef = useRef<HTMLDivElement>(null); // For focusing new list items

  useEffect(() => {
    if (editingNote) {
      setCurrentTitle(editingNote.title || '');
      setCurrentContent(editingNote.content || '');
      setCurrentItems(editingNote.items ? JSON.parse(JSON.stringify(editingNote.items)) : []); // Deep copy
      setCurrentImageUrl(editingNote.imageUrl || null);
      setCurrentColor(editingNote.color || null);
      setFormattedUpdatedAt(new Date(editingNote.updatedAt).toLocaleString());
      setShowImageUrlInput(!!editingNote.imageUrl);
      setHasChanges(false); // Reset changes flag when a new note is loaded
    } else {
      // Reset all fields when modal closes or no note is being edited
      setCurrentTitle('');
      setCurrentContent('');
      setCurrentItems([]);
      setCurrentImageUrl(null);
      setCurrentColor(null);
      setShowImageUrlInput(false);
      setNewListItemText('');
      setHasChanges(false);
    }
  }, [editingNote]);

  const markChanges = () => setHasChanges(true);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTitle(e.target.value);
    markChanges();
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentContent(e.target.value);
    markChanges();
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentImageUrl(e.target.value);
    markChanges();
  };
  
  const handleColorChange = (color: string | null) => {
    if (!editingNote) return;
    updateNoteColor(editingNote.id, color); // Update store immediately for live preview in modal
    setCurrentColor(color); // Update local state for consistency
    markChanges(); // Mark changes to ensure it's part of the main save
     toast({ title: "Color Updated", description: "Note color has been changed." });
  };

  const handlePinToggle = () => {
    if (!editingNote) return;
    togglePinNote(editingNote.id);
    // Pinned status is directly updated in the store, no local state needed for this
    toast({ title: editingNote.pinned ? "Note Unpinned" : "Note Pinned" });
  };

  const handleDeleteNote = () => {
    if (!editingNote) return;
    trashNote(editingNote.id);
    toast({ title: "Note Deleted", description: `"${editingNote.title}" moved to trash.` });
    setEditingNoteId(null); // Close modal after deleting
  };

  // List Item Handlers
  const handleItemTextChange = (itemId: string, newText: string) => {
    setCurrentItems(prevItems => prevItems.map(item => item.id === itemId ? { ...item, text: newText } : item));
    markChanges();
  };

  const handleItemCheckedChange = (itemId: string) => {
    if (!editingNote) return;
    // For visual feedback, toggle directly in local state first if preferred, then sync on save,
    // or call store action directly if live update is desired.
    // For consistency with other store updates, we'll update local state and save on close.
    setCurrentItems(prevItems => prevItems.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item));
    markChanges();
  };

  const handleAddListItem = () => {
    if (!editingNote || !newListItemText.trim()) return;
    const newItem: NoteListItem = { id: createId(), text: newListItemText.trim(), checked: false };
    setCurrentItems(prevItems => [...prevItems, newItem]);
    setNewListItemText(''); // Clear input
    markChanges();
    // Optionally, focus the new item or the input again.
    // For now, just adding, focus management can be complex.
  };
  
  const handleDeleteListItem = (itemId: string) => {
    setCurrentItems(prevItems => prevItems.filter(item => item.id !== itemId));
    markChanges();
  };


  const handleSaveChanges = useCallback(() => {
    if (!editingNote || !hasChanges) return false;

    const updatedNoteData: Partial<Note> = {
      title: currentTitle,
      content: editingNote.type === 'text' ? currentContent : '', // List notes derive content from items
      items: editingNote.type === 'list' ? currentItems : undefined,
      imageUrl: currentImageUrl,
      color: currentColor, // Color is now managed by local state and synced
      updatedAt: new Date().toISOString(),
    };
    
    updateNote(editingNote.id, updatedNoteData);
    toast({ title: "Note Saved", description: `"${currentTitle || 'Untitled Note'}" has been updated.` });
    setHasChanges(false);
    return true; // Indicate changes were saved
  }, [editingNote, currentTitle, currentContent, currentItems, currentImageUrl, currentColor, updateNote, toast, hasChanges]);


  const handleCloseAttempt = (open: boolean) => {
    if (!open) { // Dialog is attempting to close
      handleSaveChanges(); // Save changes if any
      setEditingNoteId(null); // Then close the modal by clearing the ID in store
    }
    // If open is true, it means the dialog is opening, no action needed here
    // as it's controlled by `editingNoteId` from the store.
  };


  if (!editingNote) {
    return null;
  }

  return (
    <Dialog open={!!editingNote} onOpenChange={handleCloseAttempt}>
      <DialogContent 
        className="sm:max-w-lg p-0 flex flex-col max-h-[90vh]" 
        style={{ backgroundColor: currentColor || undefined }}
        onPointerDownOutside={(e) => {
          // If interacting with a popover (like color picker), don't close modal.
          if ((e.target as HTMLElement).closest('[data-radix-popper-content-wrapper]')) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
             if ((e.target as HTMLElement).closest('[data-radix-popper-content-wrapper]')) {
                e.preventDefault();
            }
        }}
      >
        {/* Header: Title and Pin/Bell */}
        <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-2">
          <Input
            value={currentTitle}
            onChange={handleTitleChange}
            placeholder="Title"
            className="text-lg font-medium border-none shadow-none focus-visible:ring-0 p-0 h-auto flex-grow bg-transparent placeholder:text-foreground/60"
          />
          <div className="flex-shrink-0 flex items-center">
            <Button variant="ghost" size="icon" onClick={handlePinToggle} className="h-8 w-8 text-muted-foreground hover:text-foreground">
              {editingNote.pinned ? <Icons.PinOff className="h-5 w-5 text-primary" /> : <Icons.Pin className="h-5 w-5" />}
            </Button>
             {/* Placeholder Bell Icon */}
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Icons.Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Image Area */}
        {currentImageUrl && (
          <div className="relative w-full aspect-[16/9] overflow-hidden my-2 px-4">
            <Image src={currentImageUrl} alt={currentTitle || "Note image"} layout="fill" objectFit="cover" data-ai-hint="note image" />
          </div>
        )}
        {showImageUrlInput && !currentImageUrl && (
            <div className="px-4 pb-2 pt-1">
                <Input
                    type="text"
                    placeholder="Image URL"
                    value={currentImageUrl || ''}
                    onChange={handleImageUrlChange}
                    className="h-8 text-sm"
                />
            </div>
        )}


        {/* Content Area */}
        <ScrollArea className="flex-grow min-h-[150px] px-4 pb-2" ref={contentAreaRef}>
          {editingNote.type === 'list' ? (
            <div className="space-y-2 mt-1">
              {currentItems.map((item, index) => (
                <div key={item.id || index} className="flex items-center gap-2 group">
                  <Checkbox
                    id={`modal-item-${item.id}`}
                    checked={item.checked}
                    onCheckedChange={() => handleItemCheckedChange(item.id)}
                    className="shrink-0 border-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Input
                    value={item.text}
                    onChange={(e) => handleItemTextChange(item.id, e.target.value)}
                    placeholder="List item"
                    className={cn(
                      "h-auto p-0 border-none focus-visible:ring-0 bg-transparent text-sm flex-grow",
                      item.checked && "line-through text-muted-foreground"
                    )}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteListItem(item.id)}
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                    aria-label="Delete item"
                  >
                    <Icons.Clear className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center gap-2 pl-6">
                <Input
                    value={newListItemText}
                    onChange={(e) => setNewListItemText(e.target.value)}
                    placeholder="Add item"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddListItem()}
                    className="h-auto p-0 border-none focus-visible:ring-0 bg-transparent text-sm flex-grow"
                />
                <Button variant="ghost" size="sm" onClick={handleAddListItem} className="text-xs h-7">Add</Button>
              </div>
            </div>
          ) : (
            <Textarea
              value={currentContent}
              onChange={handleContentChange}
              placeholder="Take a note..."
              className="h-full min-h-[150px] w-full border-none shadow-none focus-visible:ring-0 p-0 resize-none text-sm bg-transparent placeholder:text-foreground/60"
            />
          )}
        </ScrollArea>

        {/* Footer Toolbar */}
        <div className="flex items-center justify-between gap-1 p-2 border-t border-border/50">
          <div className="flex items-center gap-0.5">
             {/* Placeholder Icons */}
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" aria-label="Reminders (placeholder)">
              <Icons.Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" aria-label="Collaborators (placeholder)">
              <Icons.UserPlus className="h-4 w-4" />
            </Button>
            <NoteColorPopover note={editingNote} onOpenChange={() => {}} >
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" aria-label="Change color">
                    <Icons.Palette className="h-4 w-4" />
                </Button>
            </NoteColorPopover>
             <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" 
                onClick={() => setShowImageUrlInput(prev => !prev)} 
                aria-label={showImageUrlInput ? "Hide image URL input" : "Show image URL input"}>
              <Icons.Image className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" aria-label="Archive (placeholder)">
              <Icons.Archive className="h-4 w-4" />
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" aria-label="More options">
                        <Icons.More className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleDeleteNote();}}>
                        <Icons.Trash className="mr-2 h-4 w-4" /> Delete note
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()} disabled>
                        <Icons.Copy className="mr-2 h-4 w-4" /> Make a copy
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
             {/* Placeholder Undo/Redo */}
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" aria-label="Undo (placeholder)" disabled>
              <Icons.Undo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" aria-label="Redo (placeholder)" disabled>
              <Icons.Redo className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center">
            <span className="text-xs text-muted-foreground mr-3">
              Edited {formattedUpdatedAt}
            </span>
            <Button variant="ghost" size="sm" onClick={() => handleCloseAttempt(false)} className="h-8">Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

    