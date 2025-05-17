
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSidebar } from "@/components/ui/sidebar";
import { useNoteWiseStore } from '@/lib/store'; // Import the store

export function AppHeader() {
  const { toggleSidebar, isMobile } = useSidebar();
  const searchTerm = useNoteWiseStore(state => state.searchTerm);
  const setSearchTerm = useNoteWiseStore(state => state.setSearchTerm);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
    setSearchTerm(e.target.value); // Update store immediately or use debounce
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-app-header-background px-4 md:px-6 shrink-0">
      {isMobile && (
         <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
            <Icons.Menu className="h-6 w-6" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
      )}
      <div className="flex items-center gap-2">
        <Icons.Notebook className="h-7 w-7 text-primary" />
        <h1 className="text-xl font-semibold text-foreground">NoteWise AI</h1>
      </div>
      <div className="relative ml-auto flex-1 md:grow-0 max-w-md">
        <Icons.Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search notes..."
          value={localSearchTerm}
          onChange={handleSearchChange}
          className="w-full rounded-lg bg-background pl-8 md:w-[300px] lg:w-[400px]"
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
          <Icons.Refresh className="h-5 w-5" />
          <span className="sr-only">Refresh</span>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
          <Icons.GridView className="h-5 w-5" />
          <span className="sr-only">Grid View</span>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
          <Icons.Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarImage src="https://placehold.co/40x40.png" alt="User Avatar" data-ai-hint="user avatar" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
