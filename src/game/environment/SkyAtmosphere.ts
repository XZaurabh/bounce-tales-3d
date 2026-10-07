import * as THREE from 'three';
import { WorldInfo } from '../../types/game';

interface DriftingCloud {
  mesh: THREE.Group;
  speed: number;
  bobSpeed: number;
  bobOffset: number;
  baseY: number;
  minX: number;
  maxX: number;
}

interface SoaringBird {
  group: THREE.Group;
  leftWing: THREE.Mesh;
  rightWing: THREE.Mesh;
  speed: number;
  flapSpeed: number;
  flapPhase: number;
  flightType: 'circle' | 'cross';
  // Circle parameters
  center: THREE.Vector3;
  radius: number;
  angle: number;
  // Cross parameters
  direction: THREE.Vector3;
  minX: number;
  maxX: number;
  baseY: number;
}

export class SkyAtmosphere {
  public group: THREE.Group;
  private clouds: DriftingCloud[] = [];
  private birds: SoaringBird[] = [];
  private windStreamers: THREE.InstancedMesh | null = null;
  private windStreamerCount = 45;
  private windOffsets: { x: number; y: number; z: number; speed: number; rotSpeed: number }[] = [];
  private balloonGroup: THREE.Group | null = null;
  private sunGroup: THREE.Group | null = null;
  private time = 0;

  // Static cached objects to avoid GC stuttering in animation loops
  private static _forwardDir = new THREE.Vector3();
  private static _vBack = new THREE.Vector3(0, 0, -1);
  private static _dummy = new THREE.Object3D();

  constructor(scene: THREE.Scene, worldInfo: WorldInfo) {
    this.group = new THREE.Group();
    scene.add(this.group);

    this.buildSun(worldInfo);
    this.buildMultiLayerClouds(worldInfo);
    this.buildHighSkyBirds(worldInfo);
    this.buildWindWisps();
    this.buildHotAirBalloon(worldInfo);
  }

  /**
   * Luminous Sun Disc & Golden Corona in the sky
   */
  private buildSun(worldInfo: WorldInfo) {
    if (worldInfo.theme === 'cave') return;

    this.sunGroup = new THREE.Group();
    this.sunGroup.position.set(32, 48, -55);

    const sunGeo = new THREE.SphereGeometry(3.6, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xfffef0,
      depthWrite: false,
    });
    const sunCore = new THREE.Mesh(sunGeo, sunMat);
    this.sunGroup.add(sunCore);

    const coronaGeo = new THREE.PlaneGeometry(22, 22);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(worldInfo.dirLight),
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const corona = new THREE.Mesh(coronaGeo, coronaMat);
    this.sunGroup.add(corona);

