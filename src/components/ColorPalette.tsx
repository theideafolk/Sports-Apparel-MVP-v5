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
    <div className="absolute z-10 mt-2 p-4 bg-white rounded-lg shadow-xl border border-gray-200">
      <div className="grid grid-cols-5 gap-2">
        {COLORS.map(({ hex, name }) => (
          <button
            key={hex}
            onClick={() => onColorSelect(hex)}
            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
              hex === currentColor ? 'border-blue-500 scale-110' : 'border-gray-200'
            }`}
            style={{
              backgroundColor: hex,
              boxShadow: hex === '#FFFFFF' ? 'inset 0 0 0 1px #E5E7EB' : undefined
            }}
            title={name}
          />
        ))}
      </div>
    </div>
  );
};

export const ColorPalette: React.FC = () => {
  const dispatch = useDispatch();
  const pathColors = useSelector((state: RootState) => state.colors.pathColors);
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Design Colors</h3>
      <div className="space-y-3">
        {pathColors.map((path) => (
          <div key={path.id} className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{path.name}</span>
            <div className="relative">
              <button
                onClick={() => setActiveColorPicker(activeColorPicker === path.id ? null : path.id)}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
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
                <ColorPicker
                  currentColor={path.fill}
                  onClose={() => setActiveColorPicker(null)}
                  onColorSelect={(color) => {
                    dispatch(updatePathColor({ id: path.id, fill: color }));
                    setActiveColorPicker(null);
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};