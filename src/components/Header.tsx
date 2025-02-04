import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ShoppingCart, Palette } from 'lucide-react';
import { StyleSelector } from './StyleSelector';
import type { RootState } from '../store/store';

export const Header: React.FC = () => {
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const cartItemCount = useSelector((state: RootState) => state.cart.items.length);

  return (
    <>
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <button
              onClick={() => setShowStyleSelector(true)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Palette className="w-5 h-5" />
              <span>Change Style</span>
            </button>

            <h1 className="text-2xl font-bold text-gray-900">3D BUILDER</h1>

            <Link
              to="/cart"
              className="relative flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
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