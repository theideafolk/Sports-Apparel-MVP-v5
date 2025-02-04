import React, { useRef, useCallback, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Cube } from './Cube';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { CanvasTexture, Vector2 } from 'three';

interface Canvas3DProps {
  canvasTexture?: CanvasTexture | null;
  onInteract?: (uv: { x: number, y: number }) => void;
  hasSelection?: boolean;
}

const normalizeCoordinates = (event: MouseEvent, element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  return new Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );
};

export const Canvas3D: React.FC<Canvas3DProps> = ({ canvasTexture, onInteract, hasSelection }) => {
  const controlsRef = useRef<any>(null);
  const [zoom, setZoom] = useState(5);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = !hasSelection;
    }
  }, [hasSelection]);

  const handleZoom = useCallback((delta: number) => {
    setZoom(prev => {
      const newZoom = Math.max(2, Math.min(10, prev + delta));
      controlsRef.current?.object.position.setZ(newZoom);
      return newZoom;
    });
  }, []);

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
          makeDefault 
          enableDamping
          enabled={!hasSelection}
          dampingFactor={0.05}
          ref={controlsRef}
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