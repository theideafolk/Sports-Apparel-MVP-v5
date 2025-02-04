import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X } from 'lucide-react';
import type { RootState } from '../store/store';
import { setSelectedModel } from '../store/modelsSlice';

interface ModelSelectorProps {
  onClose: () => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ onClose }) => {
  const dispatch = useDispatch();
  const selectedProductType = useSelector((state: RootState) => state.designs.selectedProductType);
  const models = useSelector((state: RootState) => 
    state.models.models.filter(m => m.productType === selectedProductType)
  );
  const selectedModelId = useSelector((state: RootState) => state.models.selectedModelId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Change Model</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                dispatch(setSelectedModel(model.id));
                onClose();
              }}
              className={`relative aspect-square rounded-lg border-2 transition-all hover:border-indigo-500 p-4 ${
                selectedModelId === model.id 
                  ? 'border-indigo-600 shadow-lg' 
                  : 'border-gray-200'
              }`}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span className="text-lg font-medium text-center">{model.name}</span>
                <span className="text-sm text-gray-500 mt-2">
                  {model.id.replace(/_/g, ' ')}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}; 