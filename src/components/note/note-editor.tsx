
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useNoteWiseStore, useSelectedNote } from '@/lib/store';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// This component is not directly used in the new Google Keep-style layout's main page.
// It's kept here as it might be repurposed for a modal/dialog when a note card is clicked for editing.
// The original functionality for line highlighting and autosave is preserved.

export function NoteEditor() {
  const selectedNote = useSelectedNote();
  const updateNote = useNoteWiseStore(state => state.updateNote);
  const highlightedLinesState = useNoteWiseStore(state => state.highlightedLines);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [formattedUpdatedAt, setFormattedUpdatedAt] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
      setFormattedUpdatedAt(new Date(selectedNote.updatedAt).toLocaleString());
      setHasChanges(false);
    } else {
      setTitle('');
      setContent('');
      setFormattedUpdatedAt(null);
      setHasChanges(false);
    }
  }, [selectedNote]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setHasChanges(true);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setHasChanges(true);
  };

  const handleSave = useCallback(() => {
    if (selectedNote && hasChanges) {
      updateNote(selectedNote.id, { title, content });
      setHasChanges(false);
      toast({
        title: "Note Saved",
        description: `"${title}" has been saved.`,
      });
    }
  }, [selectedNote, title, content, updateNote, hasChanges, toast]);
  
  useEffect(() => {
    return () => {
      if (hasChanges && selectedNote) {
        updateNote(selectedNote.id, { title, content });
      }
    };
  }, [hasChanges, selectedNote, title, content, updateNote]);


  if (!selectedNote) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 h-full">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl">No Note Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <Icons.Note className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Select a note to view or edit its content.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const lines = content.split('\n');
  const isNoteHighlighted = highlightedLinesState?.noteId === selectedNote.id;
  const highlightLinesSet = isNoteHighlighted ? new Set(highlightedLinesState.lines.map(l => l - 1)) : new Set<number>();

  return (
    <Card className="h-full flex flex-col shadow-lg rounded-lg overflow-hidden bg-card">
      <CardHeader className="border-b p-4">
        <Input
          value={title}
          onChange={handleTitleChange}
          placeholder="Note Title"
          className="text-xl font-semibold border-0 shadow-none focus-visible:ring-0 p-0 h-auto bg-transparent"
        />
        <CardDescription className="text-xs mt-1">
          Last updated: {formattedUpdatedAt || "Loading..."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-0 relative">
        <ScrollArea className="h-full absolute inset-0">
            {isNoteHighlighted ? (
                 <div className="p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {lines.map((line, index) => (
                        <div 
                            key={index} 
                            className={cn(
                                "min-h-[1.5em] px-2 rounded-sm",
                                highlightLinesSet.has(index) && "bg-accent/30"
                            )}
                        >
                            {line || '\u00A0'}
                        </div>
                    ))}
                 </div>
            ) : (
                <Textarea
                    value={content}
                    onChange={handleContentChange}
                    placeholder="Start typing your note here..."
                    className="h-full w-full border-0 rounded-none resize-none focus-visible:ring-0 p-4 font-mono text-sm leading-relaxed bg-transparent"
                />
            )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-3 flex justify-end">
        <Button onClick={handleSave} disabled={!hasChanges} className="flex items-center gap-2" size="sm">
          <Icons.Save className="h-4 w-4" /> Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
}
