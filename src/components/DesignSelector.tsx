import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X } from 'lucide-react';
import type { RootState } from '../store/store';
import { setSelectedDesign } from '../store/designsSlice';

interface DesignSelectorProps {
  onClose: () => void;
  productType: 'jersey' | 'sock';
}

export const DesignSelector: React.FC<DesignSelectorProps> = ({ onClose, productType }) => {
  const dispatch = useDispatch();
  const selectedModelId = useSelector((state: RootState) => state.models.selectedModelId);
  
  // Filter designs by both productType and modelId
  const designs = useSelector((state: RootState) => 
    state.designs.designs.filter(d => 
      d.productType === productType && 
      d.modelId === selectedModelId
    )
  );
  const selectedDesignId = useSelector((state: RootState) => state.designs.selectedDesignId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Change Design</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {designs.map((design) => (
            <button
              key={design.id}
              onClick={() => {
                dispatch(setSelectedDesign(design.id));
                onClose();
              }}
              className={`relative aspect-square rounded-lg border-2 transition-all hover:border-indigo-500 overflow-hidden ${
                selectedDesignId === design.id 
                  ? 'border-indigo-600 shadow-lg' 
                  : 'border-gray-200'
              }`}
            >
              <img 
                src={design.path} 
                alt={design.name}
                className="w-full h-full object-contain p-4"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                <span className="text-white font-medium">{design.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};