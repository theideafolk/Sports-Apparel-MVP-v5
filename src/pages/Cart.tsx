import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Trash2, Code, Edit, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { RootState } from '../store/store';
import { removeFromCart, setCurrentSaveId } from '../store/cartSlice';
import { loadSavedDecorations, clearDecorations } from '../store/decorationsSlice';
import { loadSavedColors, clearColors } from '../store/colorsSlice';
import { loadSavedDesign } from '../store/designsSlice';
import { setSelectedModel } from '../store/modelsSlice';

export const Cart: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [selectedJson, setSelectedJson] = React.useState<string | null>(null);

  const handleEdit = async (item: typeof cartItems[0]) => {
    try {
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
      
      // Load colors if any
      if (item.pathColors?.length > 0) {
        console.log('Loading colors:', item.pathColors);
        dispatch(loadSavedColors(item.pathColors));
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
    // Clear current save ID first
    dispatch(setCurrentSaveId(null));
    
    // Clear all states
    dispatch(clearDecorations());
    dispatch(clearColors());
    
    // Reset product type and model
    dispatch(setSelectedModel('jersey_1'));
    
    // Navigate last
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Designer</span>
          </Link>
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

                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Design Details:</h4>
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