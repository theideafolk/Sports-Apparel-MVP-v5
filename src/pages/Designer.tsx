import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Canvas3D } from '../components/Canvas3D';
import { DesignCanvas } from '../components/DesignCanvas';
import { Sidebar } from '../components/Sidebar';
import { CanvasTexture } from 'three';
import { Box as Box3d, Pencil, ChevronDown } from 'lucide-react';
import { 
  addDecoration, 
  updateDecoration, 
  removeDecoration, 
  setSelectedDecoration 
} from '../store/decorationsSlice';
import { selectModel } from '../store/modelsSlice';
import type { RootState } from '../store/store';
import { debounce } from 'lodash';

export const Designer: React.FC = () => {
  const dispatch = useDispatch();
  const [canvasTexture, setCanvasTexture] = useState<CanvasTexture | null>(null);
  const [view, setView] = useState<'2D' | '3D'>('3D');
  const [hasSelection, setHasSelection] = useState(false);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [designControls, setDesignControls] = useState<{
    addText: (position?: { x: number, y: number }) => void;
    addImage: (file: File) => void;
    handleInteraction: (point: { x: number, y: number }) => void;
    updateObject: (updates: Partial<fabric.Object>) => void;
    deleteObject: (object: fabric.Object) => void;
    onDragStart?: () => void;
    onDragEnd?: () => void;
    onSelectionChange?: (hasSelection: boolean) => void;
  } | null>(null);
  const [isPlacingText, setIsPlacingText] = useState(false);
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [isScreenshotting, setIsScreenshotting] = useState(false);
  const [isPlacingImage, setIsPlacingImage] = useState(false);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [isInTextProperties, setIsInTextProperties] = useState(false);

  const selectedModel = useSelector((state: RootState) => 
    state.models.models.find(m => m.id === state.models.selectedModelId)
  );
  const models = useSelector((state: RootState) => state.models.models);
  const selectedProductType = useSelector((state: RootState) => state.designs.selectedProductType);
  const selectedDesign = useSelector((state: RootState) => {
    const selectedId = state.designs.selectedDesignId;
    return state.designs.designs.find(d => d.id === selectedId);
  });
  const decorations = useSelector((state: RootState) => state.decorations.items);

  const handleCanvasUpdate = useCallback((texture: CanvasTexture) => {
    console.log('Received texture update in Designer');
    setCanvasTexture(texture);
  }, []);

  const handleDesignInit = useCallback((controls: {
    addText: (position?: { x: number, y: number }) => void;
    addImage: (file: File) => void;
    handleInteraction: (point: { x: number, y: number }) => void;
    updateObject: (updates: Partial<fabric.Object>) => void;
    deleteObject: (object: fabric.Object) => void;
    onDragStart?: () => void;
    onDragEnd?: () => void;
    onSelectionChange?: (hasSelection: boolean) => void;
  }) => {
    setDesignControls(controls);
    setFabricCanvas(controls.canvas);
    controls.onSelectionChange = (hasSelection) => {
      console.log('Selection changed:', hasSelection);
      setHasSelection(hasSelection);
    };
    controls.onObjectSelected = setSelectedObject;
    
    // Create stable drag handlers that won't be affected by state updates
    const handleDragStart = () => {
      console.log('Drag started - forcing disable');
      setIsDraggingText(true);
      if (controlsRef.current) {
        controlsRef.current.enabled = false;
        controlsRef.current.update();
      }
    };

    const handleDragEnd = () => {
      console.log('Drag ended - re-enabling');
      setIsDraggingText(false);
      if (controlsRef.current) {
        controlsRef.current.enabled = true;
        controlsRef.current.update();
      }
    };

    controls.onDragStart = handleDragStart;
    controls.onDragEnd = handleDragEnd;
    
    controls.onObjectAdded = (object: fabric.Object) => {
      if (!object.id) {
        const id = Math.random().toString(36).substr(2, 9);
        object.id = id;
        
        const newDecoration = {
          id,
          type: object.type === 'i-text' ? 'text' : 'image',
          properties: {
            left: object.left || 0,
            top: object.top || 0,
            scaleX: object.scaleX || 1,
            scaleY: object.scaleY || 1,
            angle: object.angle || 0,
            ...(object.type === 'i-text' ? {
              text: (object as fabric.IText).text || '',
              fontFamily: (object as fabric.IText).fontFamily || 'Arial',
              fill: (object as fabric.IText).fill as string || '#000000',
              strokeWidth: (object as fabric.IText).strokeWidth || 0,
              stroke: (object as fabric.IText).stroke || '#000000',
            } : {
              src: (object as fabric.Image).getSrc(),
            })
          }
        };
        dispatch(addDecoration(newDecoration));
      }
    };
    controls.onObjectRemoved = (object: fabric.Object) => {
      if (object.id) {
        dispatch(removeDecoration(object.id));
      }
    };
  }, [dispatch]);

  const handleAddText = () => {
    setIsPlacingText(true);
    setView('3D'); // Force 3D view when adding text
  };

  const handleInteract = useCallback((uv: { x: number, y: number }) => {
    if (isPlacingText && designControls) {
      designControls.addText(uv);
      setIsPlacingText(false);
      setIsInTextProperties(true);  // Set text properties mode when adding new text
      
      // Get the most recently added text object
      const lastAddedText = fabricCanvas?.getObjects().filter(obj => 
        obj.type === 'i-text'
      ).pop();
      
      if (lastAddedText) {
        setSelectedObject(lastAddedText);
        fabricCanvas?.setActiveObject(lastAddedText);
        
        // Update Redux state if the object has an ID
        if (lastAddedText.id) {
          dispatch(setSelectedDecoration(lastAddedText.id));
        }
      }
    } else if (isPlacingImage && pendingImageFile && designControls) {
      designControls.addImage(pendingImageFile, uv);
      setIsPlacingImage(false);
      setIsInTextProperties(false);  // Ensure text properties mode is off for images
      setPendingImageFile(null);
    } else if (designControls && !isPlacingText && !isPlacingImage) {
      designControls.handleInteraction(uv);
    }
  }, [isPlacingText, isPlacingImage, designControls, pendingImageFile, fabricCanvas, dispatch]);

  useEffect(() => {
    console.log('Controls disabled:', isPlacingText || isDraggingText);
  }, [isPlacingText, isDraggingText]);

  const handleScreenshot = useCallback(async () => {
    setIsScreenshotting(true);
    await new Promise(resolve => setTimeout(resolve, 100));
    const canvas = document.querySelector('canvas');
    const screenshot = canvas?.toDataURL('image/png');
    setIsScreenshotting(false);
    return screenshot;
  }, []);

  const handleTextUpdate = useCallback(
    debounce((updates: Partial<fabric.Object> | null) => {
      if (updates === null) {
        setIsInTextProperties(false);
        setSelectedObject(null);
        if (fabricCanvas) {
          fabricCanvas.discardActiveObject();
          fabricCanvas.renderAll();
        }
        dispatch(setSelectedDecoration(''));
      } else {
        setIsInTextProperties(true);
        if (designControls && selectedObject && selectedObject.id) {
          // Update fabric object without re-rendering
          selectedObject.set(updates);
          
          if (fabricCanvas) {
            fabricCanvas.setActiveObject(selectedObject);
          }

          // Batch all updates in a single animation frame
          requestAnimationFrame(() => {
            // Update fabric canvas
            if (fabricCanvas) {
              fabricCanvas.renderAll();
            }

            // Update controls and dispatch in same frame
            designControls.updateObject(updates);
            dispatch(updateDecoration({
              id: selectedObject.id,
              properties: {
                ...(selectedObject.type === 'i-text' ? {
                  text: updates.text || (selectedObject as fabric.IText).text,
                  fontFamily: (selectedObject as fabric.IText).fontFamily,
                  fill: (selectedObject as fabric.IText).fill as string,
                  strokeWidth: (selectedObject as fabric.IText).strokeWidth,
                  stroke: (selectedObject as fabric.IText).stroke,
                } : {
                  src: (selectedObject as fabric.Image).getSrc(),
                }),
                left: selectedObject.left,
                top: selectedObject.top,
                scaleX: selectedObject.scaleX,
                scaleY: selectedObject.scaleY,
                angle: selectedObject.angle,
                ...updates
              }
            }));
          });
        }
      }
    }, 32),
    [designControls, selectedObject, fabricCanvas, dispatch]
  );

  const handleImageSelect = (file: File) => {
    setPendingImageFile(file);
    setIsPlacingImage(true);
    setView('3D'); // Force 3D view when adding image
  };

  const handleSelectDecoration = (id: string) => {
    setView('3D');
    if (designControls) {
      const decoration = decorations.find(d => d.id === id);
      if (decoration) {
        // Update object and handle interaction
        designControls.updateObject(decoration.properties);
        designControls.handleInteraction({
          x: decoration.properties.left / 500,
          y: decoration.properties.top / 500,
          type: 'mousedown',
          clientX: 0,
          clientY: 0
        });
        
        // Set selected decoration in Redux
        dispatch(setSelectedDecoration(id));
        
        // Set selected object and text properties state
        if (decoration.type === 'text') {
          const textObject = fabricCanvas?.getObjects().find(obj => obj.id === id);
          if (textObject) {
            setSelectedObject(textObject);
            setIsInTextProperties(true); // Set to true for text objects
          }
        } else {
          setIsInTextProperties(false); // Set to false for non-text objects
        }
      }
    }
  };

  const handleDeleteDecoration = (id: string) => {
    if (designControls) {
      dispatch(removeDecoration(id));
    }
  };

  useEffect(() => {
    if (!selectedObject || selectedObject.type !== 'i-text') {
      setIsInTextProperties(false);
    }
  }, [selectedObject]);

  return (
    <div className="flex h-screen">
      <div className="relative flex-1">
        <div className="absolute top-4 left-4 z-10">
          <div className="relative">
            <select
              value={selectedModel?.id || ''}
              onChange={(e) => dispatch(selectModel(e.target.value))}
              className="appearance-none text-lg font-medium bg-black text-white pl-6 pr-12 py-2 rounded-lg backdrop-blur-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/20 border border-gray-700 hover:bg-gray-900 transition-colors"
            >
              {models.filter(m => m.productType === selectedProductType).map((model) => (
                <option key={model.id} value={model.id} className="bg-gray-900">
                  {model.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white pointer-events-none" />
          </div>
        </div>

        {isPlacingText && (
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            Click anywhere on the jersey to place your text
          </div>
        )}
        <div className={`absolute inset-0 transition-opacity duration-300 
          ${view === '3D' ? 'opacity-100' : 'opacity-0'} 
          ${isPlacingText ? 'cursor-crosshair' : ''}`}>
          <Canvas3D 
            canvasTexture={canvasTexture} 
            onInteract={handleInteract}
            hasSelection={hasSelection}
            disableControls={isPlacingText || isDraggingText || isInTextProperties}
            isScreenshotting={isScreenshotting}
          />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-300 ${view === '2D' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <DesignCanvas 
            onCanvasUpdate={handleCanvasUpdate}
            onInit={handleDesignInit}
          />
        </div>
        <button
          onClick={() => setView(view === '3D' ? '2D' : '3D')}
          className="absolute top-4 right-4 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors z-10"
          title={`Switch to ${view === '3D' ? '2D' : '3D'} view`}
        >
          {view === '3D' ? (
            <Pencil className="w-5 h-5 text-gray-700" />
          ) : (
            <Box3d className="w-5 h-5 text-gray-700" />
          )}
        </button>

        {isPlacingImage && (
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            Click anywhere on the jersey to place your image
          </div>
        )}
      </div>
      <Sidebar
        onAddText={handleAddText}
        onAddImage={handleImageSelect}
        currentView={view}
        selectedObject={selectedObject}
        onSelectDecoration={handleSelectDecoration}
        onDeleteDecoration={handleDeleteDecoration}
        onUpdateSelectedObject={handleTextUpdate}
        fabricCanvas={fabricCanvas}
        onTakeScreenshot={handleScreenshot}
        hasSelection={hasSelection}
        isPlacingImage={isPlacingImage}
      />
    </div>
  );
};