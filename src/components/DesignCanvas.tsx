import React, { useRef, useEffect, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import { CanvasTexture } from 'three';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store/store';
import { setPathColors } from '../store/colorsSlice';
import { updateDecoration } from '../store/decorationsSlice';
import { debounce } from 'lodash';

interface DesignCanvasProps {
  onCanvasUpdate: (texture: CanvasTexture) => void;
  onInit: (controls: {
    addText: () => void;
    addImage: (file: File) => void;
    onSelectionChange?: (hasSelection: boolean) => void;
    onObjectSelected?: (object: fabric.Object | null) => void;
    onObjectAdded?: (object: fabric.Object) => void;
    onObjectRemoved?: (object: fabric.Object) => void;
    handleInteraction: (point: { 
      x: number;
      y: number;
      type: string;
      clientX: number;
      clientY: number;
    }) => void;
    updateObject: (updates: Partial<fabric.Object> | null) => void;
    deleteObject: (object: fabric.Object) => void;
    loadVectorData?: (data: string) => void;
    canvas: fabric.Canvas;
    onDragStart?: () => void;
    onDragEnd?: () => void;
  }) => void;
  vectorData?: string;
}

export const DesignCanvas: React.FC<DesignCanvasProps> = ({ 
  onCanvasUpdate, 
  onInit,
  vectorData 
}) => {
  const dispatch = useDispatch();
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<any>({});
  const selectionChangeCallbackRef = useRef<((hasSelection: boolean) => void) | undefined>();
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [isDesignLoaded, setIsDesignLoaded] = useState(false);
  
  const selectedDesignPath = useSelector((state: RootState) => 
    state.designs.designs.find(d => d.id === state.designs.selectedDesignId)?.path
  );
  const pathColors = useSelector((state: RootState) => state.colors.pathColors);
  const decorations = useSelector((state: RootState) => state.decorations.items);

  // Add state to track text positions
  const storedPositionsRef = useRef<Map<string, any>>(new Map());
  const isEditingRef = useRef<boolean>(false);

  const updateObjectState = useCallback((obj: fabric.Object) => {
    if (!obj || !obj.id) return;

    const currentState = {
      left: obj.left,
      top: obj.top,
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
      angle: obj.angle,
      opacity: obj.opacity,
      ...(obj.type === 'i-text' ? {
        text: (obj as fabric.IText).text,
        fontFamily: (obj as fabric.IText).fontFamily,
        fill: (obj as fabric.IText).fill as string,
        strokeWidth: (obj as fabric.IText).strokeWidth,
        stroke: (obj as fabric.IText).stroke,
      } : {
        src: (obj as fabric.Image).getSrc(),
      })
    };

    Object.keys(currentState).forEach(key => {
      if (currentState[key] === undefined) {
        delete currentState[key];
      }
    });

    dispatch(updateDecoration({
      id: obj.id,
      properties: currentState
    }));
  }, [dispatch]);

  const debouncedUpdateObjectState = useCallback(
    debounce((obj: fabric.Object) => updateObjectState(obj), 100),
    [updateObjectState]
  );

  const updateTexture = useCallback(
    debounce(() => {
      if (!fabricCanvasRef.current?.getElement()) return;
      
      try {
        // Batch texture updates in requestAnimationFrame
        window.requestAnimationFrame(() => {
          const texture = new CanvasTexture(fabricCanvasRef.current.getElement());
          texture.needsUpdate = true;
          onCanvasUpdate(texture);
        });
      } catch (error) {
        console.error('Error updating texture:', error);
      }
    }, 100), // Increase debounce time
    [onCanvasUpdate]
  );

  const applyColors = useCallback((design: fabric.Group) => {
    if (!design || !design.getObjects) return;
    
    const paths = (design as fabric.Group).getObjects() as fabric.Path[];
    if (!paths || paths.length === 0) return;
    
    paths.forEach((path, index) => {
      const pathId = `path-${index}`;
      const color = pathColors.find(c => c.id === pathId);
      if (color) {
        path.set('fill', color.fill);
      }
    });
    
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.renderAll();
      updateTexture();
    }
  }, [pathColors, updateTexture]);

  const loadDesign = useCallback(async (canvas: fabric.Canvas, path: string) => {
    console.log('1. Starting loadDesign with path:', path);
    return new Promise<void>((resolve) => {
      canvas.clear();

      fabric.loadSVGFromURL(path, (objects, options) => {
        if (objects && objects.length > 0) {
          const colorableObjects = objects.filter(obj => 
            (obj.type === 'path' || obj.type === 'rect') && 
            obj.fill && 
            typeof obj.fill === 'string'
          );
          
          console.log('2. Found colorable objects:', colorableObjects.length);
          
          if (pathColors.length === 0 || colorableObjects.length !== pathColors.length) {
            const colors = colorableObjects.map((obj, index) => ({
              id: `path-${index}`,
              name: `Path ${index + 1}`,
              fill: obj.fill as string || '#000000'
            }));
            console.log('3. Initializing colors:', colors);
            dispatch(setPathColors(colors));
          }
        }  

        if (!objects || objects.length === 0) {
          console.error('No SVG objects loaded');
          resolve();
          return;
        }

        const design = fabric.util.groupSVGElements(objects, options);
        design.set({
          left: 0,
          top: 0,
          selectable: false,
          evented: false,
          data: { isBackground: true }
        });
        
        const scaleX = canvas.width! / design.width!;
        const scaleY = canvas.height! / design.height!;
        const scale = Math.min(scaleX, scaleY);
        
        design.scale(scale);
        design.center();
        
        canvas.add(design);
        canvas.sendToBack(design);
        applyColors(design);
        
        canvas.renderAll();
        updateTexture();
        setIsDesignLoaded(true);
        resolve();
      });
    });
  }, [dispatch, pathColors, applyColors, updateTexture]);

  const loadVectorData = useCallback((data: string) => {
    if (!fabricCanvasRef.current || !isDesignLoaded) return;

    try {
      const canvas = fabricCanvasRef.current;
      const jsonData = JSON.parse(data);
      
      const objects = canvas.getObjects();
      objects.forEach(obj => {
        if (!obj.data?.isBackground) {
          canvas.remove(obj);
        }
      });

      const existingObjects = new Map();

      canvas.loadFromJSON(jsonData, () => {
        canvas.getObjects().forEach(obj => {
          if (!obj.data?.isBackground) {
            if (obj.id && existingObjects.has(obj.id)) {
              canvas.remove(obj);
              return;
            }

            obj.set({
              lockSkewingX: true,
              lockSkewingY: true,
              centeredScaling: true,
              snapAngle: 5,
              cornerStyle: 'circle',
              transparentCorners: false,
              cornerColor: '#1976D2',
              cornerSize: 10,
              padding: 10,
              borderColor: '#1976D2',
              borderScaleFactor: 2,
              opacity: obj.opacity || 1
            });

            if (obj.type === 'i-text') {
              (obj as fabric.IText).set({
                editable: false
              });
            }

            if (obj.id) {
              existingObjects.set(obj.id, obj);
            }
          }
        });

        canvas.getObjects().forEach(obj => {
          if (!obj.data?.isBackground && obj.id) {
            const decoration = decorations.find(d => d.id === obj.id);
            if (!decoration) {
              controlsRef.current.onObjectAdded?.(obj);
            }
          }
        });

        canvas.renderAll();
        updateTexture();
      });
    } catch (error) {
      console.error('Error loading vector data:', error);
    }
  }, [isDesignLoaded, updateTexture, decorations]);

  const addText = useCallback((position?: { x: number, y: number }) => {
    if (fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;
      const text = new fabric.IText('Edit me', {
        left: position ? position.x * canvas.width! : 100,
        top: position ? position.y * canvas.height! : 100,
        fontSize: 24,
        fontFamily: 'Arial',
        fill: '#000000',
        editable: true,
        lockSkewingX: true,
        lockSkewingY: true,
        centeredScaling: true,
        scaleX: 0.5,
        scaleY: 0.5,
        snapAngle: 5,
        cornerStyle: 'circle',
        transparentCorners: false,
        cornerColor: '#1976D2',
        cornerSize: 10,
        padding: 10,
        borderColor: '#1976D2',
        borderScaleFactor: 2
      });
      
      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();
      controlsRef.current.onObjectAdded?.(text);
      updateTexture();
    }
  }, [updateTexture]);

  const addImage = useCallback((file: File, position?: { x: number, y: number }) => {
    if (fabricCanvasRef.current) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          if (fabricCanvasRef.current) {
            const fabricImage = new fabric.Image(img, {
              left: position ? position.x * fabricCanvasRef.current.width! : 100,
              top: position ? position.y * fabricCanvasRef.current.height! : 100,
              lockSkewingX: true,
              lockSkewingY: true,
              centeredScaling: true,
              snapAngle: 5,
              cornerStyle: 'circle',
              transparentCorners: false,
              cornerColor: '#1976D2',
              cornerSize: 10,
              padding: 10,
              borderColor: '#1976D2',
              borderScaleFactor: 2
            });
            // Set smaller default size
            fabricImage.scaleToWidth(50);
            fabricCanvasRef.current.add(fabricImage);
            fabricCanvasRef.current.setActiveObject(fabricImage);
            controlsRef.current.onObjectAdded?.(fabricImage);
            fabricCanvasRef.current.renderAll();
            updateTexture();
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }, [updateTexture]);

  const handleInteraction = useCallback((point: { 
    x: number;
    y: number;
    type: string;
    clientX: number;
    clientY: number;
  }) => {
    if (fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;
      const width = canvas.getWidth();
      const height = canvas.getHeight();
      
      const canvasX = point.x * width;
      const canvasY = point.y * height;
            
      if (canvas.getElement()) {
        const rect = canvas.getElement().getBoundingClientRect();
        
        const fabricEvent = {
          clientX: rect.left + canvasX,
          clientY: rect.top + canvasY,
          target: canvas.getElement(),
          preventDefault: () => {},
          stopPropagation: () => {},
          type: point.type,
          offsetX: canvasX,
          offsetY: canvasY,
          which: 1
        } as any;

        if (point.type === 'mousedown') {
          const target = canvas.findTarget(fabricEvent);
          if (target) {
            if (target !== canvas.getActiveObject()) {
              canvas.setActiveObject(target);
              selectionChangeCallbackRef.current?.(true);
            }
            canvas.__onMouseDown(fabricEvent);
          } else {
            canvas.discardActiveObject();
            selectionChangeCallbackRef.current?.(false);
          }
        } else if (point.type === 'mousemove') {
          if (canvas.getActiveObject()) {
            selectionChangeCallbackRef.current?.(true);
          }
          canvas.__onMouseMove(fabricEvent);
        } else if (point.type === 'mouseup') {
          if (canvas.getActiveObject()) {
            selectionChangeCallbackRef.current?.(true);
          }
          canvas.__onMouseUp(fabricEvent);
        }
        
        canvas.renderAll();
        requestAnimationFrame(updateTexture);
      }
    }
  }, [updateTexture]);

  const updateObject = useCallback((updates: Partial<fabric.Object> | null) => {
    if (fabricCanvasRef.current) {
      if (updates === null) {
        fabricCanvasRef.current.discardActiveObject();
        fabricCanvasRef.current.renderAll();
        updateTexture();
        return;
      }
      
      const activeObject = fabricCanvasRef.current.getActiveObject();
      if (activeObject) {
        // For text objects, ensure text content is updated
        if (updates.text !== undefined && activeObject.type === 'i-text') {
          (activeObject as fabric.IText).text = updates.text;
        }
        activeObject.set(updates);
        fabricCanvasRef.current.renderAll();
        updateTexture();
      }
    }
  }, [updateTexture]);

  const deleteObject = useCallback((object: fabric.Object) => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.remove(object);
      controlsRef.current.onObjectRemoved?.(object);
      fabricCanvasRef.current.renderAll();
      updateTexture();
    }
  }, [updateTexture]);

  const recreateFromProperties = useCallback((type: string, properties: any) => {
    if (!fabricCanvasRef.current) return;

    const existingObject = fabricCanvasRef.current.getObjects().find(obj => obj.id === properties.id);
    if (existingObject) {
      existingObject.set({
        left: properties.left,
        top: properties.top,
        scaleX: properties.scaleX,
        scaleY: properties.scaleY,
        angle: properties.angle,
        opacity: properties.opacity || 1,
        ...(type === 'text' ? {
          text: properties.text,
          fontFamily: properties.fontFamily,
          fill: properties.fill,
          strokeWidth: properties.strokeWidth,
          stroke: properties.stroke
        } : {})
      });
      fabricCanvasRef.current.renderAll();
      updateTexture();
      return;
    }

    const commonProps = {
      id: properties.id,
      left: properties.left,
      top: properties.top,
      scaleX: properties.scaleX,
      scaleY: properties.scaleY,
      angle: properties.angle,
      opacity: properties.opacity || 1,
      editable: false,
      lockSkewingX: true,
      lockSkewingY: true,
      centeredScaling: true,
      snapAngle: 5,
      cornerStyle: 'circle',
      transparentCorners: false,
      cornerColor: '#1976D2',
      cornerSize: 10,
      padding: 10,
      borderColor: '#1976D2',
      borderScaleFactor: 2
    };

    if (type === 'text') {
      const text = new fabric.IText(properties.text || 'Text', {
        ...commonProps,
        fontFamily: properties.fontFamily,
        fill: properties.fill,
        strokeWidth: properties.strokeWidth,
        stroke: properties.stroke
      });

      fabricCanvasRef.current.add(text);
      fabricCanvasRef.current.renderAll();
      updateTexture();
    } else if (type === 'image') {
      fabric.Image.fromURL(properties.src, (img) => {
        if (fabricCanvasRef.current) {
          img.set(commonProps);
          fabricCanvasRef.current.add(img);
          fabricCanvasRef.current.renderAll();
          updateTexture();
        }
      });
    }
  }, [updateTexture]);

  const saveObjectPosition = (obj: fabric.Object) => {
    if (!obj || !obj.id) return;

    const finalPosition = {
      left: obj.left,
      top: obj.top,
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
      angle: obj.angle
    };
    
    storedPositionsRef.current.set(obj.id, finalPosition);
    
    // Create properties object based on object type
    let properties;
    if (obj.type === 'i-text') {
      properties = {
        ...finalPosition,
        text: (obj as fabric.IText).text,
        fontFamily: (obj as fabric.IText).fontFamily,
        fill: (obj as fabric.IText).fill as string
      };
    } else {
      properties = {
        ...finalPosition,
        src: (obj as fabric.Image).getSrc()
      };
    }

    dispatch(updateDecoration({
      id: obj.id,
      properties
    }));
  };

  const initializeCanvas = useCallback(async () => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    try {
      const containerWidth = canvasRef.current.parentElement?.clientWidth || 500;
      const containerHeight = canvasRef.current.parentElement?.clientHeight || 500;
      const size = Math.min(containerWidth, containerHeight) - 32;

      canvasRef.current.width = size;
      canvasRef.current.height = size;

      await new Promise(resolve => requestAnimationFrame(resolve));

      const canvas = new fabric.Canvas(canvasRef.current, {
        width: size,
        height: size,
        backgroundColor: '#ffffff',
        preserveObjectStacking: true,
        uniformScaling: true,
        stopContextMenu: true,
      });

      fabricCanvasRef.current = canvas;

      canvas.on('mouse:dblclick', () => false);

      const events = [
        'object:modified',
        'object:added',
        'object:removed',
        'object:moving',
        'object:scaling',
        'object:rotating',
        'object:skewing',
        'text:changed',
        'canvas:cleared'
      ];

      const handleRender = () => {
        requestAnimationFrame(() => {
          if (canvas.getElement()) {
            canvas.renderAll();
            updateTexture();
          }
        });
      };

      canvas.on('selection:created', (e) => {
        isEditingRef.current = true;
        selectionChangeCallbackRef.current?.(true);
        controlsRef.current.onObjectSelected?.(canvas.getActiveObject());
        
        // Log start of editing
        console.log('Started editing text:', e.target?.id);
        handleRender();
      });

      canvas.on('selection:updated', (e) => {
        if (e.deselected && e.deselected[0]) {
          // Save position of previously selected object
          saveObjectPosition(e.deselected[0]);
        }
        selectionChangeCallbackRef.current?.(true);
        controlsRef.current.onObjectSelected?.(canvas.getActiveObject());
        handleRender();
      });

      canvas.on('selection:cleared', (e) => {
        if (isEditingRef.current && e.deselected?.[0]) {
          saveObjectPosition(e.deselected[0]);
        }
        
        isEditingRef.current = false;
        selectionChangeCallbackRef.current?.(false);
        controlsRef.current.onObjectSelected?.(null);
        handleRender();
      });

      events.forEach(eventName => {
        canvas.on(eventName, handleRender);
      });

      const controls = { 
        addText, 
        addImage, 
        handleInteraction, 
        updateObject, 
        deleteObject,
        recreateFromProperties,
        loadVectorData,
        canvas
      };
      onInit(controls);
      controlsRef.current = controls;
      selectionChangeCallbackRef.current = controls.onSelectionChange;

      setIsCanvasReady(true);

      if (selectedDesignPath) {
        await loadDesign(canvas, selectedDesignPath);
        
        for (const decoration of decorations) {
          await new Promise(resolve => setTimeout(resolve, 0));
          recreateFromProperties(decoration.type, {
            ...decoration.properties,
            id: decoration.id
          });
        }
        
        handleRender();
      }
    } catch (error) {
      console.error('Error initializing canvas:', error);
    }
  }, [
    addText, 
    addImage, 
    handleInteraction, 
    updateObject, 
    deleteObject, 
    recreateFromProperties, 
    loadVectorData, 
    onInit, 
    selectedDesignPath, 
    decorations, 
    loadDesign, 
    updateTexture
  ]);

  useEffect(() => {
    const controls = { 
      addText, 
      addImage, 
      handleInteraction, 
      updateObject, 
      deleteObject,
      recreateFromProperties,
      loadVectorData,
      canvas: fabricCanvasRef.current
    };
    onInit(controls);
    controlsRef.current = controls;
    selectionChangeCallbackRef.current = controls.onSelectionChange;
  }, [onInit, addText, addImage, handleInteraction, updateObject, deleteObject, recreateFromProperties, loadVectorData]);

  useEffect(() => {
    if (fabricCanvasRef.current && isDesignLoaded) {
      const canvas = fabricCanvasRef.current;
      const design = canvas.getObjects().find(obj => obj.data?.isBackground);
      if (design && design.type === 'group') {
        applyColors(design as fabric.Group);
      }
    }
  }, [pathColors, isDesignLoaded, applyColors]);

  useEffect(() => {
    initializeCanvas();

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [initializeCanvas]);

  useEffect(() => {
    if (fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;

      const handleModification = (e: any) => {
        if (!e.target) return;
        
        // Handle both text and image modifications
        if (e.target.type === 'i-text' || e.target.type === 'image') {
          // Only update position in store when not in editing mode
          if (!isEditingRef.current) {
            const storedPosition = storedPositionsRef.current.get(e.target.id);
            if (storedPosition) {
              e.target.set(storedPosition);
              fabricCanvasRef.current?.renderAll();
              updateTexture();
            }
          }
          
          requestAnimationFrame(() => {
            updateObjectState(e.target);
            fabricCanvasRef.current?.renderAll();
            updateTexture();
          });
        }
      };

      const handleDragStart = () => {
        controlsRef.current.onDragStart?.();
      };

      const handleDragEnd = () => {
        controlsRef.current.onDragEnd?.();
      };

      // Track if we're currently dragging
      let isDragging = false;

      canvas.on({
        'mouse:down': (e: fabric.IEvent<MouseEvent>) => {
          const target = e.target;
          if (target && (target.type === 'i-text' || target.type === 'image')) {
            console.log('Starting drag operation');
            isDragging = true;
            e.e.preventDefault();
            e.e.stopPropagation();
            controlsRef.current.onDragStart?.();
          }
        },
        'object:moving': (e: fabric.IEvent<MouseEvent>) => {
          if (isDragging) {
            console.log('Object moving while dragging');
            e.e.preventDefault();
            e.e.stopPropagation();
            handleModification(e);
            handleInteraction(e);
          }
        },
        'mouse:up': (e: fabric.IEvent<MouseEvent>) => {
          if (isDragging) {
            console.log('Ending drag operation');
            isDragging = false;
            e.e.preventDefault();
            e.e.stopPropagation();
            controlsRef.current.onDragEnd?.();
            canvas.renderAll();
            updateTexture();
          }
        },
        'selection:cleared': () => {
          if (isDragging) {
            console.log('Selection cleared while dragging');
            isDragging = false;
            controlsRef.current.onDragEnd?.();
            canvas.renderAll();
            updateTexture();
          }
        }
      });

      return () => {
        isDragging = false;
        canvas.off({
          'mouse:down': handleDragStart,
          'object:moving': handleModification,
          'mouse:up': handleDragEnd,
          'selection:cleared': handleDragEnd
        });
      };
    }
  }, [updateObjectState, debouncedUpdateObjectState, updateTexture]);

  useEffect(() => {
    if (vectorData && isCanvasReady && isDesignLoaded) {
      loadVectorData(vectorData);
    }
  }, [vectorData, isCanvasReady, isDesignLoaded, loadVectorData]);


  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <canvas ref={canvasRef} className="max-w-full max-h-full" />
    </div>
  );
};