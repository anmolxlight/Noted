
"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '../ui/textarea';

export function TakeANoteInput() {
  const [isFocused, setIsFocused] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleFocus = () => setIsFocused(true);
  
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    // Check if the new focused element is part of this component
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      if (!title && !content) {
        setIsFocused(false);
      }
    }
  };

  const handleSave = () => {
    if (title || content) {
      // Logic to save the note (e.g., call a store action)
      console.log("Saving note:", { title, content });
      setTitle('');
      setContent('');
      setIsFocused(false);
      // Potentially add to notes list and re-render
    } else {
      setIsFocused(false);
    }
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
          className="w-full border-none focus-visible:ring-0 py-3 px-4 text-base placeholder:text-muted-foreground"
          readOnly
        />
      </div>
    );
  }

  return (
    <Card className="mx-auto my-8 max-w-xl shadow-lg" onBlur={handleBlur}>
      <CardContent className="p-0">
        <Input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border-none focus-visible:ring-0 py-3 px-4 text-base font-medium"
          autoFocus
        />
        <Textarea
          placeholder="Take a note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border-none focus-visible:ring-0 resize-none min-h-[80px] py-3 px-4 text-sm"
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
