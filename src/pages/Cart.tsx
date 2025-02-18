import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Trash2, Code, Edit, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { RootState } from '../store/store';
import { removeFromCart, setCurrentSaveId, updateQuantity } from '../store/cartSlice';
import { loadSavedDecorations, clearDecorations } from '../store/decorationsSlice';
import { loadSavedColors, clearColors } from '../store/colorsSlice';
import { loadSavedDesign, clearDesignSelection } from '../store/designsSlice';
import { setSelectedModel, setDefaultModelForType } from '../store/modelsSlice';
import { setSelectedProductType } from '../store/designsSlice';

export const Cart: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [selectedJson, setSelectedJson] = React.useState<string | null>(null);

  const cartTotal = cartItems.reduce((total, item) => {
    return total + (item.quantity * item.design.price);
  }, 0);

  const handleEdit = async (item: typeof cartItems[0]) => {
    try {
      console.log('8. Loading saved design with pathColors:', item.pathColors);
      
      if (item.pathColors?.length > 0) {
        console.log('9. Loading colors:', item.pathColors);
        dispatch(loadSavedColors(item.pathColors));
      } else {
        console.warn('No pathColors found in saved design');
      }

      // First load the model if available
      if (item.design?.modelId) {
        // Use setSelectedModel
        dispatch(setSelectedModel(item.design.modelId));
      } else {
        console.error('No model ID found in design:', item.design);
      }

      // Then load the design
      await dispatch(loadSavedDesign(item.design.id));
      
      // Load decorations if any
      if (item.decorations?.length > 0) {
        console.log('Loading decorations:', item.decorations);
        dispatch(loadSavedDecorations(item.decorations));
      }
      
      // Set the current save ID
      dispatch(setCurrentSaveId(item.saveId || item.id));
      
      console.log('Navigating to designer with model:', item.design.modelId);
      navigate('/');
    } catch (error) {
      console.error('Error editing design:', error);
    }
  };

  const handleBackToDesigner = () => {
    console.log('1. Starting Back to Designer flow');
    
    // Clear current save ID first
    dispatch(setCurrentSaveId(null));
    console.log('2. Cleared current save ID');
    
    // Clear all decorations and colors
    dispatch(clearDecorations());
    dispatch(clearColors());
    console.log('3. Cleared decorations and colors');
    
    // Set default product type and model
    dispatch(setSelectedProductType('jersey'));
    console.log('4. Set default product type to jersey');
    
    // This will set the default model for jersey type
    dispatch(setDefaultModelForType('jersey'));
    console.log('5. Set default model for jersey');
    
    // Navigate last
    console.log('6. Navigating to designer page');
    navigate('/', { replace: true });
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      dispatch(updateQuantity({ id, quantity: newQuantity }));
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBackToDesigner}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Designer</span>
          </button>
          <h1 className="text-2xl font-bold">Shopping Cart</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Your cart is empty</p>
            <Link
              to="/"
              className="inline-block mt-4 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Start Designing
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start space-x-6">
                  <div className="w-48 h-48 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={item.preview}
                      alt="Design Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{item.design.name} Design</h3>
                        <p className="text-sm text-gray-500">
                          Created {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-gray-400 hover:text-indigo-600 rounded"
                          title="Edit Design"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setSelectedJson(JSON.stringify(item, null, 2))}
                          className="p-2 text-gray-400 hover:text-indigo-600 rounded"
                          title="View JSON"
                        >
                          <Code className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => dispatch(removeFromCart(item.id))}
                          className="p-2 text-gray-400 hover:text-red-600 rounded"
                          title="Remove"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Quantity:</span>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Price per item:</div>
                          <div className="text-lg font-semibold">${item.design.price.toFixed(2)}</div>
                        </div>
                      </div>

                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• {item.decorations.length} decorations added</li>
                        <li>• {item.pathColors.length} colors customized</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {cartItems.length > 0 && (
          <div className="mt-8 flex flex-col items-end border-t pt-6">
            <div className="text-right mb-4">
              <div className="text-sm text-gray-600 mb-1">Cart Total:</div>
              <div className="text-2xl font-bold text-primary-600">
                ${cartTotal.toFixed(2)}
              </div>
            </div>
            <button
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
              onClick={() => {
                // Add checkout logic here
                console.log('Proceeding to checkout');
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        )}

        {selectedJson && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold">Design JSON Data</h3>
                <button
                  onClick={() => setSelectedJson(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
              <pre className="p-4 overflow-auto max-h-[calc(80vh-4rem)] bg-gray-50 font-mono text-sm">
                {selectedJson}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};