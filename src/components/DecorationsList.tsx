import React from 'react';
import { Type, Image as ImageIcon, Trash2, Edit } from 'lucide-react';
import type { Decoration as ReduxDecoration } from '../store/decorationsSlice';

type DecorationListItem = {
  id: ReduxDecoration['id'];
  type: ReduxDecoration['type'];
  preview: string;
};

interface DecorationsListProps {
  decorations: DecorationListItem[];
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
      {Array.from(uniqueDecorations.values()).map((decoration) => (
        <div
          key={decoration.id}
          className={`flex items-center justify-between p-2 rounded-lg ${
            selectedId === decoration.id
              ? 'bg-indigo-50 border-indigo-200'
              : 'hover:bg-gray-50 border-transparent'
          } border`}
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
              className="p-1 text-gray-400 hover:text-indigo-600 rounded"
              title="Edit in 3D"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(decoration.id)}
              className="p-1 text-gray-400 hover:text-red-600 rounded"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};