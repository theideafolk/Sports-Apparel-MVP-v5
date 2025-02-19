import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Type, Image as ImageIcon, Palette, ArrowLeft, Shirt, ShoppingCart, Box, Layout, Columns as Colors, TextIcon, Image } from 'lucide-react';
import { TextControls } from './TextControls';
import { ImageControls } from './ImageControls';
import { ImageUpload } from './ImageUpload';
import { DesignSelector } from './DesignSelector';
import { ColorPalette } from './ColorPalette';
import { DecorationsList } from './DecorationsList';
import { ModelSelector } from './ModelSelector';
import { addToCart } from '../store/cartSlice';
import type { RootState } from '../store/store';
import type { Decoration } from '../store/decorationsSlice';

interface SidebarProps {
  onAddText: () => void;
  onAddImage: (file: File) => void;
  currentView: '2D' | '3D';
  selectedObject: fabric.Object | null;
  onSelectDecoration: (id: string) => void;
  onDeleteDecoration: (id: string) => void;
  onUpdateSelectedObject?: (updates: Partial<fabric.Object> | null) => void;
  fabricCanvas: fabric.Canvas | null;
  onTakeScreenshot: () => Promise<string | undefined>;
  hasSelection: boolean;
  isPlacingImage: boolean;
}

type TabType = 'design' | 'color' | 'text' | 'logo';

