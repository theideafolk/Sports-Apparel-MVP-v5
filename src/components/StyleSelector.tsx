import React from 'react';
import { useDispatch } from 'react-redux';
import { X } from 'lucide-react';
import { setSelectedProductType } from '../store/designsSlice';
import { setDefaultModelForType } from '../store/modelsSlice';

interface StyleSelectorProps {
  onClose: () => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ onClose }) => {
  const dispatch = useDispatch();

  const handleStyleSelect = (productType: 'jersey' | 'sock') => {
    dispatch(setSelectedProductType(productType));
    dispatch(setDefaultModelForType(productType));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Select Style</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleStyleSelect('jersey')}
            className="aspect-square rounded-lg border-2 border-gray-200 hover:border-indigo-500 transition-all p-4 flex flex-col items-center justify-center"
          >
            <img 
              src="/dist/assets/Designs/Jersey/Classic.svg" 
              alt="Jersey"
              className="w-32 h-32 object-contain mb-2"
            />
            <span className="text-lg font-medium">Jersey</span>
          </button>

          <button
            onClick={() => handleStyleSelect('sock')}
            className="aspect-square rounded-lg border-2 border-gray-200 hover:border-indigo-500 transition-all p-4 flex flex-col items-center justify-center"
          >
            <img 
              src="/dist/assets/Designs/Sock/lines.svg" 
              alt="Socks"
              className="w-32 h-32 object-contain mb-2"
            />
            <span className="text-lg font-medium">Socks</span>
          </button>
        </div>
      </div>
    </div>
  );
};