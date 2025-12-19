
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Text } from '@react-three/drei';
import * as THREE from 'three';

const PulsatingCube = () => {
  const mesh = useRef<THREE.Mesh>(null!);
  const time = useRef(0);

  const gradientTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d')!;
    const gradient = context.createLinearGradient(0, 0, 256, 256);
    // These colors should ideally come from your theme variables
    gradient.addColorStop(0, 'hsl(210, 40%, 80%)'); // Corresponds to primary
    gradient.addColorStop(1, 'hsl(280, 50%, 70%)'); // Corresponds to secondary
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state, delta) => {
    time.current += delta * 0.5;
    const pulse = (Math.sin(time.current * Math.PI) + 1) / 2; // Pulse between 0 and 1

    if (mesh.current) {
      // Rotation
      mesh.current.rotation.x += delta * 0.1;
      mesh.current.rotation.y += delta * 0.15;
      
      // Pulsating scale
      const scale = 1 + pulse * 0.2;
      mesh.current.scale.set(scale, scale, scale);

      // Pulsating emissive intensity
      const material = mesh.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = pulse * 2;
    }
  });

  return (
    <Box ref={mesh} args={[2, 2, 2]}>
      <meshStandardMaterial 
        map={gradientTexture}
        emissive={'hsl(240, 60%, 80%)'} // A glow color related to the theme
        emissiveIntensity={1}
        toneMapped={false}
      />
    </Box>
  );
};


const BootScreen = ({ onBootComplete }: { onBootComplete: () => void }) => {
    
  // This will trigger the fade-out and unmount after animation
  React.useEffect(() => {
    const timer = setTimeout(() => {
        onBootComplete();
    }, 4000); // Let the animation play for 4 seconds
    return () => clearTimeout(timer);
  }, [onBootComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-background bg-grid">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <PulsatingCube />
        <Text
          position={[0, -2.5, 0]}
          color="white"
          fontSize={0.3}
          anchorX="center"
          anchorY="middle"
          font="/fonts/Exo2-Regular.ttf" // Make sure you have a font file here
        >
          INITIALIZING SHADOWTALK OS...
        </Text>
      </Canvas>
    </div>
  );
};

export default BootScreen;