export const Sidebar: React.FC<SidebarProps> = ({ 
  onAddText, 
  onAddImage, 
  currentView,
  selectedObject,
  onSelectDecoration,
  onDeleteDecoration,
  onUpdateSelectedObject,
  fabricCanvas,
  onTakeScreenshot,
  hasSelection,
  isPlacingImage,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const pathColors = useSelector((state: RootState) => state.colors.pathColors);
  
  const currentSaveId = useSelector((state: RootState) => state.cart.currentSaveId);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showDesignSelector, setShowDesignSelector] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const isTextObject = selectedObject?.type === 'i-text';
  const [view, setView] = useState(currentView);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<TabType>('design');
  const selectedDesign = useSelector((state: RootState) => {
    const selectedId = state.designs.selectedDesignId;
    return state.designs.designs.find(d => d.id === selectedId);
  });
  const selectedProductType = useSelector((state: RootState) => state.designs.selectedProductType);
  const decorations = useSelector((state: RootState) => state.decorations.items);

  // Move the model selector to component level
  const selectedModel = useSelector((state: RootState) => 
    state.models.models.find(m => m.id === selectedDesign?.modelId)
  );

  const handleBackClick = () => {
    if (onUpdateSelectedObject) {
      onUpdateSelectedObject(null);
    }
  };

  const decorationsList = decorations.map(d => ({
    id: d.id,
    type: d.type,
    preview: d.type === 'text' 
      ? (d.properties as any).text || 'Text'
      : 'Image'
  }));

  const handleSaveDesign = async () => {
    if (!selectedDesign || !fabricCanvas) {
      return;
    }

    try {
      // Store current view state
      const currentView = view;
      
      // Force 3D view and take screenshot
      setView('3D');
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const preview = await onTakeScreenshot() || '';
      
      // Restore previous view
      setView(currentView);

      const objects = fabricCanvas.getObjects();
      const updatedDecorations = objects
        .filter(obj => !obj.data?.isBackground && obj.id)
        .map(obj => {
          const baseProperties = {
            left: obj.left || 0,
            top: obj.top || 0,
            scaleX: obj.scaleX || 1,
            scaleY: obj.scaleY || 1,
            angle: obj.angle || 0,
            opacity: obj.opacity || 1
          };

          if (obj.type === 'i-text') {
            const textObj = obj as fabric.IText;
            return {
              id: obj.id!,
              type: 'text' as const,
              properties: {
                ...baseProperties,
                text: textObj.text || '',
                fontFamily: textObj.fontFamily || 'Arial',
                fill: textObj.fill as string || '#000000',
                strokeWidth: textObj.strokeWidth || 0,
                stroke: textObj.stroke || '#000000'
              }
            };
          } else {
            const imgObj = obj as fabric.Image;
            return {
              id: obj.id!,
              type: 'image' as const,
              properties: {
                ...baseProperties,
                src: imgObj.getSrc()
              }
            };
          }
        });

      const vectorData = JSON.stringify(fabricCanvas.toJSON(['id', 'data', 'opacity']));

      const currentPathColors = Array.isArray(pathColors) ? pathColors : [];

      const newDesign = {
        id: currentSaveId || Date.now().toString(),
        saveId: currentSaveId,
        timestamp: Date.now(),
        design: selectedDesign,
        modelPath: selectedModel?.path,
        pathColors: currentPathColors,
        decorations: updatedDecorations,
        preview,
        vectorData,
        quantity,
      };
      
      dispatch(addToCart(newDesign));
      navigate('/cart');
    } catch (error) {
      console.error('Error saving design:', error);
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'design', label: 'Design', icon: <Layout className="w-5 h-5" /> },
    { id: 'color', label: 'Color', icon: <Colors className="w-5 h-5" /> },
    { id: 'text', label: 'Text', icon: <TextIcon className="w-5 h-5" /> },
    { id: 'logo', label: 'Logo', icon: <Image className="w-5 h-5" /> },
  ];

  return (
    <div className="w-full md:w-96 bg-white h-full border-t md:border-t-0 md:border-l border-gray-200 flex flex-col shadow-lg">
      <div className="flex-1 overflow-y-auto">
        {/* Fixed Header */}
        <div className="p-4 border-b">
          <div className="flex md:block items-center justify-between">
            <h2 className="text-xl font-display font-bold md:mb-4 text-gray-900">
              {isTextObject ? (
                <button 
                  onClick={handleBackClick}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Tools</span>
                </button>
              ) : (
                'Design Tools'
              )}
            </h2>
            
            {!isTextObject && (
              <>
                <div className="grid grid-cols-4 gap-1 mt-4 bg-gray-100 p-1 rounded-lg">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-white shadow-sm text-primary-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {tab.icon}
                      <span className="text-xs mt-1">{tab.label}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-6">
                  {activeTab === 'design' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Select Design</h3>
                          <div className="text-sm text-gray-500">
                            ${selectedDesign?.price.toFixed(2)}
                          </div>
                        </div>
                        <DesignSelector productType={selectedProductType} />
                      </div>
                    </div>
                  )}

                  {activeTab === 'color' && (
                    <div>
                      <ColorPalette />
                    </div>
                  )}

                  {activeTab === 'text' && (
                    <button 
                      onClick={onAddText}
                      className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <Type className="w-5 h-5 text-gray-600" />
                        <span>Add Text</span>
                      </div>
                      <ArrowLeft className="w-4 h-4 rotate-180 text-gray-400" />
                    </button>
                  )}

                  {activeTab === 'logo' && (
                    <button 
                      onClick={() => setShowImageUpload(true)}
                      className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <ImageIcon className="w-5 h-5 text-gray-600" />
                        <span>Add Image</span>
                      </div>
                      <ArrowLeft className="w-4 h-4 rotate-180 text-gray-400" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="p-4">
          {isTextObject && selectedObject && onUpdateSelectedObject && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Text Properties</h3>
              <TextControls
                currentText={(selectedObject as fabric.IText).text || ''}
                currentFont={(selectedObject as fabric.IText).fontFamily || 'Arial'}
                currentColor={(selectedObject as fabric.IText).fill as string || '#000000'}
                currentOutlineWidth={(selectedObject as fabric.IText).strokeWidth || 0}
                currentOutlineColor={(selectedObject as fabric.IText).stroke || '#000000'}
                onTextChange={(text) => onUpdateSelectedObject({ text })}
                onFontChange={(fontFamily) => onUpdateSelectedObject({ fontFamily })}
                onColorChange={(fill) => onUpdateSelectedObject({ fill })}
                onOutlineChange={(width, color) => 
                  onUpdateSelectedObject({ 
                    strokeWidth: width,
                    stroke: color
                  })
                }
              />
            </div>
          )}

          {!isTextObject && <div className="hidden md:block mt-8">
            <h3 className="text-lg font-semibold mb-4">Decorations</h3>
            <DecorationsList
              decorations={decorationsList}
              onSelect={onSelectDecoration}
              onDelete={onDeleteDecoration}
              selectedId={selectedObject?.id}
            />
          </div>}

          {/* Add to Cart Button */}
          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Price per item:</span>
              <span className="text-lg font-semibold text-gray-900">
                ${selectedDesign?.price.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleSaveDesign}
              disabled={hasSelection}
              className={`w-full px-4 py-3 rounded-lg transition-colors ${
                hasSelection 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-medium shadow-md hover:shadow-lg'
              }`}
            >
              {hasSelection ? "Deselect to Add to Cart" : "Add to Cart"}
            </button>
          </div>

        </div>
      </div>

      {/* Modals */}
      {showImageUpload && (
        <ImageUpload
          onClose={() => setShowImageUpload(false)}
          onImageSelect={(file) => {
            onAddImage(file);
            setShowImageUpload(false);
          }}
        />
      )}

      {showModelSelector && (
        <ModelSelector onClose={() => setShowModelSelector(false)} />
      )}
    </div>
  );
};