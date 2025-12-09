import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS, TREE_CONFIG, getScatterPosition, getTreePosition } from '../constants';
import { AppState } from '../types';

// --- Custom Shader Material for Luxury Needles ---
const vertexShader = `
  uniform float uTime;
  uniform float uProgress; // 0 = Scattered, 1 = Tree
  uniform float uPixelRatio;

  attribute vec3 aScatterPos;
  attribute vec3 aTreePos;
  attribute float aRandom;
  attribute float aSize;

  varying float vAlpha;
  varying float vGolden;

  // Cubic Bezier Ease
  float ease(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  void main() {
    float t = ease(uProgress);
    
    // Mix positions based on progress
    vec3 pos = mix(aScatterPos, aTreePos, t);
    
    // "Breathing" Effect
    // When in tree form, the tree breathes gently. When scattered, it's chaotic.
    float floatSpeed = mix(0.2, 1.0, t);
    float floatAmp = mix(2.0, 0.15, t); 
    
    float wave = sin(uTime * floatSpeed + pos.y * 0.5 + aRandom * 5.0);
    pos.x += cos(uTime * 0.5 + aRandom * 10.0) * floatAmp * 0.5;
    pos.z += sin(uTime * 0.5 + aRandom * 10.0) * floatAmp * 0.5;
    pos.y += wave * floatAmp * 0.5;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuation
    gl_PointSize = aSize * uPixelRatio * (25.0 / -mvPosition.z);
    
    // Twinkle / Gold Dust effect
    float sparkle = sin(uTime * 2.0 + aRandom * 25.0);
    vAlpha = 0.5 + 0.5 * sparkle; 
    
    // Some particles are "Gold", some are "Green"
    vGolden = step(0.85, aRandom); // Top 15% are pure gold sparks
  }
`;

const fragmentShader = `
  uniform vec3 uColorBase;
  uniform vec3 uColorTip;
  uniform vec3 uColorGold;
  
  varying float vAlpha;
  varying float vGolden;

  void main() {
    // Soft circular particle
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;

    // Soft glow edge
    float glow = 1.0 - (dist * 2.0);
    glow = pow(glow, 2.0);

    // Color Mixing
    // If vGolden is 1, use Gold color. Otherwise mix Base and Tip.
    vec3 needleColor = mix(uColorBase, uColorTip, glow * 0.5);
    vec3 finalColor = mix(needleColor, uColorGold, vGolden);
    
    // Enhance alpha for gold particles
    float alpha = vAlpha * glow;
    if (vGolden > 0.5) alpha *= 1.5;

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

interface TreeParticlesProps {
  appState: AppState;
}

const TreeParticles: React.FC<TreeParticlesProps> = ({ appState }) => {
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const targetProgress = useRef(0);
  
  // Geometry Data Generation
  const { positions, scatterPos, treePos, randoms, sizes } = useMemo(() => {
    const count = TREE_CONFIG.particleCount;
    const pos = new Float32Array(count * 3);
    const scat = new Float32Array(count * 3);
    const tree = new Float32Array(count * 3);
    const rnd = new Float32Array(count);
    const sz = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Tree Shape
      const yRatio = Math.random(); 
      // Bias slightly to bottom for fullness
      const yRatioBiased = Math.pow(yRatio, 0.8);
      const tPos = getTreePosition(yRatioBiased, TREE_CONFIG.radius, TREE_CONFIG.height);
      tree[i * 3] = tPos.x;
      tree[i * 3 + 1] = tPos.y;
      tree[i * 3 + 2] = tPos.z;

      // Scatter Shape
      const sPos = getScatterPosition(TREE_CONFIG.scatterRadius);
      scat[i * 3] = sPos.x;
      scat[i * 3 + 1] = sPos.y;
      scat[i * 3 + 2] = sPos.z;

      // Initial buffer
      pos[i * 3] = sPos.x;
      pos[i * 3 + 1] = sPos.y;
      pos[i * 3 + 2] = sPos.z;

      rnd[i] = Math.random();
      sz[i] = Math.random() * 0.6 + 0.4; 
    }

    return { 
      positions: pos, 
      scatterPos: scat, 
      treePos: tree, 
      randoms: rnd, 
      sizes: sz 
    };
  }, []);

  useFrame((state) => {
    if (!materialRef.current) return;

    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;

    const target = appState === AppState.TREE_SHAPE ? 1.0 : 0.0;
    // Smooth transition
    targetProgress.current = THREE.MathUtils.lerp(targetProgress.current, target, 0.03);
    
    materialRef.current.uniforms.uProgress.value = targetProgress.current;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={scatterPos.length / 3}
          array={scatterPos}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePos"
          count={treePos.length / 3}
          array={treePos}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={randoms.length}
          array={randoms}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aSize"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uProgress: { value: 0 },
          uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
          uColorBase: { value: new THREE.Color(COLORS.emeraldDeep) },
          uColorTip: { value: new THREE.Color(COLORS.emeraldLight) },
          uColorGold: { value: new THREE.Color(COLORS.gold) }
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default TreeParticles;