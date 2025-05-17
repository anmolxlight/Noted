
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
      // Client-side date formatting
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
  
  // Autosave on unmount or note change if there are changes
  useEffect(() => {
    return () => {
      if (hasChanges && selectedNote) {
        // This is a bit problematic with strict mode double invocation in dev
        // For a real app, debounce or more sophisticated save logic is needed.
        // For now, simple save on unmount.
        updateNote(selectedNote.id, { title, content });
         // Cannot toast here as component is unmounting.
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
            <p className="text-muted-foreground">Select a note from the sidebar to view or edit its content.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const lines = content.split('\n');
  const isNoteHighlighted = highlightedLinesState?.noteId === selectedNote.id;
  const highlightLinesSet = isNoteHighlighted ? new Set(highlightedLinesState.lines.map(l => l - 1)) : new Set<number>(); // 0-indexed

  return (
    <Card className="h-full flex flex-col shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="border-b">
        <Input
          value={title}
          onChange={handleTitleChange}
          placeholder="Note Title"
          className="text-2xl font-bold border-0 shadow-none focus-visible:ring-0 p-0 h-auto"
        />
        <CardDescription>
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
                                "min-h-[1.5em] px-2 rounded-sm", // Ensure line takes up space
                                highlightLinesSet.has(index) && "bg-accent/30"
                            )}
                        >
                            {line || '\u00A0'} {/* Render non-breaking space for empty lines to maintain height */}
                        </div>
                    ))}
                 </div>
            ) : (
                <Textarea
                    value={content}
                    onChange={handleContentChange}
                    placeholder="Start typing your note here..."
                    className="h-full w-full border-0 rounded-none resize-none focus-visible:ring-0 p-4 font-mono text-sm leading-relaxed"
                />
            )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-4">
        <Button onClick={handleSave} disabled={!hasChanges} className="flex items-center gap-2">
          <Icons.Save className="h-4 w-4" /> Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
}
