"use client";

import React from 'react';
import { useNoteWiseStore } from '@/lib/store';
import type { Notebook, Folder, Note, TreeItem } from '@/types';
import { SidebarNavItem } from './sidebar-nav-item';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { AddItemDialog } from '../actions/add-item-dialog';
import { ImportNoteDialog } from '../actions/import-note-dialog';

export function SidebarNav() {
  const { notebooks, folders, notes, selectedNotebookId, selectedFolderId, selectedNoteId, selectNotebook, selectFolder, selectNote, addNotebook } = useNoteWiseStore();

  const handleSelect = (item: TreeItem) => {
    if (item.type === 'notebook') selectNotebook(item.id);
    else if (item.type === 'folder') selectFolder(item.id);
    else if (item.type === 'note') selectNote(item.id);
  };

  const buildTree = (): TreeItem[] => {
    const notebookTreeItems: TreeItem[] = notebooks.map(nb => ({
      id: nb.id,
      name: nb.name,
      type: 'notebook',
      icon: Icons.Notebook,
      children: buildFolderTree(nb.id, null)
    }));
    return notebookTreeItems;
  };

  const buildFolderTree = (notebookId: string, parentFolderId: string | null): TreeItem[] => {
    const directFolders = folders.filter(f => f.notebookId === notebookId && f.parentId === parentFolderId);
    const directNotes = notes.filter(n => n.notebookId === notebookId && n.folderId === parentFolderId);

    const folderItems: TreeItem[] = directFolders.map(folder => ({
      id: folder.id,
      name: folder.name,
      type: 'folder',
      icon: Icons.Folder,
      notebookId: notebookId,
      parentId: parentFolderId,
      children: buildFolderTree(notebookId, folder.id) // Recursive call for subfolders
    }));
    
    const noteItems: TreeItem[] = directNotes.map(note => ({
      id: note.id,
      name: note.title,
      type: 'note',
      icon: Icons.Note,
      notebookId: notebookId,
      folderId: parentFolderId,
      parentId: parentFolderId, // For selection logic consistency
    }));

    return [...folderItems, ...noteItems];
  };
  
  const renderTreeItems = (items: TreeItem[], level: number): React.ReactNode => {
    return items.map(item => {
      let isSelected = false;
      if (item.type === 'notebook') isSelected = selectedNotebookId === item.id && !selectedFolderId && !selectedNoteId;
      else if (item.type === 'folder') isSelected = selectedFolderId === item.id && !selectedNoteId;
      else if (item.type === 'note') isSelected = selectedNoteId === item.id;
      
      return (
        <SidebarNavItem
          key={item.id}
          item={item}
          level={level}
          onSelect={handleSelect}
          isSelected={isSelected}
        >
          {item.children && item.children.length > 0 ? renderTreeItems(item.children, level + 1) : null}
        </SidebarNavItem>
      );
    });
  };

  const tree = buildTree();

  return (
    <div className="h-full flex flex-col p-2 gap-2">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-lg font-semibold text-sidebar-foreground">Explorer</h2>
        <AddItemDialog 
            itemType="notebook" 
            onConfirm={(name) => addNotebook(name)} 
            trigger={
                <Button variant="ghost" size="icon" className="h-7 w-7 text-sidebar-foreground hover:text-sidebar-accent-foreground">
                    <Icons.Add className="h-5 w-5" />
                </Button>
            }
        />
      </div>
       <ImportNoteDialog notebookId={selectedNotebookId} folderId={selectedFolderId} />

      <ScrollArea className="flex-grow">
        <div className="space-y-1">
          {tree.length > 0 ? renderTreeItems(tree, 0) : (
            <p className="px-2 text-sm text-sidebar-foreground/70">No notebooks yet. Create one to get started!</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
