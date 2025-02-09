import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { StyleSelector } from './StyleSelector';
import type { RootState } from '../store/store';

export const Header: React.FC = () => {
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const cartItemCount = useSelector((state: RootState) => state.cart.items.length);
  const selectedModel = useSelector((state: RootState) => 
    state.models.models.find(m => m.id === state.models.selectedModelId)
  );
  const selectedDesign = useSelector((state: RootState) => {
    const selectedId = state.designs.selectedDesignId;
    return state.designs.designs.find(d => d.id === selectedId);
  });

  return (
    <>
      <header className="bg-black border-b border-gray-600 shadow-md">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 flex items-center justify-between">
          <div className="h-16 flex items-center justify-between">
            <h1 className="text-2xl font-display font-bold text-white -ml-4">
              ATELIER STUDIO
            </h1>
          </div>

          <div className="flex items-center space-x-8">
            <button
              onClick={() => setShowStyleSelector(true)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors font-bold"
            >
              <span>Products</span>
            </button>

            <button
              onClick={() => window.open('mailto:support@atelierstudio.com')}
              className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors font-bold"
            >
              <span>Support</span>
            </button>

            <Link
              to="/cart"
              className="relative flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {showStyleSelector && (
        <StyleSelector onClose={() => setShowStyleSelector(false)} />
      )}
    </>
  );
};