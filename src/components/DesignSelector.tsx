import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { RootState } from '../store/store';
import { setSelectedDesign } from '../store/designsSlice';

interface DesignSelectorProps {
  productType: 'jersey' | 'sock';
}

export const DesignSelector: React.FC<DesignSelectorProps> = ({ productType }) => {
  const dispatch = useDispatch();
  const selectedModelId = useSelector((state: RootState) => state.models.selectedModelId);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Show 6 designs per page (2x3 grid)
  
  // Filter designs by both productType and modelId
  const designs = useSelector((state: RootState) => 
    state.designs.designs.filter(d => 
      d.productType === productType && 
      d.modelId === selectedModelId
    )
  );
  const selectedDesignId = useSelector((state: RootState) => state.designs.selectedDesignId);

  // Calculate pagination
  const totalPages = Math.ceil(designs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDesigns = designs.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {currentDesigns.map((design) => (
          <button
            key={design.id}
            onClick={() => dispatch(setSelectedDesign(design.id))}
            className={`relative aspect-[4/3] rounded-lg border-2 transition-all hover:border-indigo-500 overflow-hidden ${
              selectedDesignId === design.id 
                ? 'border-indigo-600 shadow-lg' 
                : 'border-gray-200'
            }`}
          >
            <img 
              src={design.thumbnailPath} 
              alt={design.name}
              className="w-full h-full object-contain p-3"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
              <div className="text-white text-sm font-medium truncate">
                {design.name}
              </div>
              <div className="text-white/80 text-xs">
                ${design.price.toFixed(2)}
              </div>
            </div>
          </button>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`p-1 rounded-md ${
              currentPage === 1 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-md text-sm font-medium ${
                currentPage === page
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`p-1 rounded-md ${
              currentPage === totalPages 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};