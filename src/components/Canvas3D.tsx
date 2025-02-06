import React, { useRef, useCallback, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Cube } from './Cube';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { CanvasTexture, Vector2 } from 'three';
import * as THREE from 'three';
import { OrbitControls as OrbitControlsThree } from 'three/examples/jsm/controls/OrbitControls';

interface Canvas3DProps {
  canvasTexture: THREE.Texture | null;
  onInteract: (point: { x: number; y: number }) => void;
  hasSelection: boolean;
  disableControls: boolean;
  isScreenshotting: boolean;
}

const normalizeCoordinates = (event: MouseEvent, element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  return new Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );
};

export const Canvas3D: React.FC<Canvas3DProps> = ({
  canvasTexture,
  onInteract,
  hasSelection,
  disableControls,
  isScreenshotting
}) => {
  const controlsRef = useRef<OrbitControlsThree>();
  const defaultCameraPosition = useRef({
    position: new THREE.Vector3(0, 0, 6),
    target: new THREE.Vector3(0, 0, 0)
  });
  const [zoom, setZoom] = useState(5);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const controls = controlsRef.current;
    if (controls) {
      controls.enabled = !disableControls;
      controls.enableRotate = !disableControls;
      controls.enableZoom = !disableControls;
      controls.enablePan = !disableControls;
      controls.update();
    }
  }, [disableControls]);

  // Reset camera to default position when taking screenshot
  useEffect(() => {
    if (isScreenshotting && controlsRef.current) {
      const controls = controlsRef.current;
      controls.object.position.copy(defaultCameraPosition.current.position);
      controls.target.copy(defaultCameraPosition.current.target);
      controls.update();
    }
  }, [isScreenshotting]);

  // Store initial camera position
  useEffect(() => {
    if (controlsRef.current) {
      defaultCameraPosition.current = {
        position: controlsRef.current.object.position.clone(),
        target: controlsRef.current.target.clone()
      };
    }
  }, []);

  // Update controls enabled state when selection changes
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = !hasSelection && !disableControls;
      controlsRef.current.update();
    }
  }, [hasSelection, disableControls]);

  const handleZoom = useCallback((delta: number) => {
    setZoom(prev => {
      const newZoom = Math.max(2, Math.min(10, prev + delta));
      controlsRef.current?.object.position.setZ(newZoom);
      return newZoom;
    });
  }, []);

  // Handle mouse interactions
  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (hasSelection || disableControls) {
      // Prevent interaction when object is selected
      return;
    }
    // ... rest of the mouse handling logic
  }, [hasSelection, disableControls, onInteract]);

  return (
    <div className="relative w-full h-full">
      <Canvas 
        camera={{ position: [0, 0, 6], fov: 45 }}
        ref={canvasRef}
        gl={{ preserveDrawingBuffer: true }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[1, 2, 1]}
          intensity={0.6}
          castShadow
        />
        <directionalLight
          position={[-1, 2, -1]}
          intensity={0.3}
        />
        <OrbitControls
          ref={controlsRef}
          makeDefault={false}
          enableDamping={!disableControls}
          enabled={!disableControls}
          enableRotate={!disableControls}
          enableZoom={!disableControls}
          enablePan={!disableControls}
          dampingFactor={0.05}
        />
        <Cube 
          canvasTexture={canvasTexture}
          onInteract={onInteract}
        />
      </Canvas>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        <button
          onClick={() => handleZoom(-1)}
          className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
          title="Zoom Out"
        >
          <ZoomIn className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={() => handleZoom(1)}
          className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
          title="Zoom In"
        >
          <ZoomOut className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </div>
  );
};