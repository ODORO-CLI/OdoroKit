import * as THREE from 'three';

export interface BallPhysics {
  id: number;
  radius: number;
  mass: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  meshGroup: THREE.Group;
  sphere: THREE.Mesh;        // le maillage interne (mise à l'échelle visuelle en mode forme)
  material: THREE.MeshPhysicalMaterial; // pour le morph de couleur piloté par le scroll
  role: 'pastel' | 'light' | 'medium' | 'deep' | 'glass'; // l'emplacement de palette de cette sphère
  isGlass: boolean;
  visualScale: number;       // l'échelle visuelle animée courante
  color: THREE.Color;
  restPosition: THREE.Vector3;
  shapeTarget: THREE.Vector3; // la position visée quand les sphères forment le sigle ODORO
  angleY: number; // angle de rotation propre aux capuchons
  angleZ: number;
}

// Pilote la physique réactive au scroll et la poignée de main loader → révélation.
export interface SceneControl {
  progress: number; // le scroll, exprimé en index de section flottant (0 = masthead, 1 = chute, 2 = forme)
  started: boolean; // passe à true à la fin du loader — libère l'entrée en vol
}

export interface SimulationParams {
  gravity: number;
  rebound: number;
  mouseRepelForce: number;
  mouseRepelRadius: number;
  damping: number; // frottement
  centerAttractForce: number; // stabilité de la flottaison
  bounciness: number; // restitution des collisions entre sphères
}
