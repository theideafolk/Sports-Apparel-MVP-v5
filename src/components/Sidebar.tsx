import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Type, Image, Palette, ArrowLeft, Shirt, ShoppingCart, Box } from 'lucide-react';
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
  pathColors: string[];
}

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
  pathColors
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentSaveId = useSelector((state: RootState) => state.cart.currentSaveId);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showDesignSelector, setShowDesignSelector] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const isTextObject = selectedObject?.type === 'i-text';
  const [view, setView] = useState(currentView);
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
    console.log('Save design initiated');
    if (!selectedDesign || !fabricCanvas) {
      console.log('Missing required data:', { selectedDesign, fabricCanvas });
      return;
    }

    try {
      // Store current view state
      const currentView = view;
      
      // Force 3D view and take screenshot
      setView('3D');
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const preview = await onTakeScreenshot() || '';
      console.log('Screenshot taken:', preview.slice(0, 50) + '...');
      
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
      };

      console.log('Dispatching to cart with design:', newDesign);
      dispatch(addToCart(newDesign));
      navigate('/cart');
    } catch (error) {
      console.error('Error saving design:', error);
    }
  };

  return (
    <div className="w-full md:w-64 bg-white h-full p-4 border-t md:border-t-0 md:border-l border-gray-200 flex flex-col">
      <div className="flex-1">
        <div className="flex md:block items-center justify-between">
          <h2 className="text-xl font-bold md:mb-4">
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
        
          {!isTextObject && <div className="flex md:block space-x-4 md:space-x-0 md:space-y-4">
            <button 
              onClick={onAddText}
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
            >
              <Type className="w-5 h-5" />
              <span className="hidden md:inline">Add Text</span>
            </button>

            <button 
              onClick={() => setShowImageUpload(true)}
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
            >
              <Image className="w-5 h-5" />
              <span className="hidden md:inline">Add Image</span>
            </button>

            <button 
              onClick={() => setShowColorPalette(!showColorPalette)}
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
              title="Change Colors"
            >
              <Palette className="w-5 h-5" />
              <span className="hidden md:inline">Change Colors</span>
            </button>

            <button 
              onClick={() => setShowDesignSelector(true)}
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
              title="Change Design"
            >
              <Shirt className="w-5 h-5" />
              <span className="hidden md:inline">Change Design</span>
            </button>

            <button 
              onClick={() => setShowModelSelector(true)}
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
              title="Change Model"
            >
              <Box className="w-5 h-5" />
              <span className="hidden md:inline">Change Model</span>
            </button>
          </div>}
        </div>

        {showColorPalette && !isTextObject && (
          <div className="mt-6 border-t pt-6">
            <ColorPalette />
          </div>
        )}

        {isTextObject && selectedObject && onUpdateSelectedObject && (
          <div className="mt-6 border-t pt-6">
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
        
        {showImageUpload && (
          <ImageUpload
            onClose={() => setShowImageUpload(false)}
            onImageSelect={(file) => {
              onAddImage(file);
              setShowImageUpload(false);
            }}
          />
        )}

        {showDesignSelector && (
          <DesignSelector
            onClose={() => setShowDesignSelector(false)}
            productType={selectedProductType}
          />
        )}

        {showModelSelector && (
          <ModelSelector onClose={() => setShowModelSelector(false)} />
        )}
      </div>

      <div className="p-4 border-t mt-auto">
        <button
          onClick={handleSaveDesign}
          disabled={hasSelection}
          className={`w-full px-4 py-2 rounded-md transition-colors ${
            hasSelection 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {hasSelection ? "Deselect to Save" : "Save My Design"}
        </button>
      </div>
    </div>
  );
};