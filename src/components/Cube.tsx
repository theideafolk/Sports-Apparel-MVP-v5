import React, { useRef, useEffect, useState } from 'react';
import { ThreeEvent, useThree, useLoader } from '@react-three/fiber';
import { Mesh, CanvasTexture, MeshStandardMaterial, Raycaster, Vector2, Group } from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { Center } from '@react-three/drei';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

interface CubeProps {
  canvasTexture?: CanvasTexture | null;
  onInteract?: (uv: { x: number, y: number }) => void;
}

export const Cube: React.FC<CubeProps> = ({ 
  canvasTexture, 
  onInteract
}) => {
  const modelRef = useRef<Group>(null);
  const selectedProductType = useSelector((state: RootState) => state.designs.selectedProductType);
  const selectedModel = useSelector((state: RootState) => {
    const models = state.models.models;
    return models.find(m => m.id === state.models.selectedModelId);
  });
  const materialRef = useRef<MeshStandardMaterial>(null);
  const { camera, gl } = useThree();
  const raycaster = useRef(new Raycaster());
  const mouse = useRef(new Vector2());
  const [isDragging, setIsDragging] = useState(false);

  // Load the model
  const model = useLoader(OBJLoader, selectedModel?.path || '');

  // Define model-specific configurations
  const modelConfig = {
    jersey: {
      scale: [0.0042, 0.0042, 0.0042],
      position: [0, 0, 0],
      rotation: [0, 0, 0]
    },
    sock: {
      scale: [0.02, 0.02, 0.02],
      position: [0, -0.5, 0], // Adjust Y position to center the sock
      rotation: [0, Math.PI / 2, 0] // Rotate 90 degrees to face forward
    }
  };

  useEffect(() => {
    if (materialRef.current && canvasTexture) {
      materialRef.current.map = canvasTexture;
      materialRef.current.needsUpdate = true;
    }
  }, [canvasTexture]);

  useEffect(() => {
    if (model && materialRef.current) {
      model.traverse((child) => {
        if (child instanceof Mesh) {
          child.material = materialRef.current;
        }
      });
    }
  }, [model]);

  // Reset camera position when product type changes
  useEffect(() => {
    if (camera) {
      camera.position.set(0, 0, 6);
      camera.lookAt(0, 0, 0);
    }
  }, [selectedProductType, camera]);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    
    const rect = gl.domElement.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, camera);
    
    if (modelRef.current) {
      const intersects = raycaster.current.intersectObject(modelRef.current, true);
      
      if (intersects.length > 0 && intersects[0].uv && onInteract) {
        const uv = intersects[0].uv.clone();
        
        onInteract({
          x: uv.x,
          y: 1 - uv.y,
          clientX: event.clientX,
          clientY: event.clientY,
          type: 'mousedown'
        });
        setIsDragging(true);
      }
    }
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!isDragging || !onInteract) return;
    event.stopPropagation();

    const rect = gl.domElement.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, camera);
    const intersects = raycaster.current.intersectObject(modelRef.current!, true);
    
    if (intersects.length > 0 && intersects[0].uv) {
      const uv = intersects[0].uv;
      onInteract({
        x: uv.x,
        y: 1 - uv.y,
        clientX: event.clientX,
        clientY: event.clientY,
        type: 'mousemove'
      });
    }
  };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    if (!isDragging || !onInteract) return;
    event.stopPropagation();

    const rect = gl.domElement.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, camera);
    const intersects = raycaster.current.intersectObject(modelRef.current!, true);
    
    if (intersects.length > 0 && intersects[0].uv) {
      const uv = intersects[0].uv;
      onInteract({
        x: uv.x,
        y: 1 - uv.y,
        clientX: event.clientX,
        clientY: event.clientY,
        type: 'mouseup'
      });
    }
    setIsDragging(false);
  };

  const config = modelConfig[selectedProductType];

  return (
    <Center>
      <primitive
        ref={modelRef}
        object={model.clone()}
        scale={config.scale}
        position={config.position}
        rotation={config.rotation}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      <meshStandardMaterial 
        ref={materialRef}
        color="white"
        roughness={0.9}
        metalness={0}
        envMapIntensity={0.2}
        transparent
        side={2}
        map={canvasTexture || undefined}
      />
    </Center>
  );
};