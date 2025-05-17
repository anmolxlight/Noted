
"use client";

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '../ui/textarea';
import { useNoteWiseStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

export function TakeANoteInput() {
  const [isFocused, setIsFocused] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);

  const addNote = useNoteWiseStore(state => state.addNote);
  const selectedNotebookId = useNoteWiseStore(state => state.selectedNotebookId);
  const selectedFolderId = useNoteWiseStore(state => state.selectedFolderId);
  const { toast } = useToast();

  const handleFocus = () => setIsFocused(true);
  
  const handleClickOutside = (event: MouseEvent) => {
    if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
      if (title || content) {
        handleSave();
      } else {
        setIsFocused(false);
      }
    }
  };

  useEffect(() => {
    if (isFocused) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFocused, title, content]); // Re-add listener if title/content changes to ensure save logic

  const handleSave = () => {
    if (title.trim() || content.trim()) {
      if (!selectedNotebookId) {
        toast({
          title: "Error",
          description: "No notebook selected. Please select or create a notebook first.",
          variant: "destructive",
        });
        return;
      }
      const newNote = addNote(title.trim() || "Untitled Note", selectedNotebookId, selectedFolderId, content.trim());
      toast({
        title: "Note Created",
        description: `"${newNote.title}" has been saved.`,
      });
      setTitle('');
      setContent('');
    }
    setIsFocused(false); // Always unfocus after attempting save or if empty
  };

  if (!isFocused) {
    return (
      <div
        className="mx-auto my-8 max-w-xl shadow-md rounded-lg border border-input cursor-text bg-card"
        onClick={handleFocus}
        onFocus={handleFocus}
        tabIndex={0}
        role="button"
      >
        <Input
          type="text"
          placeholder="Take a note..."
          className="w-full border-none focus-visible:ring-0 py-3 px-4 text-base placeholder:text-muted-foreground bg-transparent"
          readOnly
        />
      </div>
    );
  }

  return (
    <Card className="mx-auto my-8 max-w-xl shadow-lg" ref={cardRef}>
      <CardContent className="p-0">
        <Input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border-none focus-visible:ring-0 py-3 px-4 text-base font-medium bg-transparent"
          autoFocus
        />
        <Textarea
          placeholder="Take a note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border-none focus-visible:ring-0 resize-none min-h-[80px] py-3 px-4 text-sm bg-transparent"
          rows={3}
        />
        <div className="flex justify-between items-center p-2 px-4 border-t">
          <div className="flex gap-1">
            {/* Placeholder for action icons like add reminder, color, image, archive */}
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <Icons.Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <Icons.Archive className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="ghost" onClick={handleSave} className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

