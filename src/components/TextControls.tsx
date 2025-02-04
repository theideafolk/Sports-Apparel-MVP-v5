import React from 'react';
import { X } from 'lucide-react';

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
  { hex: '#FFC0CB', name: 'Pink' },
  { hex: '#A52A2A', name: 'Brown' },
  { hex: '#808080', name: 'Gray' },
  { hex: '#C0C0C0', name: 'Silver' },
  { hex: '#FFD700', name: 'Gold' }
];

interface ColorPickerProps {
  currentColor: string;
  onChange: (color: string) => void;
  onClose: () => void;
  title: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  currentColor,
  onChange,
  onClose,
  title
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {COLORS.map(({ hex, name }) => (
            <button
              key={hex}
              onClick={() => {
                onChange(hex);
                onClose();
              }}
              className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${
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
    </div>
  );
};

interface TextControlsProps {
  onFontChange: (font: string) => void;
  onOutlineChange: (width: number, color: string) => void;
  onColorChange: (color: string) => void;
  onTextChange: (text: string) => void;
  currentText: string;
  currentFont: string;
  currentColor: string;
  currentOutlineWidth: number;
  currentOutlineColor: string;
}

const fonts = [
  'Arial',
  'Times New Roman',
  'Helvetica',
  'Impact',
  'Comic Sans MS',
  'Georgia',
];

export const TextControls: React.FC<TextControlsProps> = ({
  onFontChange,
  onOutlineChange,
  onColorChange,
  onTextChange,
  currentText,
  currentFont,
  currentColor,
  currentOutlineWidth,
  currentOutlineColor,
}) => {
  const [showOutline, setShowOutline] = React.useState(currentOutlineWidth > 0);
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [showOutlineColorPicker, setShowOutlineColorPicker] = React.useState(false);

  const handleOutlineToggle = (enabled: boolean) => {
    setShowOutline(enabled);
    if (!enabled) {
      onOutlineChange(0, currentOutlineColor);
    } else {
      onOutlineChange(1, currentOutlineColor);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Text Content
        </label>
        <input
          type="text"
          value={currentText}
          onChange={(e) => {
            e.preventDefault();
            const newText = e.target.value;
            requestAnimationFrame(() => {
              onTextChange(newText);
            });
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Font Family
        </label>
        <select
          value={currentFont}
          onChange={(e) => onFontChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          {fonts.map((font) => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color
        </label>
        <button
          onClick={() => setShowColorPicker(true)}
          className="w-full flex items-center space-x-2 p-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <div
            className="w-6 h-6 rounded-full border border-gray-200"
            style={{
              backgroundColor: currentColor,
              boxShadow: currentColor === '#FFFFFF' ? 'inset 0 0 0 1px #E5E7EB' : undefined
            }}
          />
          <span className="text-sm text-gray-700">{COLORS.find(c => c.hex === currentColor)?.name || 'Custom'}</span>
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Outline
          </label>
          <button
            type="button"
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              showOutline ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
            role="switch"
            aria-checked={showOutline}
            onClick={() => handleOutlineToggle(!showOutline)}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                showOutline ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        
        {showOutline && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Width
              </label>
              <input
                type="range"
                value={currentOutlineWidth}
                onChange={(e) => onOutlineChange(Number(e.target.value), currentOutlineColor)}
                min="0"
                max="20"
                step="0.5"
                className="w-full"
              />
              <div className="text-right text-sm text-gray-500">
                {currentOutlineWidth}px
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <button
                onClick={() => setShowOutlineColorPicker(true)}
                className="w-full flex items-center space-x-2 p-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <div
                  className="w-6 h-6 rounded-full border border-gray-200"
                  style={{
                    backgroundColor: currentOutlineColor,
                    boxShadow: currentOutlineColor === '#FFFFFF' ? 'inset 0 0 0 1px #E5E7EB' : undefined
                  }}
                />
                <span className="text-sm text-gray-700">{COLORS.find(c => c.hex === currentOutlineColor)?.name || 'Custom'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {showColorPicker && (
        <ColorPicker
          currentColor={currentColor}
          onChange={onColorChange}
          onClose={() => setShowColorPicker(false)}
          title="Choose Text Color"
        />
      )}

      {showOutlineColorPicker && (
        <ColorPicker
          currentColor={currentOutlineColor}
          onChange={(color) => onOutlineChange(currentOutlineWidth, color)}
          onClose={() => setShowOutlineColorPicker(false)}
          title="Choose Outline Color"
        />
      )}
    </div>
  );
};