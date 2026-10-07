import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { LevelDef, GameSaveData } from '../types/game';
import { PhysicsWorld } from './physics/PhysicsWorld';
import { CameraController } from './camera/CameraController';
import { InputManager } from './input/InputManager';
import { soundManager } from '../audio/SoundManager';
import { WORLDS } from '../levels/worlds';
import { SkyAtmosphere } from './environment/SkyAtmosphere';

interface GameCanvasProps {
  level: LevelDef;
  saveData: GameSaveData;
  isPaused: boolean;
  onPauseToggle: () => void;
  onRingCollected: (count: number) => void;
  onStarCollected: (count: number) => void;
  onLifeLost: (lives: number) => void;
  onCheckpoint: (id: string) => void;
  onGoalReached: () => void;
  onTimeUpdate: (seconds: number) => void;
  inputRef?: React.MutableRefObject<InputManager | null>;
  cameraCtrlRef?: React.MutableRefObject<CameraController | null>;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  level,
  saveData,
  isPaused,
  onPauseToggle,
  onRingCollected,
  onStarCollected,
  onLifeLost,
  onCheckpoint,
  onGoalReached,
  onTimeUpdate,
  inputRef,
  cameraCtrlRef: externalCameraRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const physicsWorldRef = useRef<PhysicsWorld | null>(null);
  const cameraCtrlRef = useRef<CameraController | null>(null);
  const inputManagerRef = useRef<InputManager | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    const worldInfo = WORLDS[level.worldId];

    // Clean, infinite, beautiful sky background - guaranteed 100% no black clipping or dark spots
    scene.background = new THREE.Color(worldInfo.skyColor);

    // Subtle sun disc and only a few small, pure-white drifting clouds
    const skyAtmosphere = new SkyAtmosphere(scene, worldInfo);

    // Natural distant depth mist: near platforms (< 40m) are 100% crisp and vibrant; far horizon softly merges
    scene.fog = new THREE.Fog(worldInfo.fogColor, 40, 160);

    // 2. Camera setup with extended far clipping plane
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 400);
    const cameraCtrl = new CameraController(camera);
    cameraCtrl.setMode(saveData.settings.cameraMode);
    cameraCtrl.sensitivity = saveData.settings.mouseSensitivity;
    cameraCtrlRef.current = cameraCtrl;
    if (externalCameraRef) externalCameraRef.current = cameraCtrl;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: saveData.settings.graphicsQuality !== 'low',
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(new THREE.Color(worldInfo.skyColor), 1.0);

    const dpr = saveData.settings.graphicsQuality === 'low'
      ? 1.0
      : saveData.settings.graphicsQuality === 'medium'
      ? 1.25
      : Math.min(window.devicePixelRatio, 1.75);

    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height);

    if (saveData.settings.shadows && saveData.settings.graphicsQuality !== 'low') {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    renderer.domElement.style.touchAction = 'none';
    container.appendChild(renderer.domElement);

    // 4. Lighting setup
    const ambientLight = new THREE.AmbientLight(worldInfo.ambientLight, 0.65);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(worldInfo.dirLight, 1.2);
    dirLight.position.set(20, 35, 15);
    if (saveData.settings.shadows && saveData.settings.graphicsQuality !== 'low') {
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.camera.near = 0.5;
      dirLight.shadow.camera.far = 100;
      const d = 25;
      dirLight.shadow.camera.left = -d;
      dirLight.shadow.camera.right = d;
      dirLight.shadow.camera.top = d;
      dirLight.shadow.camera.bottom = -d;
      dirLight.shadow.bias = -0.0005;
    }
    scene.add(dirLight);

    // Hemisphere light for vibrant ground reflection
    const hemiLight = new THREE.HemisphereLight(worldInfo.skyColor, worldInfo.groundColor, 0.45);
    scene.add(hemiLight);

    // 5. Input manager
    const inputManager = new InputManager();
    inputManager.setOnPause(onPauseToggle);
    inputManager.setOnResetCam(() => cameraCtrl.resetHeading());
    inputManagerRef.current = inputManager;
    if (inputRef) inputRef.current = inputManager;

    // 6. Physics World
    const physicsWorld = new PhysicsWorld(scene, level, {
      onRingCollected,
      onStarCollected,
      onLifeLost,
      onCheckpoint,
      onGoalReached,
    });
    physicsWorldRef.current = physicsWorld;

    // Immediately snap camera to player's grounded position on frame 0
    cameraCtrl.init(physicsWorld.playerPos);

    // Start world music
    soundManager.startWorldMusic(worldInfo.theme);

    // 7. Full 360 Camera Orbit Drag via Window-Level Pointer Events (Supports Mouse & Touch Anywhere)
    let isDragging = false;
    let activePointerId: number | null = null;
    let lastX = 0;
    let lastY = 0;

    const onPointerDown = (e: PointerEvent) => {
      // Ignore if clicking on interactive UI buttons or joystick
      if ((e.target as HTMLElement)?.closest('button, [data-interactive="true"], input, select')) return;
      isDragging = true;
      activePointerId = e.pointerId;
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging || (activePointerId !== null && activePointerId !== e.pointerId)) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const touchMultiplier = e.pointerType === 'touch' ? 1.6 : 1.0;
      cameraCtrl.rotate(dx * touchMultiplier, dy * touchMultiplier);
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (activePointerId === null || activePointerId === e.pointerId) {
        isDragging = false;
        activePointerId = null;
      }
    };

    const onWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement)?.closest('[data-scrollable="true"]')) return;
      cameraCtrl.zoom(Math.sign(e.deltaY) * 0.75);
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('wheel', onWheel, { passive: true });
    container.addEventListener('contextmenu', onContextMenu);

    // 8. Animation Loop
    let animId: number;
    let lastTime = performance.now();

    const renderLoop = (time: number) => {
      animId = requestAnimationFrame(renderLoop);

      const delta = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      if (!isPaused) {
        // Read input with exact camera yaw
        const inputState = inputManager.update(cameraCtrl.yaw, delta);
        physicsWorld.inputMove.copy(inputState.move);
        physicsWorld.isJumping = inputState.jump;
        physicsWorld.isBoosting = inputState.boost;

        // Mouse/Touch camera rotation
        const camDelta = inputManager.consumeCameraDelta();
        if (camDelta.dx !== 0 || camDelta.dy !== 0) {
          cameraCtrl.rotate(camDelta.dx, camDelta.dy);
        }
        if (camDelta.zoom !== 0) {
          cameraCtrl.zoom(camDelta.zoom);
        }

        // Update physics & simulation
        physicsWorld.update(delta);

        // Update high-sky atmosphere, cloud sea drifting, and wind wisps
        skyAtmosphere.update(delta, physicsWorld.playerPos, camera);

        // Update camera position
        cameraCtrl.update(delta, physicsWorld.playerPos, physicsWorld.playerVel);

        // Notify timer
        onTimeUpdate(physicsWorld.timeElapsed);
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(renderLoop);

    // Resize listener
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('wheel', onWheel);
      container.removeEventListener('contextmenu', onContextMenu);
      skyAtmosphere.dispose(scene);
      physicsWorld.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      soundManager.stopMusic();
    };
  }, [level.id, saveData.settings.graphicsQuality, saveData.settings.shadows, saveData.settings.cameraMode, saveData.settings.mouseSensitivity]);

  return (
    <div
      ref={containerRef}
      style={{ touchAction: 'none' }}
      className="absolute inset-0 w-full h-full overflow-hidden select-none outline-none cursor-grab active:cursor-grabbing touch-none"
    />
  );
};
