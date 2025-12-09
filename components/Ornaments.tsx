import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS, TREE_CONFIG, getScatterPosition, getTreePosition, easeInOutCubic } from '../constants';
import { AppState, OrnamentData, OrnamentType } from '../types';

interface OrnamentsProps {
  appState: AppState;
}

const Ornaments: React.FC<OrnamentsProps> = ({ appState }) => {
  const spheresRef = useRef<THREE.InstancedMesh>(null);
  const boxesRef = useRef<THREE.InstancedMesh>(null);
  const starsRef = useRef<THREE.InstancedMesh>(null);
  const progressRef = useRef(0);

  // Data Generation separated by type
  const { spheres, boxes, stars } = useMemo(() => {
    const s: OrnamentData[] = [];
    const b: OrnamentData[] = [];
    const st: OrnamentData[] = [];
    
    for (let i = 0; i < TREE_CONFIG.ornamentCount; i++) {
      // Determine Type and Weight
      // 50% Spheres, 30% Stars, 20% Boxes
      const rand = Math.random();
      let type: OrnamentType = 'sphere';
      let weight = 0.5; // Medium
      let scaleBase = 0.3;

      if (rand > 0.8) {
        type = 'box';
        weight = 1.0; // Heavy
        scaleBase = 0.4;
      } else if (rand > 0.5) {
        type = 'star';
        weight = 0.1; // Light
        scaleBase = 0.2;
      }

      // Generate Colors based on type
      let color = COLORS.gold;
      if (type === 'box') color = Math.random() > 0.5 ? COLORS.emeraldDeep : COLORS.accentRed;
      if (type === 'star') color = COLORS.goldLight;
      if (type === 'sphere') color = Math.random() > 0.3 ? COLORS.gold : COLORS.goldDark;

      const yRatio = Math.random();
      const height = TREE_CONFIG.height;
      const y = (yRatio - 0.5) * height;
      
      // Box gifts sit lower, stars sit higher generally, but random for now
      // Ornaments sit inside the needles slightly
      const r = (1 - yRatio) * TREE_CONFIG.radius * 0.8; 
      const angle = Math.random() * Math.PI * 2;
      
      const treePos = new THREE.Vector3(r * Math.cos(angle), y, r * Math.sin(angle));
      const scatterPos = getScatterPosition(TREE_CONFIG.scatterRadius);

      const item: OrnamentData = {
        id: i,
        scatterPos,
        treePos,
        rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
        scale: Math.random() * 0.3 + scaleBase,
        type,
        color,
        weight,
        speed: Math.random() * 0.5 + 0.2
      };

      if (type === 'box') b.push(item);
      else if (type === 'star') st.push(item);
      else s.push(item);
    }
    return { spheres: s, boxes: b, stars: st };
  }, []);

  // Helper to colorize instances once
  const applyColors = (mesh: THREE.InstancedMesh | null, data: OrnamentData[]) => {
    if (!mesh) return;
    data.forEach((item, i) => {
      mesh.setColorAt(i, new THREE.Color(item.color));
    });
    mesh.instanceColor!.needsUpdate = true;
  };

  useLayoutEffect(() => {
    applyColors(spheresRef.current, spheres);
    applyColors(boxesRef.current, boxes);
    applyColors(starsRef.current, stars);
  }, [spheres, boxes, stars]);

  // Shared temporary objects
  const tempObj = useMemo(() => new THREE.Object3D(), []);
  const tempVec = useMemo(() => new THREE.Vector3(), []);

  // Update Logic
  const updateInstances = (mesh: THREE.InstancedMesh | null, data: OrnamentData[], t: number, time: number) => {
    if (!mesh) return;

    data.forEach((item, i) => {
      // Weight affects how fast they assemble. 
      // Heavy items (boxes) arrive later/slower. Light items (stars) arrive faster.
      // We adjust 't' locally based on weight.
      // weight 1 (heavy) -> t * 0.8
      // weight 0 (light) -> t * 1.2
      // clamping t to 0-1
      const localT = THREE.MathUtils.clamp(t * (1.2 - item.weight * 0.4), 0, 1);
      const easedT = easeInOutCubic(localT);

      tempVec.lerpVectors(item.scatterPos, item.treePos, easedT);
      
      // Floating Physics based on weight
      // Heavy items float less, move slower
      const floatAmp = (1 - item.weight * 0.8) * (1 - easedT) * 2.0 + 0.1; 
      const floatSpeed = item.speed * (1.5 - item.weight);

      tempVec.y += Math.sin(time * floatSpeed + item.id) * floatAmp * 0.15;
      tempVec.x += Math.cos(time * floatSpeed * 0.5 + item.id) * floatAmp * 0.08;

      tempObj.position.copy(tempVec);
      
      // Rotation: Stars spin faster
      const rotSpeed = item.type === 'star' ? 2.0 : 0.5;
      tempObj.rotation.x = item.rotation.x + time * 0.2 * rotSpeed * (1 - easedT);
      tempObj.rotation.y = item.rotation.y + time * 0.3 * rotSpeed;
      tempObj.rotation.z = item.rotation.z;

      // Scale pulse
      const pulse = 1.0 + Math.sin(time * 3 + item.id) * 0.05;
      tempObj.scale.setScalar(item.scale * pulse);

      tempObj.updateMatrix();
      mesh.setMatrixAt(i, tempObj.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };

  useFrame((state) => {
    const target = appState === AppState.TREE_SHAPE ? 1 : 0;
    progressRef.current = THREE.MathUtils.lerp(progressRef.current, target, 0.02);
    
    updateInstances(spheresRef.current, spheres, progressRef.current, state.clock.elapsedTime);
    updateInstances(boxesRef.current, boxes, progressRef.current, state.clock.elapsedTime);
    updateInstances(starsRef.current, stars, progressRef.current, state.clock.elapsedTime);
  });

  return (
    <group>
      {/* 1. Baubles (Spheres) - High Polish Gold */}
      <instancedMesh ref={spheresRef} args={[undefined, undefined, spheres.length]} castShadow receiveShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color={COLORS.gold} 
          roughness={0.1} 
          metalness={0.9} 
          envMapIntensity={1.5}
        />
      </instancedMesh>

      {/* 2. Gifts (Boxes) - Velvet/Matte finish */}
      <instancedMesh ref={boxesRef} args={[undefined, undefined, boxes.length]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial 
          roughness={0.6} 
          metalness={0.3} 
        />
      </instancedMesh>

      {/* 3. Stars (Octahedrons) - Glowing/Emissive */}
      <instancedMesh ref={starsRef} args={[undefined, undefined, stars.length]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color={COLORS.goldLight}
          emissive={COLORS.goldLight}
          emissiveIntensity={2.0}
          toneMapped={false} 
        />
      </instancedMesh>
    </group>
  );
};

export default Ornaments;