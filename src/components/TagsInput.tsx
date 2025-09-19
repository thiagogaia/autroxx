'use client';

import { useState, KeyboardEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';

interface TagsInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export function TagsInput({ tags, onTagsChange, placeholder = "Digite uma tag e pressione Enter", maxTags = 10 }: TagsInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    
    // Validações
    if (!trimmedTag) return;
    if (tags.includes(trimmedTag)) return;
    if (tags.length >= maxTags) return;
    if (trimmedTag.length > 20) return; // Limite de caracteres por tag

    onTagsChange([...tags, trimmedTag]);
    setInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  const handleAddClick = () => {
    addTag(inputValue);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-input rounded-md bg-background">
        {tags.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex items-center gap-1 px-2 py-1 text-xs"
          >
            {tag}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => removeTag(tag)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        
        {tags.length < maxTags && (
          <div className="flex items-center gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={tags.length === 0 ? placeholder : "Nova tag..."}
              className="border-0 shadow-none focus-visible:ring-0 h-8 min-w-[120px]"
              maxLength={20}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAddClick}
              disabled={!inputValue.trim()}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      <div className="text-xs text-muted-foreground">
        {tags.length}/{maxTags} tags • Pressione Enter ou vírgula para adicionar
      </div>
    </div>
  );
}
