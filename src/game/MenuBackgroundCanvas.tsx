import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PlayerBall } from './entities/PlayerBall';
import { ParticleSystem } from './effects/ParticleSystem';

export const MenuBackgroundCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030712');
    scene.fog = new THREE.FogExp2('#030712', 0.035);

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 3.5, 7.5);
    camera.lookAt(0, 1.2, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.45);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#38bdf8', 1.4);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight('#10b981', 0.8);
    rimLight.position.set(-10, 15, -8);
    scene.add(rimLight);

    // Platforms
    const islandGeo = new THREE.CylinderGeometry(5.0, 6.0, 1.5, 32);
    const islandMat = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      roughness: 0.6,
      metalness: 0.2,
    });
    const island = new THREE.Mesh(islandGeo, islandMat);
    island.position.y = -0.75;
    island.receiveShadow = true;
    scene.add(island);

    // Subtle edge rim line on island
    const rimGeo = new THREE.TorusGeometry(5.0, 0.04, 8, 48);
    const rimMat = new THREE.MeshBasicMaterial({ color: '#10b981', transparent: true, opacity: 0.4 });
    const islandRim = new THREE.Mesh(rimGeo, rimMat);
    islandRim.rotation.x = Math.PI / 2;
    islandRim.position.y = 0;
    scene.add(islandRim);

    // Bouncy Mushroom
    const mushroomGroup = new THREE.Group();
    mushroomGroup.position.set(0, 0, 0);

    const stalkGeo = new THREE.CylinderGeometry(0.3, 0.45, 0.8, 16);
    const stalkMat = new THREE.MeshStandardMaterial({ color: '#fef08a', roughness: 0.6 });
    const stalk = new THREE.Mesh(stalkGeo, stalkMat);
    stalk.position.y = 0.4;
    mushroomGroup.add(stalk);

    const capGeo = new THREE.SphereGeometry(0.9, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const capMat = new THREE.MeshStandardMaterial({
      color: '#f43f5e',
      roughness: 0.2,
      emissive: '#9f1239',
      emissiveIntensity: 0.35,
    });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 0.8;
    mushroomGroup.add(cap);
    scene.add(mushroomGroup);

    // Gold Rings floating nearby
    const ringGeo = new THREE.TorusGeometry(0.4, 0.08, 12, 24);
    const ringMat = new THREE.MeshStandardMaterial({
      color: '#facc15',
      metalness: 0.8,
      roughness: 0.2,
      emissive: '#ca8a04',
      emissiveIntensity: 0.3,
    });

    const rings: THREE.Mesh[] = [];
    [-2.2, 2.2].forEach((x, i) => {
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(x, 1.6, -0.5);
      ring.castShadow = true;
      scene.add(ring);
      rings.push(ring);
    });

    // Atmospheric Particle Field (Subtle stars and dust matching signature style)
    const starCount = 350;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const palette = [
      new THREE.Color('#38bdf8'),
      new THREE.Color('#ffffff'),
      new THREE.Color('#10b981'),
      new THREE.Color('#93c5fd'),
    ];

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 28;
      starPositions[i * 3 + 1] = (Math.random() - 0.3) * 16;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 24 - 4;

      const col = palette[Math.floor(Math.random() * palette.length)];
      starColors[i * 3] = col.r;
      starColors[i * 3 + 1] = col.g;
      starColors[i * 3 + 2] = col.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    // Create a smooth circular particle sprite texture
    const dotCanvas = document.createElement('canvas');
    dotCanvas.width = 16;
    dotCanvas.height = 16;
    const dotCtx = dotCanvas.getContext('2d');
    if (dotCtx) {
      const grad = dotCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0.6)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      dotCtx.fillStyle = grad;
      dotCtx.beginPath();
      dotCtx.arc(8, 8, 8, 0, Math.PI * 2);
      dotCtx.fill();
    }
    const dotTexture = new THREE.CanvasTexture(dotCanvas);

    const starMat = new THREE.PointsMaterial({
      size: 0.2,
      map: dotTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // Player Ball
    const player = new PlayerBall();
    scene.add(player.group);

    // Particles
    const particles = new ParticleSystem(scene);

    // Bounce animation variables
    let ballY = 2.0;
    let ballVy = 0;
    let time = 0;
    let animId: number;

    const loop = () => {
      animId = requestAnimationFrame(loop);
      time += 0.016;

      // Ball bounce physics
      ballVy -= 24 * 0.016;
      ballY += ballVy * 0.016;

      if (ballY <= 1.4) {
        ballY = 1.4;
        ballVy = 11.5;
        player.onBounce(14);
        particles.emitSparkles(new THREE.Vector3(0, 1.0, 0), 8, 0xf43f5e);
      }

      player.setPosition(0, ballY, 0);
      player.update(0.016, new THREE.Vector3(0, ballVy, 0), ballY <= 1.4);

      // Rings spin
      rings.forEach((ring, idx) => {
        ring.rotation.y += 0.02;
        ring.position.y = 1.6 + Math.sin(time * 2 + idx) * 0.15;
      });

      // Gentle starfield particle drift
      starPoints.rotation.y = time * 0.02;
      starPoints.rotation.x = Math.sin(time * 0.01) * 0.04;

      // Gentle camera orbit sway
      camera.position.x = Math.sin(time * 0.25) * 2.5;
      camera.position.z = 7.5 + Math.cos(time * 0.25) * 0.5;
      camera.lookAt(0, 1.2, 0);

      particles.update(0.016);
      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(loop);

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
      particles.dispose(scene);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};
