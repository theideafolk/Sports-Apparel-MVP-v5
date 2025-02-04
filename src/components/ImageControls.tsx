import React from 'react';

interface ImageControlsProps {
  currentOpacity: number;
  onOpacityChange: (opacity: number) => void;
}

export const ImageControls: React.FC<ImageControlsProps> = ({
  currentOpacity,
  onOpacityChange,
}) => {
  const handleWatermark = () => {
    onOpacityChange(0.2);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <button
          onClick={handleWatermark}
          className={`w-full px-4 py-2 text-sm rounded-md transition-colors font-medium ${
            currentOpacity === 0.2
              ? 'bg-indigo-600 text-white'
              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
          }`}
        >
          Apply as Watermark
        </button>
        {currentOpacity === 0.2 && (
          <button
            onClick={() => onOpacityChange(1)}
            className="w-full px-4 py-2 text-sm bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors font-medium"
          >
            Reset Opacity
          </button>
        )}
      </div>
    </div>
  );
};