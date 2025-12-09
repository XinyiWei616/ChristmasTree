import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Stars } from '@react-three/drei';
import TreeParticles from './components/TreeParticles';
import Ornaments from './components/Ornaments';
import Overlay from './components/Overlay';
import PostEffects from './components/PostEffects';
import { AppState } from './types';
import { COLORS } from './constants';

const Scene: React.FC<{ appState: AppState }> = ({ appState }) => {
  return (
    <>
      <color attach="background" args={[COLORS.bg]} />
      
      <group position={[0, -5, 0]}>
        <TreeParticles appState={appState} />
        <Ornaments appState={appState} />
      </group>

      {/* --- Cinematic Lighting --- */}
      <ambientLight intensity={0.1} color="#001100" />
      
      {/* Main Key Light (Gold/Warm) */}
      <spotLight
        position={[15, 25, 15]}
        angle={0.4}
        penumbra={1}
        intensity={3}
        color={COLORS.goldLight}
        castShadow
        shadow-bias={-0.0001}
      />
      
      {/* Rim Light (Cool/Blue-ish for contrast) */}
      <spotLight 
        position={[-15, 10, -15]} 
        intensity={4} 
        color="#204040" 
        angle={0.6}
      />
      
      {/* Internal Glow (The Soul of the Tree) */}
      <pointLight 
        position={[0, 0, 0]} 
        intensity={2} 
        distance={15} 
        color={COLORS.gold} 
        decay={2}
      />

      {/* Ground Reflection */}
      <ContactShadows 
        opacity={0.6} 
        scale={50} 
        blur={2.5} 
        far={15} 
        resolution={512} 
        color="#000000" 
      />

      {/* Environment for reflections */}
      <Environment preset="city" background={false} />
      
      {/* Subtle Background Stars */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      <PostEffects />
      
      <OrbitControls 
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.8}
        minDistance={10}
        maxDistance={45}
        autoRotate
        autoRotateSpeed={0.8}
      />
    </>
  );
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.SCATTERED);

  return (
    <div className="w-full h-screen bg-black relative">
      <Suspense fallback={<div className="text-white text-center pt-20">Loading Arix Experience...</div>}>
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0, 5, 30], fov: 40 }}
          gl={{ antialias: false, stencil: false, depth: true }}
        >
          <Scene appState={appState} />
        </Canvas>
      </Suspense>
      <Overlay appState={appState} setAppState={setAppState} />
    </div>
  );
};

export default App;