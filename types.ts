import * as THREE from 'three';

// Augment JSX.IntrinsicElements to include React Three Fiber elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      points: any;
      bufferGeometry: any;
      bufferAttribute: any;
      shaderMaterial: any;
      instancedMesh: any;
      sphereGeometry: any;
      boxGeometry: any;
      octahedronGeometry: any;
      meshStandardMaterial: any;
      meshPhysicalMaterial: any;
      ambientLight: any;
      spotLight: any;
      pointLight: any;
      color: any;
      group: any;
    }
  }
}

export enum AppState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE',
}

export type OrnamentType = 'sphere' | 'box' | 'star';

export interface OrnamentData {
  id: number;
  scatterPos: THREE.Vector3;
  treePos: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
  type: OrnamentType;
  color: string;
  weight: number; // 0 = light (floats easily), 1 = heavy (stable)
  speed: number; 
}