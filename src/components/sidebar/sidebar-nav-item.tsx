"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import type { TreeItem, TreeItemType } from '@/types';
import { cn } from '@/lib/utils';
import { useNoteWiseStore } from '@/lib/store';
import { AddItemDialog } from '../actions/add-item-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';

interface SidebarNavItemProps {
  item: TreeItem;
  level: number;
  onSelect: (item: TreeItem) => void;
  isSelected: boolean;
  children?: React.ReactNode; // For rendering sub-items (folders/notes)
}

export function SidebarNavItem({ item, level, onSelect, isSelected, children }: SidebarNavItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const IconComponent = item.icon || (item.type === 'folder' ? Icons.Folder : item.type === 'note' ? Icons.Note : Icons.Notebook);
  
  const addFolder = useNoteWiseStore(state => state.addFolder);
  const addNote = useNoteWiseStore(state => state.addNote);
  const deleteNotebook = useNoteWiseStore(state => state.deleteNotebook);
  const deleteFolder = useNoteWiseStore(state => state.deleteFolder);
  const deleteNote = useNoteWiseStore(state => state.deleteNote);
  const { toast } = useToast();

  const indentStyle = { paddingLeft: `${level * 1.5}rem` }; // 0.75rem per level

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selection when toggling
    if (item.type === 'notebook' || item.type === 'folder') {
      setIsExpanded(!isExpanded);
    }
  };

  const handleSelect = () => {
    onSelect(item);
    if (item.type === 'notebook' || item.type === 'folder') {
      if(!children) setIsExpanded(true); // Auto-expand if it has no children displayed yet but could
    }
  };

  const handleDelete = () => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`);
    if (confirmDelete) {
      try {
        if (item.type === 'notebook') deleteNotebook(item.id);
        else if (item.type === 'folder') deleteFolder(item.id);
        else if (item.type === 'note') deleteNote(item.id);
        toast({ title: `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} deleted`, description: `"${item.name}" was successfully deleted.` });
      } catch (e) {
        toast({ title: `Error deleting ${item.type}`, description: String(e), variant: "destructive" });
      }
    }
  };

  const canHaveChildren = item.type === 'notebook' || item.type === 'folder';

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "flex items-center justify-between group rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer",
          isSelected && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
        )}
        style={indentStyle}
        onClick={handleSelect}
      >
        <div className="flex items-center gap-2 py-2 flex-grow min-w-0">
          {canHaveChildren && (
            <Button variant="ghost" size="icon" onClick={handleToggleExpand} className="h-6 w-6 p-0 hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">
              {isExpanded ? <Icons.ChevronDown className="h-4 w-4" /> : <Icons.ChevronRight className="h-4 w-4" />}
            </Button>
          )}
          {!canHaveChildren && <div className="w-6 h-6" />} {/* Placeholder for alignment */}
          <IconComponent className={cn("h-4 w-4 flex-shrink-0", isSelected ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/80 group-hover:text-sidebar-accent-foreground")} />
          <span className="text-sm truncate flex-grow" title={item.name}>{item.name}</span>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className={cn("h-6 w-6 p-1 mr-1 opacity-0 group-hover:opacity-100 focus:opacity-100", isSelected && "text-sidebar-primary-foreground hover:bg-sidebar-primary/80")}>
              <Icons.More className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover text-popover-foreground">
            {item.type === 'notebook' && (
              <>
                <AddItemDialog 
                  itemType="folder" 
                  notebookId={item.id}
                  onConfirm={(name) => addFolder(name, item.id)} 
                  trigger={<DropdownMenuItem onSelect={(e)=>e.preventDefault()}>Add Folder</DropdownMenuItem>}
                />
                <AddItemDialog 
                  itemType="note" 
                  notebookId={item.id}
                  onConfirm={(name) => addNote(name, item.id)}
                  trigger={<DropdownMenuItem onSelect={(e)=>e.preventDefault()}>Add Note</DropdownMenuItem>}
                />
              </>
            )}
            {item.type === 'folder' && item.notebookId && (
              <>
               <AddItemDialog 
                  itemType="folder" 
                  notebookId={item.notebookId}
                  parentId={item.id}
                  onConfirm={(name) => addFolder(name, item.notebookId!, item.id)} 
                  trigger={<DropdownMenuItem onSelect={(e)=>e.preventDefault()}>Add Subfolder</DropdownMenuItem>}
                />
                <AddItemDialog 
                  itemType="note" 
                  notebookId={item.notebookId}
                  folderId={item.id}
                  onConfirm={(name) => addNote(name, item.notebookId!, item.id)}
                  trigger={<DropdownMenuItem onSelect={(e)=>e.preventDefault()}>Add Note</DropdownMenuItem>}
                />
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10">
              Delete {item.type}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {canHaveChildren && isExpanded && children && (
        <div className="flex flex-col">{children}</div>
      )}
    </div>
  );
}
