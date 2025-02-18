import React, { useState } from 'react';
import { Type, ImageIcon, Edit, Trash2 } from 'lucide-react';

interface DecorationsListProps {
  decorations: Array<{
    id: string;
    type: 'text' | 'image';
    preview: string;
  }>;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  selectedId?: string;
}

export const DecorationsList: React.FC<DecorationsListProps> = ({
  decorations,
  onSelect,
  onDelete,
  selectedId
}) => {
  // Create a Map to track unique decorations by ID
  const uniqueDecorations = new Map(
    decorations.map(decoration => [decoration.id, decoration])
  );

  if (uniqueDecorations.size === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        No decorations added yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="max-h-[144px] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 -mr-2">
        {Array.from(uniqueDecorations.values()).map((decoration) => (
          <div
            key={decoration.id}
            className={`flex items-center justify-between p-2 rounded-lg ${
              selectedId === decoration.id
                ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
            } border bg-white`}
          >
            <button
              onClick={() => onSelect(decoration.id)}
              className="flex items-center space-x-3 flex-1"
            >
              {decoration.type === 'text' ? (
                <Type className="w-4 h-4 text-gray-500" />
              ) : (
                <ImageIcon className="w-4 h-4 text-gray-500" />
              )}
              <span className="text-sm text-gray-700 truncate">
                {decoration.preview}
              </span>
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onSelect(decoration.id)}
                className="p-1 text-gray-400 hover:text-indigo-600 rounded transition-colors"
                title="Edit in 3D"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(decoration.id)}
                className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db #f1f1f1;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
};