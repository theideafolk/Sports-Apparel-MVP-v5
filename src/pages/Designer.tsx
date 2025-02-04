import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Canvas3D } from '../components/Canvas3D';
import { DesignCanvas } from '../components/DesignCanvas';
import { Sidebar } from '../components/Sidebar';
import { CanvasTexture } from 'three';
import { Box as Box3d, Pencil } from 'lucide-react';
import { 
  addDecoration, 
  updateDecoration, 
  removeDecoration, 
  setSelectedDecoration 
} from '../store/decorationsSlice';
import type { RootState } from '../store/store';

export const Designer: React.FC = () => {
  const dispatch = useDispatch();
  const [canvasTexture, setCanvasTexture] = useState<CanvasTexture | null>(null);
  const [view, setView] = useState<'2D' | '3D'>('3D');
  const [hasSelection, setHasSelection] = useState(false);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [designControls, setDesignControls] = useState<{
    addText: () => void;
    addImage: (file: File) => void;
    handleInteraction: (point: { x: number, y: number }) => void;
    updateObject: (updates: Partial<fabric.Object>) => void;
    deleteObject: (object: fabric.Object) => void;
  } | null>(null);

  const decorations = useSelector((state: RootState) => state.decorations.items);

  const handleCanvasUpdate = useCallback((texture: CanvasTexture) => {
    setCanvasTexture(texture);
  }, []);

  const handleDesignInit = useCallback((controls: {
    addText: () => void;
    addImage: (file: File) => void;
    handleInteraction: (point: { x: number, y: number }) => void;
    updateObject: (updates: Partial<fabric.Object>) => void;
    deleteObject: (object: fabric.Object) => void;
    onSelectionChange?: (hasSelection: boolean) => void;
    onObjectSelected?: (object: fabric.Object | null) => void;
    onObjectAdded?: (object: fabric.Object) => void;
    onObjectRemoved?: (object: fabric.Object) => void;
    canvas: fabric.Canvas; // Make canvas required
  }) => {
    setDesignControls(controls);
    setFabricCanvas(controls.canvas); // Store the canvas reference
    controls.onSelectionChange = setHasSelection;
    controls.onObjectSelected = setSelectedObject;
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

  const handleInteract = useCallback((uv: { x: number, y: number }) => {
    if (designControls) {
      designControls.handleInteraction(uv);
    }
  }, [designControls]);

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <div className="flex-1 relative">
        <div className={`absolute inset-0 transition-opacity duration-300 ${view === '3D' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <Canvas3D 
            canvasTexture={canvasTexture} 
            onInteract={handleInteract}
            hasSelection={hasSelection}
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
      </div>
      <div className="h-full">
        <Sidebar 
          onAddText={() => designControls?.addText()}
          onAddImage={(file) => designControls?.addImage(file)}
          currentView={view}
          selectedObject={selectedObject}
          fabricCanvas={fabricCanvas} // Pass the canvas reference
          onSelectDecoration={(id) => {
            setView('3D');
            if (designControls) {
              const decoration = decorations.find(d => d.id === id);
              if (decoration) {
                designControls.updateObject(decoration.properties);
                designControls.handleInteraction({
                  x: decoration.properties.left / 500,
                  y: decoration.properties.top / 500,
                  type: 'mousedown',
                  clientX: 0,
                  clientY: 0
                });
                dispatch(setSelectedDecoration(id));
              }
            }
          }}
          onDeleteDecoration={(id) => {
            if (designControls) {
              dispatch(removeDecoration(id));
            }
          }}
          onUpdateSelectedObject={(updates) => {
            if (designControls && selectedObject && selectedObject.id) {
              if (updates === null) {
                designControls.updateObject(null);
                return;
              }
              
              // Apply updates to the selected object first
              selectedObject.set(updates);
              fabricCanvas?.renderAll();

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
            }
          }}
        />
      </div>
    </div>
  );
};