    this.group.add(this.sunGroup);
  }

  /**
   * Rich multi-layer fluffy clouds:
   * 1. Low Cloud Sea below the platforms (shows tremendous altitude)
   * 2. Mid-Altitude Drifters crossing the course
   * 3. High-Sky Cirrus Puffs high above
   */
  private buildMultiLayerClouds(worldInfo: WorldInfo) {
    // Pure bright white unlit material - guarantees clouds are always pristine and never shaded dark
    const cloudMat = new THREE.MeshBasicMaterial({
      color: worldInfo.theme === 'cave' ? 0x6366f1 : 0xffffff,
      transparent: true,
      opacity: 0.84,
      depthWrite: false,
    });

    const cloudConfigs = [
      // === TIER 1: Sea of Clouds Far Below (Tremendous Altitude) ===
      { x: -35, y: -22, z: -20, scale: 1.8, speed: 0.35, puffs: 4 },
      { x: 28, y: -25, z: -40, scale: 2.1, speed: 0.3, puffs: 5 },
      { x: -18, y: -24, z: -65, scale: 1.9, speed: 0.4, puffs: 4 },
      { x: 36, y: -26, z: -85, scale: 2.3, speed: 0.32, puffs: 5 },
      { x: -28, y: -23, z: -110, scale: 2.0, speed: 0.38, puffs: 4 },
      { x: 15, y: -27, z: -130, scale: 2.2, speed: 0.34, puffs: 5 },
      { x: -42, y: -24, z: 0, scale: 1.9, speed: 0.36, puffs: 4 },
      { x: 32, y: -25, z: 15, scale: 2.0, speed: 0.33, puffs: 4 },

      // === TIER 2: Mid-Altitude Drifting Clouds ===
      { x: -22, y: -10, z: -35, scale: 1.3, speed: 0.55, puffs: 3 },
      { x: 26, y: -12, z: -55, scale: 1.4, speed: 0.5, puffs: 4 },
      { x: -16, y: -9, z: -80, scale: 1.2, speed: 0.6, puffs: 3 },
      { x: 24, y: -11, z: -105, scale: 1.5, speed: 0.52, puffs: 4 },
      { x: -25, y: -13, z: -125, scale: 1.3, speed: 0.58, puffs: 3 },

      // === TIER 3: High Sky Clouds Overhead ===
      { x: -18, y: 16, z: -40, scale: 1.1, speed: 0.7, puffs: 3 },
      { x: 20, y: 19, z: -70, scale: 1.2, speed: 0.65, puffs: 3 },
      { x: -12, y: 22, z: -95, scale: 1.3, speed: 0.72, puffs: 4 },
      { x: 16, y: 18, z: -120, scale: 1.1, speed: 0.68, puffs: 3 },
    ];

    cloudConfigs.forEach((cfg, idx) => {
      const cloudGroup = new THREE.Group();

      for (let p = 0; p < cfg.puffs; p++) {
        const radius = (0.75 + (p % 2) * 0.3) * cfg.scale;
        const puffGeo = new THREE.SphereGeometry(radius, 10, 8);
        const puff = new THREE.Mesh(puffGeo, cloudMat);

        puff.position.set(
          (p - (cfg.puffs - 1) / 2) * (1.1 * cfg.scale),
          Math.sin(p * 1.8 + idx) * (0.2 * cfg.scale),
          Math.cos(p * 2.1) * (0.35 * cfg.scale)
        );
        puff.scale.set(1.25, 0.68, 1.15);
        cloudGroup.add(puff);
      }

      cloudGroup.position.set(cfg.x, cfg.y, cfg.z);
      this.group.add(cloudGroup);

      this.clouds.push({
        mesh: cloudGroup,
        speed: cfg.speed,
        bobSpeed: 0.6 + (idx % 3) * 0.25,
        bobOffset: idx * 1.3,
        baseY: cfg.y,
        minX: -65,
        maxX: 65,
      });
    });
  }

  /**
   * Animated High-Sky Birds 🕊️ soaring and circling in flocks
   */
  private buildHighSkyBirds(worldInfo: WorldInfo) {
    if (worldInfo.theme === 'cave') return;

    const birdBodyMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc }); // Clean crisp white plumage
    const birdWingMat = new THREE.MeshBasicMaterial({
      color: 0xe2e8f0,
      side: THREE.DoubleSide,
    });

    // Helper to construct a single articulated bird model
    const createBirdMesh = () => {
      const bird = new THREE.Group();

      // Fuselage / Bird Body
      const bodyGeo = new THREE.ConeGeometry(0.12, 0.7, 5);
      const body = new THREE.Mesh(bodyGeo, birdBodyMat);
      body.rotation.x = Math.PI / 2;
      bird.add(body);

      // Tail feathers
      const tailGeo = new THREE.BufferGeometry();
      const tailVertices = new Float32Array([
        0, 0, 0.3,
        -0.2, 0.05, 0.65,
        0.2, 0.05, 0.65,
      ]);
      tailGeo.setAttribute('position', new THREE.BufferAttribute(tailVertices, 3));
      const tail = new THREE.Mesh(tailGeo, birdWingMat);
      bird.add(tail);

      // Left Wing with pivot along body edge
      const leftWingGeo = new THREE.BufferGeometry();
      const leftWingVertices = new Float32Array([
        0, 0, -0.15,
        -0.65, 0.05, 0.1,
        0, 0, 0.25,
      ]);
      leftWingGeo.setAttribute('position', new THREE.BufferAttribute(leftWingVertices, 3));
      const leftWing = new THREE.Mesh(leftWingGeo, birdWingMat);
      leftWing.position.set(-0.06, 0.02, 0);
      bird.add(leftWing);

      // Right Wing
      const rightWingGeo = new THREE.BufferGeometry();
      const rightWingVertices = new Float32Array([
        0, 0, -0.15,
        0.65, 0.05, 0.1,
        0, 0, 0.25,
      ]);
      rightWingGeo.setAttribute('position', new THREE.BufferAttribute(rightWingVertices, 3));
      const rightWing = new THREE.Mesh(rightWingGeo, birdWingMat);
      rightWing.position.set(0.06, 0.02, 0);
      bird.add(rightWing);

      return { bird, leftWing, rightWing };
    };

    // 1. Circling Flock (3 birds in V-formation soaring high above)
    const circleCenter = new THREE.Vector3(12, 16, -60);
    const circleRadius = 24;
    for (let i = 0; i < 3; i++) {
      const { bird, leftWing, rightWing } = createBirdMesh();
      this.group.add(bird);

      this.birds.push({
        group: bird,
        leftWing,
        rightWing,
        speed: 0.65,
        flapSpeed: 7.5,
        flapPhase: i * 0.45,
        flightType: 'circle',
        center: circleCenter,
        radius: circleRadius + (i === 1 ? -2.5 : i === 2 ? 2.5 : 0),
        angle: (i * 0.2),
        direction: new THREE.Vector3(),
        minX: -50,
        maxX: 50,
        baseY: 16 + (i * 0.8),
      });
    }

    // 2. Cross-Sky Migration Flock (4 birds gliding smoothly across the vista)
    for (let i = 0; i < 4; i++) {
      const { bird, leftWing, rightWing } = createBirdMesh();
      this.group.add(bird);

      const startX = -45 - i * 4;
      const startY = 8 + (i % 2) * 1.5;
      const startZ = -45 - i * 6;
      bird.position.set(startX, startY, startZ);

      this.birds.push({
        group: bird,
        leftWing,
        rightWing,
        speed: 6.5 + (i % 2) * 0.8,
        flapSpeed: 8.0,
        flapPhase: i * 0.6,
        flightType: 'cross',
        center: new THREE.Vector3(),
        radius: 0,
        angle: 0,
        direction: new THREE.Vector3(1, 0.05, 0.2).normalize(),
        minX: -55,
        maxX: 55,
        baseY: startY,
      });
    }
  }

  /**
   * Floating High-Altitude Breeze Wisps (drifting air glints)
   */
  private buildWindWisps() {
    const geo = new THREE.PlaneGeometry(0.12, 0.5);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });

    this.windStreamers = new THREE.InstancedMesh(geo, mat, this.windStreamerCount);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < this.windStreamerCount; i++) {
      const x = (Math.random() - 0.5) * 45;
      const y = -10 + Math.random() * 30;
      const z = -Math.random() * 90;
      dummy.position.set(x, y, z);
      dummy.rotation.x = Math.PI / 4;
      dummy.rotation.z = Math.random() * Math.PI;
      dummy.updateMatrix();
      this.windStreamers.setMatrixAt(i, dummy.matrix);

      this.windOffsets.push({
        x,
        y,
        z,
        speed: 2.5 + Math.random() * 3.5,
        rotSpeed: 0.5 + Math.random() * 1.5,
      });
    }

    this.windStreamers.instanceMatrix.needsUpdate = true;
    this.group.add(this.windStreamers);
  }

  /**
   * Distant Floating Hot Air Balloon (adds delightful scale & altitude atmosphere)
   */
  private buildHotAirBalloon(worldInfo: WorldInfo) {
    if (worldInfo.theme === 'cave') return;

    const balloon = new THREE.Group();
    balloon.position.set(38, 15, -75);
    this.balloonGroup = balloon;

    // Balloon envelope (vibrant striped dome)
    const envelopeGeo = new THREE.SphereGeometry(2.4, 16, 16);
    const envelopeMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e, // Bright cheerful rose red
    });
    const envelope = new THREE.Mesh(envelopeGeo, envelopeMat);
    envelope.scale.set(1.0, 1.35, 1.0);
    balloon.add(envelope);

    // Contrasting decorative stripe band
    const bandGeo = new THREE.TorusGeometry(2.35, 0.12, 8, 24);
    const bandMat = new THREE.MeshBasicMaterial({ color: 0xfef08a }); // Sunny yellow stripe
    const band = new THREE.Mesh(bandGeo, bandMat);
    band.rotation.x = Math.PI / 2;
    band.position.y = 0.2;
    balloon.add(band);

    // Basket
    const basketGeo = new THREE.BoxGeometry(0.7, 0.6, 0.7);
    const basketMat = new THREE.MeshBasicMaterial({ color: 0xb45309 }); // Wicker brown
    const basket = new THREE.Mesh(basketGeo, basketMat);
    basket.position.y = -3.8;
    balloon.add(basket);

    // Ropes connecting envelope to basket
    const ropeGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 4);
    const ropeMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
    [-0.25, 0.25].forEach(rx => {
      [-0.25, 0.25].forEach(rz => {
        const rope = new THREE.Mesh(ropeGeo, ropeMat);
        rope.position.set(rx, -3.1, rz);
        balloon.add(rope);
      });
    });

    this.group.add(balloon);
  }

  public update(delta: number, playerPos: THREE.Vector3, camera: THREE.PerspectiveCamera) {
    this.time += delta;

    // Soft parallax follower so atmosphere travels seamlessly with the player
    this.group.position.x = playerPos.x * 0.35;
    this.group.position.z = playerPos.z * 0.35;

    // Orient sun towards camera
    if (this.sunGroup) {
      this.sunGroup.quaternion.copy(camera.quaternion);
    }

    // 1. Drift clouds smoothly with subtle vertical bobbing
    for (let i = 0; i < this.clouds.length; i++) {
      const c = this.clouds[i];
      c.mesh.position.x += c.speed * delta;
      c.mesh.position.y = c.baseY + Math.sin(this.time * c.bobSpeed + c.bobOffset) * 0.45;

      if (c.mesh.position.x > c.maxX) {
        c.mesh.position.x = c.minX;
      }
    }

    // 2. Animate soaring birds (wing flaps, gliding, banking)
    for (let i = 0; i < this.birds.length; i++) {
      const b = this.birds[i];

      // Wing flapping cycle: flap flap flap -> glide
      const glideCycle = Math.sin(this.time * 0.6 + b.flapPhase);
      const isGliding = glideCycle > 0.35;

      if (isGliding) {
        b.leftWing.rotation.z = 0.08;
        b.rightWing.rotation.z = -0.08;
      } else {
        const flap = Math.sin(this.time * b.flapSpeed + b.flapPhase) * 0.55;
        b.leftWing.rotation.z = flap;
        b.rightWing.rotation.z = -flap;
      }

      if (b.flightType === 'circle') {
        b.angle += (b.speed / b.radius) * delta;
        const targetX = b.center.x + Math.cos(b.angle) * b.radius;
        const targetZ = b.center.z + Math.sin(b.angle) * b.radius;
        const targetY = b.baseY + Math.sin(this.time * 0.5 + b.flapPhase) * 1.2;

        SkyAtmosphere._forwardDir.set(
          -Math.sin(b.angle),
          0,
          Math.cos(b.angle)
        ).normalize();

        b.group.position.set(targetX, targetY, targetZ);
        b.group.quaternion.setFromUnitVectors(SkyAtmosphere._vBack, SkyAtmosphere._forwardDir);
        // Bank into the turn
        b.group.rotateZ(-0.25);
      } else {
        // Cross flight
        b.group.position.addScaledVector(b.direction, b.speed * delta);
        b.group.position.y = b.baseY + Math.sin(this.time * 0.8 + b.flapPhase) * 0.6;
        b.group.quaternion.setFromUnitVectors(SkyAtmosphere._vBack, b.direction);

        if (b.group.position.x > b.maxX) {
          b.group.position.x = b.minX;
        }
      }
    }

    // 3. Update floating wind streamers
    if (this.windStreamers) {
      const dummy = SkyAtmosphere._dummy;
      for (let i = 0; i < this.windStreamerCount; i++) {
        const item = this.windOffsets[i];
        item.x += item.speed * delta;
        item.y += Math.sin(this.time * 1.5 + i) * 0.15 * delta;

        if (item.x > 35) item.x = -35;

        dummy.position.set(item.x, item.y, item.z);
        dummy.rotation.x = Math.PI / 4;
        dummy.rotation.z = this.time * item.rotSpeed + i;
        dummy.updateMatrix();
        this.windStreamers.setMatrixAt(i, dummy.matrix);
      }
      this.windStreamers.instanceMatrix.needsUpdate = true;
    }

    // 4. Update Hot Air Balloon gentle bobbing
    if (this.balloonGroup) {
      this.balloonGroup.position.y = 15 + Math.sin(this.time * 0.45) * 1.5;
      this.balloonGroup.position.x = 38 + Math.cos(this.time * 0.25) * 1.8;
      this.balloonGroup.rotation.y = this.time * 0.08;
    }
  }

  public dispose(scene: THREE.Scene) {
    scene.remove(this.group);
    this.group.traverse(obj => {
      if ((obj as THREE.Mesh).geometry) {
        (obj as THREE.Mesh).geometry.dispose();
      }
    });
  }
}
