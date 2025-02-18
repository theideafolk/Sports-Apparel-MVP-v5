import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X } from 'lucide-react';
import type { RootState } from '../store/store';
import { updatePathColor } from '../store/colorsSlice';

const COLORS = [
  { hex: '#000000', name: 'Black' },
  { hex: '#FFFFFF', name: 'White' },
  { hex: '#FF0000', name: 'Red' },
  { hex: '#00FF00', name: 'Green' },
  { hex: '#0000FF', name: 'Blue' },
  { hex: '#FFFF00', name: 'Yellow' },
  { hex: '#FF00FF', name: 'Magenta' },
  { hex: '#00FFFF', name: 'Cyan' },
  { hex: '#FFA500', name: 'Orange' },
  { hex: '#800080', name: 'Purple' },
  { hex: '#008000', name: 'Dark Green' },
  { hex: '#000080', name: 'Navy' },
  { hex: '#800000', name: 'Maroon' },
  { hex: '#808000', name: 'Olive' },
  { hex: '#008080', name: 'Teal' },
];

interface ColorPickerProps {
  currentColor: string;
  onClose: () => void;
  onColorSelect: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  currentColor,
  onClose,
  onColorSelect,
}) => {
  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Choose Color</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-5 gap-3">
          {COLORS.map(({ hex, name }) => (
            <button
              key={hex}
              onClick={() => {
                onColorSelect(hex);
                onClose();
              }}
              className={`group relative aspect-square rounded-lg transition-transform hover:scale-105 ${
                hex === currentColor ? 'ring-2 ring-indigo-600 ring-offset-2' : ''
              }`}
            >
              <div
                className="w-full h-full rounded-lg border border-gray-200"
                style={{
                  backgroundColor: hex,
                  boxShadow: hex === '#FFFFFF' ? 'inset 0 0 0 1px #E5E7EB' : undefined
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/75 text-white text-xs px-2 py-1 rounded">
                  {name}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
export const ColorPalette: React.FC = () => {
  const dispatch = useDispatch();
  const pathColors = useSelector((state: RootState) => state.colors.pathColors);
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-gray-900">Design Colors</h3>
      <div className="max-h-[144px] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {pathColors.map((path) => (
          <div key={path.id} className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{path.name}</span>
            <div className="relative">
              <button
                onClick={() => setActiveColorPicker(activeColorPicker === path.id ? null : path.id)}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 bg-white"
              >
                <div
                  className="w-6 h-6 rounded-full border border-gray-200"
                  style={{
                    backgroundColor: path.fill,
                    boxShadow: path.fill === '#FFFFFF' ? 'inset 0 0 0 1px #E5E7EB' : undefined
                  }}
                />
                <span className="text-sm text-gray-700">
                  {COLORS.find(c => c.hex === path.fill)?.name || 'Custom'}
                </span>
              </button>
              
              {activeColorPicker === path.id && (
                <div className="absolute right-0 z-50">
                  <ColorPicker
                  currentColor={path.fill}
                  onClose={() => setActiveColorPicker(null)}
                  onColorSelect={(color) => {
                    dispatch(updatePathColor({ id: path.id, fill: color }));
                    setActiveColorPicker(null);
                  }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
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