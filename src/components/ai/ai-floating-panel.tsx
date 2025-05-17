
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useNoteWiseStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icons } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types';


interface AiFloatingPanelProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function AiFloatingPanel({ isOpen, onOpenChange }: AiFloatingPanelProps) {
  const {
    currentAiQuery,
    setCurrentAiQuery,
    aiChatHistory,
    queryNotes,
    notes,
    selectNote,
    setHighlightedLines,
    clearChatHistory,
    setEditingNoteId,
  } = useNoteWiseStore();

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [aiChatHistory]);

  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentAiQuery(e.target.value);
  };

  const handleSubmitQuery = () => {
    if (currentAiQuery.trim()) {
      queryNotes(currentAiQuery.trim());
    }
  };

  const handleReferenceClick = (noteTitle: string) => {
    const targetNote = notes.find(n => n.title === noteTitle);
    if (targetNote) {
      setEditingNoteId(targetNote.id); // Open note in modal
      onOpenChange(false); // Close panel
    }
  };

  const handleClearChat = () => {
    clearChatHistory();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-full p-0 flex flex-col h-full">
        <SheetHeader className="p-4 border-b sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <Icons.AI className="h-5 w-5 text-primary" /> AI Assistant
            </SheetTitle>
            <div className="flex items-center gap-1">
              {aiChatHistory.length > 0 && (
                 <Button variant="ghost" size="icon" onClick={handleClearChat} aria-label="Clear chat history">
                    <Icons.Delete className="h-4 w-4" />
                </Button>
              )}
              <SheetClose asChild>
                  <Button variant="ghost" size="icon" aria-label="Close panel">
                      <Icons.Clear className="h-5 w-5" />
                  </Button>
              </SheetClose>
            </div>
          </div>
        </SheetHeader>
        
        <ScrollArea className="flex-grow p-4 space-y-4 bg-muted/20 dark:bg-muted/5" ref={scrollAreaRef}>
          {aiChatHistory.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Icons.Bot className="h-12 w-12 mb-4 text-primary/70" />
              <p className="text-lg font-medium">What can I help with?</p>
              <p className="text-sm">Ask questions about your active notes.</p>
            </div>
          )}
          {aiChatHistory.map((message: ChatMessage) => (
            <div 
              key={message.id} 
              className={cn(
                "flex items-end gap-2 mb-3",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">AI</AvatarFallback>
                </Avatar>
              )}
              <div 
                className={cn(
                  "p-2.5 rounded-lg max-w-[80%] shadow-sm text-sm leading-relaxed break-words",
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-br-none' 
                    : 'bg-background text-foreground rounded-bl-none border'
                )}
              >
                {message.role === 'user' && message.queryText}
                {message.role === 'assistant' && (
                  <>
                    {message.content.isLoading && (
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-3 w-3 rounded-full animate-bounce delay-75" />
                        <Skeleton className="h-3 w-3 rounded-full animate-bounce delay-150" />
                        <Skeleton className="h-3 w-3 rounded-full animate-bounce delay-300" />
                      </div>
                    )}
                    {message.content.error && (
                      <p className="text-destructive">{message.content.error}</p>
                    )}
                    {message.content.answer && (
                      <p className="whitespace-pre-wrap">{message.content.answer}</p>
                    )}
                    {message.content.references && message.content.references.length > 0 && (
                      <>
                        <Separator className="my-2 bg-border/50" />
                        <h4 className="font-medium text-xs mb-1">References:</h4>
                        <ul className="space-y-0.5 list-disc list-inside text-xs">
                          {message.content.references.map((ref, index) => (
                            <li key={index}>
                              <Button
                                variant="link"
                                className="p-0 h-auto text-primary hover:underline text-xs"
                                onClick={() => handleReferenceClick(ref.noteTitle)}
                              >
                                {ref.noteTitle}
                              </Button>
                              {ref.lines && ref.lines.length > 0 && (
                                <span className="text-muted-foreground"> (lines: {ref.lines.join(', ')})</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </>
                )}
              </div>
              {message.role === 'user' && (
                 <Avatar className="h-7 w-7 shrink-0">
                   <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                     <Icons.User className="h-4 w-4" />
                   </AvatarFallback>
                 </Avatar>
              )}
            </div>
          ))}
        </ScrollArea>
        
        <div className="p-3 border-t bg-background sticky bottom-0">
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Ask anything..."
              value={currentAiQuery}
              onChange={handleQuestionChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmitQuery()}
              disabled={useNoteWiseStore.getState().isAiLoadingGlobal}
              className="flex-grow rounded-full px-4 py-2 h-10 text-sm"
            />
            <Button 
              onClick={handleSubmitQuery} 
              disabled={useNoteWiseStore.getState().isAiLoadingGlobal || !currentAiQuery.trim()} 
              size="icon"
              className="rounded-full h-9 w-9 shrink-0"
              aria-label="Send query"
            >
              <Icons.Send className="h-4 w-4" />
            </Button>
          </div>
           <p className="text-xs text-muted-foreground text-center mt-2">
            AI responses by Google Gemini.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
