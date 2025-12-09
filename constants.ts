import * as THREE from 'three';

// --- Palette: Arix Signature "Deep Emerald & Gold" ---
export const COLORS = {
  bg: '#000805', // Almost black green
  emeraldDeep: '#013220', // Racing green / Deep Emerald
  emeraldLight: '#005C3B',
  gold: '#FFD700', // Metallic Gold
  goldLight: '#FCEEA7', // Champagne Gold
  goldDark: '#B8860B', // Dark Goldenrod
  accentRed: '#8B0000', // Deep Velvet Red (for some gifts)
  glow: '#FFFDD0' // Cream glow
};

// --- Configuration ---
export const TREE_CONFIG = {
  height: 14,
  radius: 5.5,
  particleCount: 6000, // Denser needles
  ornamentCount: 250, // More luxury decorations
  scatterRadius: 35, // Wider scatter for dramatic effect
};

// --- Math Helpers ---

// Generate a point on a cone surface (Christmas Tree shape)
export const getTreePosition = (yRatio: number, maxRadius: number, height: number): THREE.Vector3 => {
  // yRatio is 0 (bottom) to 1 (top)
  const y = (yRatio - 0.5) * height; // Center vertically
  const radiusAtY = (1 - yRatio) * maxRadius;
  const angle = Math.random() * Math.PI * 2;
  
  // Add some internal volume, not just surface, but bias towards surface for better shape definition
  const r = radiusAtY * Math.sqrt(0.2 + 0.8 * Math.random()); 
  
  const x = r * Math.cos(angle);
  const z = r * Math.sin(angle);
  return new THREE.Vector3(x, y, z);
};

// Generate a random point in a sphere (Scattered shape)
export const getScatterPosition = (radius: number): THREE.Vector3 => {
  const v = new THREE.Vector3(
    Math.random() - 0.5,
    Math.random() - 0.5,
    Math.random() - 0.5
  );
  v.normalize().multiplyScalar(radius * (0.2 + 0.8 * Math.random()));
  return v;
};

// Cubic ease in-out for smoother custom interpolation
export const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};