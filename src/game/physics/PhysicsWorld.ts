import * as THREE from 'three';
import { LevelDef, WorldId } from '../../types/game';
import { PlayerBall } from '../entities/PlayerBall';
import { ParticleSystem } from '../effects/ParticleSystem';
import { soundManager } from '../../audio/SoundManager';
import { WORLDS } from '../../levels/worlds';

export interface CollapsingPlatformState {
  id: string;
  originalPos: THREE.Vector3;
  mesh: THREE.Object3D;
  state: 'idle' | 'shaking' | 'falling' | 'respawning';
  timer: number;
}

export interface MovingPlatformState {
  id: string;
  originalPos: THREE.Vector3;
  mesh: THREE.Object3D;
  moveDelta: THREE.Vector3;
  moveSpeed: number;
  prevPos: THREE.Vector3;
  currentDelta: THREE.Vector3;
  time: number;
}

export interface EnemyState {
  id: string;
  mesh: THREE.Group;
  pos: THREE.Vector3;
  originPos: THREE.Vector3;
  patrolDelta: THREE.Vector3;
  speed: number;
  type: string;
  time: number;
}

export interface CollectibleState {
  id: string;
  type: 'ring' | 'star' | 'heart';
  mesh: THREE.Object3D;
  pos: THREE.Vector3;
  collected: boolean;
}

export interface CheckpointState {
  id: string;
  pos: THREE.Vector3;
  spawnPos: THREE.Vector3;
  activated: boolean;
  beaconLight: THREE.PointLight;
  flagMesh: THREE.Mesh;
}

export interface SwitchState {
  id: string;
  mesh: THREE.Mesh;
  targetDoorId: string;
  pressed: boolean;
  pos: THREE.Vector3;
}

export interface DoorState {
  id: string;
  mesh: THREE.Mesh;
  closedPos: THREE.Vector3;
  openOffset: THREE.Vector3;
  currentOffset: THREE.Vector3;
  targetOpen: boolean;
}

export interface GameCallbacks {
  onRingCollected: (count: number) => void;
  onStarCollected: (count: number) => void;
  onLifeLost: (remaining: number) => void;
  onCheckpoint: (checkpointId: string) => void;
  onGoalReached: () => void;
}

export class PhysicsWorld {
  public scene: THREE.Scene;
  public player: PlayerBall;
  public particles: ParticleSystem;

  // Level definition
  public level: LevelDef;
  public worldInfo: (typeof WORLDS)[WorldId];

  // Dynamic state
  public playerPos = new THREE.Vector3();
  public playerVel = new THREE.Vector3();
  public isGrounded = false;
  public currentCheckpointSpawn: THREE.Vector3;

  // Input states
  public inputMove = new THREE.Vector2();
  public isJumping = false;
  public isBoosting = false;

  // Jump helpers
  private coyoteTimer = 0;
  private jumpBuffer = 0;
  private canJump = true;

  // Interactive objects
  public platformMeshes: { mesh: THREE.Object3D; def: LevelDef['platforms'][0] }[] = [];
  public movingPlatforms: MovingPlatformState[] = [];
  public collapsingPlatforms: CollapsingPlatformState[] = [];
  public collectibles: CollectibleState[] = [];
  public checkpoints: CheckpointState[] = [];
  public enemies: EnemyState[] = [];
  public switches: SwitchState[] = [];
  public doors: DoorState[] = [];
  public goalMesh: THREE.Group | null = null;

  // Player gameplay stats for current run
  public ringsCollected = 0;
  public starsCollected = 0;
  public lives = 3;
  public timeElapsed = 0;
  public isCompleted = false;
  public isDying = false;
  private deathTimer = 0;

  private callbacks: GameCallbacks;

  constructor(scene: THREE.Scene, level: LevelDef, callbacks: GameCallbacks) {
    this.scene = scene;
    this.level = level;
    this.worldInfo = WORLDS[level.worldId];
    this.callbacks = callbacks;

    this.particles = new ParticleSystem(scene);
    this.player = new PlayerBall();
    this.scene.add(this.player.group);

    // 1. Build the visual world & physics colliders first
    this.buildLevelEnvironment();

    // 2. Set initial spawn pos safely and solidly ON the platform (never drops from air)
    this.currentCheckpointSpawn = new THREE.Vector3(...level.spawnPos);
    const spawnPlat = this.level.platforms.find(p => p.id === 'spawn-platform' || p.id === 'bonus-spawn') || this.level.platforms[0];
    if (spawnPlat) {
      const topSurface = spawnPlat.pos[1] + spawnPlat.size[1] / 2;
      this.currentCheckpointSpawn.x = spawnPlat.pos[0];
      this.currentCheckpointSpawn.y = topSurface + this.player.radius;
      this.currentCheckpointSpawn.z = spawnPlat.pos[2];
    }

    this.respawnPlayer(false);
  }

  public respawnPlayer(playParticles = true) {
    if (this.lives <= 0) {
      // Out of lives: reset back to spawn platform with 3 fresh lives
      this.lives = 3;
      this.currentCheckpointSpawn.copy(new THREE.Vector3(...this.level.spawnPos));
      const spawnPlat = this.level.platforms.find(p => p.id === 'spawn-platform' || p.id === 'bonus-spawn') || this.level.platforms[0];
      if (spawnPlat) {
        const topSurface = spawnPlat.pos[1] + spawnPlat.size[1] / 2;
        this.currentCheckpointSpawn.x = spawnPlat.pos[0];
        this.currentCheckpointSpawn.y = topSurface + this.player.radius;
        this.currentCheckpointSpawn.z = spawnPlat.pos[2];
      }
      this.callbacks.onLifeLost(this.lives);
    }

    this.playerPos.copy(this.currentCheckpointSpawn);
    this.playerVel.set(0, 0, 0); // Solid rest on the platform, no falling or downward drop
    this.isGrounded = true;      // Firmly grounded from the very first frame
    this.coyoteTimer = 0.25;
    this.canJump = true;
    this.player.setPosition(this.playerPos.x, this.playerPos.y, this.playerPos.z);
    this.player.applySquash(1, 1, 1);
    this.isDying = false;
    this.player.setVisible(true);

    if (playParticles) {
      this.particles.emitBurst(this.playerPos, 20, 0x38bdf8);
    }
  }

  private buildLevelEnvironment() {
    // 1. Build platforms with distinct two-tone styling and edge rims
    this.level.platforms.forEach(p => {
      const group = new THREE.Group();
      group.position.set(p.pos[0], p.pos[1], p.pos[2]);

      const w = p.size[0];
      const h = p.size[1];
      const d = p.size[2];

      // Top cap height
      const capH = Math.min(0.22, Math.max(0.08, h * 0.35));
      const cliffH = Math.max(0.02, h - capH);

      // Determine top material color
      let topColor = new THREE.Color(this.worldInfo.groundColor);
      let cliffColor = new THREE.Color(this.worldInfo.cliffColor);
      let edgeColor = new THREE.Color(this.worldInfo.edgeColor);
      let roughness = 0.4;
      let metalness = 0.1;

      if (p.type === 'bouncy') {
        topColor = new THREE.Color('#f43f5e');
        cliffColor = new THREE.Color('#881337');
        edgeColor = new THREE.Color('#fda4af');
      } else if (p.type === 'ice') {
        topColor = new THREE.Color('#e0f2fe');
        cliffColor = new THREE.Color('#1e293b');
        edgeColor = new THREE.Color('#38bdf8');
        roughness = 0.05;
        metalness = 0.3;
      } else if (p.type === 'conveyor') {
        topColor = new THREE.Color('#f59e0b');
        cliffColor = new THREE.Color('#292524');
        edgeColor = new THREE.Color('#fde047');
      } else if (p.type === 'collapsing') {
        topColor = new THREE.Color('#d97706'); // Warning amber-rust
        cliffColor = new THREE.Color('#78350f');
        edgeColor = new THREE.Color('#facc15'); // Warning bright yellow
      } else if (p.type === 'moving') {
        topColor = new THREE.Color(this.worldInfo.accentColor);
        cliffColor = new THREE.Color('#78350f');
        edgeColor = new THREE.Color('#facc15');
      }

      // Natural cliff shading (warm earth, never dark black)
      const altitudeFactor = Math.max(0.85, Math.min(1.1, 1.0 + p.pos[1] * 0.02));
      cliffColor.multiplyScalar(altitudeFactor);

      // A. Top Cap Mesh (crisp walkable surface)
      const capGeo = new THREE.BoxGeometry(w, capH, d);
      const capMat = new THREE.MeshStandardMaterial({
        color: topColor,
        roughness,
        metalness,
      });
      const capMesh = new THREE.Mesh(capGeo, capMat);
      capMesh.position.y = (h - capH) / 2;
      capMesh.castShadow = true;
      capMesh.receiveShadow = true;
      group.add(capMesh);

      // Edge Highlight Trim on top cap (makes platform boundary crystal clear)
      const edges = new THREE.EdgesGeometry(capGeo);
      const lineMat = new THREE.LineBasicMaterial({
        color: edgeColor,
        transparent: true,
        opacity: 0.85,
      });
      const edgeLines = new THREE.LineSegments(edges, lineMat);
      edgeLines.position.copy(capMesh.position);
      group.add(edgeLines);

      // B. Cliff Base Body (tapered floating rock island foundation)
      if (cliffH > 0.04) {
        // Tapered floating island base
        const cliffGeo = new THREE.BoxGeometry(w * 0.95, cliffH, d * 0.95);
        const cliffMat = new THREE.MeshStandardMaterial({
          color: cliffColor,
          roughness: 0.85,
          metalness: 0.05,
        });
        const cliffMesh = new THREE.Mesh(cliffGeo, cliffMat);
        cliffMesh.position.y = -capH / 2;
        cliffMesh.castShadow = true;
        cliffMesh.receiveShadow = true;
        group.add(cliffMesh);
      }

      this.scene.add(group);

      this.platformMeshes.push({ mesh: group, def: p });

      if (p.type === 'moving' && p.moveDelta) {
        this.movingPlatforms.push({
          id: p.id,
          originalPos: group.position.clone(),
          mesh: group,
          moveDelta: new THREE.Vector3(...p.moveDelta),
          moveSpeed: p.moveSpeed || 1.5,
          prevPos: group.position.clone(),
          currentDelta: new THREE.Vector3(),
          time: Math.random() * 5,
        });
      }

      if (p.type === 'collapsing') {
        this.collapsingPlatforms.push({
          id: p.id,
          originalPos: group.position.clone(),
          mesh: group,
          state: 'idle',
          timer: 0,
        });
      }
    });

    // 2. Build Springs / Mushrooms
    if (this.level.springs) {
      this.level.springs.forEach(sp => {
        const springGroup = new THREE.Group();
        springGroup.position.set(sp.pos[0], sp.pos[1], sp.pos[2]);

        // Mushroom stalk
        const stalkGeo = new THREE.CylinderGeometry(0.2, 0.3, 0.5, 12);
        const stalkMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.6 });
        const stalk = new THREE.Mesh(stalkGeo, stalkMat);
        stalk.position.y = 0.25;
        springGroup.add(stalk);

        // Mushroom bouncy cap
        const capGeo = new THREE.SphereGeometry(0.65, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
        const capMat = new THREE.MeshStandardMaterial({
          color: 0xf43f5e,
          roughness: 0.2,
          emissive: 0x9f1239,
          emissiveIntensity: 0.2,
        });
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.y = 0.5;
        springGroup.add(cap);

        this.scene.add(springGroup);
      });
    }

    // 3. Build Collectibles (Rings, Stars, Hearts)
    this.level.collectibles.forEach(col => {
      let mesh: THREE.Object3D;
      if (col.type === 'ring') {
        const geo = new THREE.TorusGeometry(0.4, 0.08, 12, 24);
        const mat = new THREE.MeshStandardMaterial({
          color: 0xfacc15,
          metalness: 0.8,
          roughness: 0.2,
          emissive: 0xca8a04,
          emissiveIntensity: 0.3,
        });
        mesh = new THREE.Mesh(geo, mat);
      } else if (col.type === 'star') {
        const geo = new THREE.OctahedronGeometry(0.45);
        const mat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          metalness: 0.6,
          roughness: 0.1,
          emissive: 0x0284c7,
          emissiveIntensity: 0.5,
        });
        mesh = new THREE.Mesh(geo, mat);
      } else {
        // Heart
        const geo = new THREE.DodecahedronGeometry(0.35);
        const mat = new THREE.MeshStandardMaterial({
          color: 0xf43f5e,
          emissive: 0xe11d48,
          emissiveIntensity: 0.4,
        });
        mesh = new THREE.Mesh(geo, mat);
      }

      mesh.position.set(col.pos[0], col.pos[1], col.pos[2]);
      mesh.castShadow = true;
      this.scene.add(mesh);

      this.collectibles.push({
        id: col.id,
        type: col.type,
        mesh,
        pos: mesh.position.clone(),
        collected: false,
      });
    });

    // 4. Build Checkpoints
    this.level.checkpoints.forEach(cp => {
      const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.4, 8);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(cp.pos[0], cp.pos[1] + 1.2, cp.pos[2]);
      this.scene.add(pole);

      const flagGeo = new THREE.BoxGeometry(0.8, 0.45, 0.04);
      const flagMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15, // Yellow before activation, Green after
        emissive: 0xca8a04,
        emissiveIntensity: 0.2,
      });
      const flagMesh = new THREE.Mesh(flagGeo, flagMat);
      flagMesh.position.set(cp.pos[0] + 0.4, cp.pos[1] + 2.0, cp.pos[2]);
      this.scene.add(flagMesh);

      const beaconLight = new THREE.PointLight(0xfacc15, 1.0, 5);
      beaconLight.position.set(cp.pos[0], cp.pos[1] + 2.5, cp.pos[2]);
      this.scene.add(beaconLight);

      this.checkpoints.push({
        id: cp.id,
        pos: new THREE.Vector3(...cp.pos),
        spawnPos: new THREE.Vector3(...cp.spawnPos),
        activated: false,
        beaconLight,
        flagMesh,
      });
    });

    // 5. Build Switches & Doors
    if (this.level.switches) {
      this.level.switches.forEach(sw => {
        const swBaseGeo = new THREE.CylinderGeometry(0.7, 0.8, 0.15, 16);
        const swBaseMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
        const swBase = new THREE.Mesh(swBaseGeo, swBaseMat);
        swBase.position.set(sw.pos[0], sw.pos[1] + 0.08, sw.pos[2]);
        this.scene.add(swBase);

        const buttonGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16);
        const buttonMat = new THREE.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0x991b1b,
          emissiveIntensity: 0.3,
        });
        const button = new THREE.Mesh(buttonGeo, buttonMat);
        button.position.set(sw.pos[0], sw.pos[1] + 0.18, sw.pos[2]);
        this.scene.add(button);

        this.switches.push({
          id: sw.id,
          mesh: button,
          targetDoorId: sw.targetDoorId,
          pressed: false,
          pos: new THREE.Vector3(...sw.pos),
        });
      });
    }

    if (this.level.doors) {
      this.level.doors.forEach(dr => {
        const doorGeo = new THREE.BoxGeometry(dr.size[0], dr.size[1], dr.size[2]);
        const doorMat = new THREE.MeshStandardMaterial({
          color: 0x334155,
          metalness: 0.6,
          roughness: 0.3,
        });
        const doorMesh = new THREE.Mesh(doorGeo, doorMat);
        doorMesh.position.set(dr.pos[0], dr.pos[1], dr.pos[2]);
        this.scene.add(doorMesh);

        this.doors.push({
          id: dr.id,
          mesh: doorMesh,
          closedPos: doorMesh.position.clone(),
          openOffset: new THREE.Vector3(...(dr.openOffset || [0, 4, 0])),
          currentOffset: new THREE.Vector3(),
          targetOpen: false,
        });
      });
    }

    // 6. Build Devil 😈 Enemies
    if (this.level.enemies) {
      this.level.enemies.forEach(en => {
        const enemyGroup = new THREE.Group();
        enemyGroup.position.set(en.pos[0], en.pos[1], en.pos[2]);

        // Sinister Devil Body (crimson/purple demon)
        const bodyGeo = new THREE.SphereGeometry(0.48, 16, 14);
        const bodyMat = new THREE.MeshStandardMaterial({
          color: 0x991b1b, // Devil crimson red
          roughness: 0.35,
          emissive: 0x581c87, // Subtle demonic purple glow
          emissiveIntensity: 0.35,
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        enemyGroup.add(body);

        // Devil Horns 😈
        const hornGeo = new THREE.ConeGeometry(0.12, 0.36, 8);
        const hornMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b, // Sharp glowing golden horns
          roughness: 0.2,
          emissive: 0xd97706,
          emissiveIntensity: 0.35,
        });

        const leftHorn = new THREE.Mesh(hornGeo, hornMat);
        leftHorn.position.set(-0.24, 0.44, 0.05);
        leftHorn.rotation.z = 0.35;
        leftHorn.rotation.x = -0.15;
        enemyGroup.add(leftHorn);

        const rightHorn = new THREE.Mesh(hornGeo, hornMat);
        rightHorn.position.set(0.24, 0.44, 0.05);
        rightHorn.rotation.z = -0.35;
        rightHorn.rotation.x = -0.15;
        enemyGroup.add(rightHorn);

        // Glowing evil eyes
        const eyeGeo = new THREE.SphereGeometry(0.09, 10, 8);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 }); // Glowing yellow eyes
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.16, 0.12, 0.43);
        leftEye.scale.set(1.2, 0.8, 0.5);
        leftEye.rotation.z = -0.3;
        enemyGroup.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.16, 0.12, 0.43);
        rightEye.scale.set(1.2, 0.8, 0.5);
        rightEye.rotation.z = 0.3;
        enemyGroup.add(rightEye);

        // Evil eye pupils
        const pupilGeo = new THREE.SphereGeometry(0.04, 8, 8);
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x450a0a });
        const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
        leftPupil.position.set(-0.16, 0.12, 0.48);
        enemyGroup.add(leftPupil);

        const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
        rightPupil.position.set(0.16, 0.12, 0.48);
        enemyGroup.add(rightPupil);

        this.scene.add(enemyGroup);

        this.enemies.push({
          id: en.id,
          mesh: enemyGroup,
          pos: enemyGroup.position.clone(),
          originPos: enemyGroup.position.clone(),
          patrolDelta: new THREE.Vector3(...(en.patrolDelta || [2.5, 0, 0])),
          speed: en.speed || 1.5,
          type: en.type,
          time: Math.random() * 5,
        });
      });
    }

    // 7. Build Hazards (Spikes, Lava Pools, Fire Geysers)
    if (this.level.hazards) {
      this.level.hazards.forEach(h => {
        if (h.type === 'spike') {
          const spikeGeo = new THREE.ConeGeometry(h.size[0] * 0.25, h.size[1], 8);
          const spikeMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.2 });
          const spike = new THREE.Mesh(spikeGeo, spikeMat);
          spike.position.set(h.pos[0], h.pos[1] + h.size[1] / 2, h.pos[2]);
          this.scene.add(spike);
        } else if (h.type === 'lava') {
          const lavaGeo = new THREE.BoxGeometry(h.size[0], h.size[1], h.size[2]);
          const lavaMat = new THREE.MeshStandardMaterial({
            color: 0xef4444,
            emissive: 0xd97706,
            emissiveIntensity: 0.7,
            roughness: 0.2,
          });
          const lava = new THREE.Mesh(lavaGeo, lavaMat);
          lava.position.set(h.pos[0], h.pos[1], h.pos[2]);
          this.scene.add(lava);
        } else if (h.type === 'fire_geyser') {
          const geyserGeo = new THREE.CylinderGeometry(0.3, 0.5, h.size[1], 12);
          const geyserMat = new THREE.MeshStandardMaterial({
            color: 0xf97316,
            emissive: 0xea580c,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.85,
          });
          const geyser = new THREE.Mesh(geyserGeo, geyserMat);
          geyser.position.set(h.pos[0], h.pos[1] + h.size[1] / 2, h.pos[2]);
          this.scene.add(geyser);
        }
      });
    }

    // 8. Build Goal Portal (Classic Star Gateway)
    const goalGroup = new THREE.Group();
    goalGroup.position.set(this.level.goalPos[0], this.level.goalPos[1], this.level.goalPos[2]);

    const archGeo = new THREE.TorusGeometry(1.4, 0.18, 16, 32);
    const archMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0xca8a04,
      emissiveIntensity: 0.5,
    });
    const arch = new THREE.Mesh(archGeo, archMat);
    arch.position.y = 1.0;
    goalGroup.add(arch);

    // Glowing inner energy swirl
    const energyGeo = new THREE.CircleGeometry(1.2, 32);
    const energyMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
    });
    const energy = new THREE.Mesh(energyGeo, energyMat);
    energy.position.y = 1.0;
    goalGroup.add(energy);

    const goalLight = new THREE.PointLight(0x38bdf8, 2.0, 8);
    goalLight.position.set(0, 1.2, 0);
    goalGroup.add(goalLight);

    this.scene.add(goalGroup);
    this.goalMesh = goalGroup;
  }

  public update(delta: number) {
    if (this.isCompleted) {
      this.particles.update(delta);
      return;
    }

    this.timeElapsed += delta;

    // Handle dying respawn sequence
    if (this.isDying) {
      this.deathTimer += delta;
      if (this.deathTimer >= 0.6) {
        this.respawnPlayer(true);
      }
      this.particles.update(delta);
      return;
    }

    // 1. Update moving platforms (zero-allocation physics)
    this.movingPlatforms.forEach(mp => {
      mp.time += delta * mp.moveSpeed;
      const progress = (Math.sin(mp.time) + 1) * 0.5;
      mp.currentDelta.copy(mp.originalPos).addScaledVector(mp.moveDelta, progress).sub(mp.prevPos);
      mp.prevPos.add(mp.currentDelta);
      mp.mesh.position.copy(mp.prevPos);
    });

    // 2. Update weak / collapsing platforms (collapses rapidly in ~380ms!)
    this.collapsingPlatforms.forEach(cp => {
      if (cp.state === 'shaking') {
        cp.timer += delta;
        // Intense high-frequency crumbling vibration
        const jitter = Math.sin(cp.timer * 45) * 0.16;
        cp.mesh.position.x = cp.originalPos.x + jitter;
        cp.mesh.position.z = cp.originalPos.z + (Math.random() - 0.5) * 0.08;

        if (Math.random() < 0.35) {
          this.particles.emitDust(cp.mesh.position, 2, 0xd97706);
        }

        if (cp.timer >= 0.38) { // Fast collapse: ~380ms
          cp.state = 'falling';
          cp.timer = 0;
          soundManager.playSwitch();
          this.particles.emitBurst(cp.mesh.position, 14, 0xd97706);
        }
      } else if (cp.state === 'falling') {
        cp.timer += delta;
        cp.mesh.position.y -= 22 * delta;
        cp.mesh.rotation.z += delta * 1.5;
        cp.mesh.scale.multiplyScalar(0.96);
        if (cp.timer >= 3.0) {
          cp.state = 'respawning';
          cp.timer = 0;
          cp.mesh.position.copy(cp.originalPos);
          cp.mesh.rotation.set(0, 0, 0);
          cp.mesh.scale.set(0.01, 0.01, 0.01);
        }
      } else if (cp.state === 'respawning') {
        cp.timer += delta;
        const scale = Math.min(1.0, cp.timer * 2.5);
        cp.mesh.scale.set(scale, scale, scale);
        if (cp.timer >= 0.4) {
          cp.state = 'idle';
          cp.mesh.scale.set(1, 1, 1);
        }
      }
    });

    // 3. Update doors
    this.doors.forEach(dr => {
      const target = dr.targetOpen ? dr.openOffset : new THREE.Vector3(0, 0, 0);
      dr.currentOffset.lerp(target, delta * 3.0);
      dr.mesh.position.copy(dr.closedPos).add(dr.currentOffset);
    });

    // 4. Update enemies
    this.enemies.forEach(en => {
      en.time += delta * en.speed;
      if (en.type === 'chaser') {
        const distToPlayer = en.pos.distanceTo(this.playerPos);
        if (distToPlayer < 10) {
          const dir = new THREE.Vector3().subVectors(this.playerPos, en.pos).setY(0).normalize();
          en.pos.addScaledVector(dir, delta * en.speed);
        }
      } else {
        // Patrol
        const factor = Math.sin(en.time);
        en.pos.copy(en.originPos).addScaledVector(en.patrolDelta, factor);
      }
      en.mesh.position.copy(en.pos);

      // Check hit with player (contact with the devil 😈 results in player being dead)
      if (en.pos.distanceTo(this.playerPos) < 1.15 && !this.isDying) {
        this.triggerHurt();
      }
    });

    // 5. Animate collectibles (rotation & float)
    this.collectibles.forEach(col => {
      if (col.collected) return;
      col.mesh.rotation.y += delta * 2.5;
      col.mesh.position.y = col.pos.y + Math.sin(this.timeElapsed * 3 + col.pos.x) * 0.12;

      // Check pickup
      if (col.mesh.position.distanceTo(this.playerPos) < 0.9) {
        col.collected = true;
        col.mesh.visible = false;

        if (col.type === 'ring') {
          this.ringsCollected++;
          soundManager.playRingCollect();
          this.particles.emitSparkles(this.playerPos, 12, 0xfacc15);
          this.callbacks.onRingCollected(this.ringsCollected);
        } else if (col.type === 'star') {
          this.starsCollected++;
          soundManager.playStarCollect();
          this.particles.emitSparkles(this.playerPos, 20, 0x38bdf8);
          this.callbacks.onStarCollected(this.starsCollected);
        } else if (col.type === 'heart') {
          this.lives = Math.min(3, this.lives + 1);
          soundManager.playBounce(false);
          this.particles.emitBurst(this.playerPos, 15, 0xf43f5e);
          this.callbacks.onLifeLost(this.lives);
        }
      }
    });

    // 6. Check Checkpoints
    this.checkpoints.forEach(cp => {
      if (!cp.activated && cp.pos.distanceTo(this.playerPos) < 2.0) {
        cp.activated = true;
        this.currentCheckpointSpawn.copy(cp.spawnPos);
        (cp.flagMesh.material as THREE.MeshStandardMaterial).color.set(0x22c55e);
        (cp.flagMesh.material as THREE.MeshStandardMaterial).emissive.set(0x15803d);
        cp.beaconLight.color.set(0x22c55e);
        soundManager.playCheckpoint();
        this.particles.emitSparkles(cp.pos, 25, 0x22c55e);
        this.callbacks.onCheckpoint(cp.id);
      }
    });

    // 7. Check Switches
    this.switches.forEach(sw => {
      const dist = sw.pos.distanceTo(this.playerPos);
      if (dist < 1.0 && !sw.pressed) {
        sw.pressed = true;
        sw.mesh.position.y = sw.pos.y + 0.08;
        soundManager.playSwitch();
        this.particles.emitSparkles(sw.pos, 10, 0xef4444);

        // Open target door
        const targetDoor = this.doors.find(d => d.id === sw.targetDoorId);
        if (targetDoor) {
          targetDoor.targetOpen = true;
        }
      }
    });

    // 8. Goal portal rotation & hit check
    if (this.goalMesh) {
      this.goalMesh.rotation.y += delta * 1.0;
      if (this.goalMesh.position.distanceTo(this.playerPos) < 1.8 && !this.isCompleted) {
        this.isCompleted = true;
        soundManager.playLevelClear();
        this.player.onBounce(20);
        this.particles.emitBurst(this.playerPos, 50, 0xfacc15);
        this.callbacks.onGoalReached();
      }
    }

    // 9. Check Hazards (spikes, lava, pit fall)
    if (this.playerPos.y < -12 && !this.isDying) {
      this.triggerHurt();
      return;
    }

    if (this.level.hazards) {
      this.level.hazards.forEach(h => {
        const hPos = new THREE.Vector3(...h.pos);
        if (h.type === 'lava' || h.type === 'spike' || h.type === 'fire_geyser') {
          // AABB distance check
          const dx = Math.abs(this.playerPos.x - hPos.x);
          const dy = Math.abs(this.playerPos.y - hPos.y);
          const dz = Math.abs(this.playerPos.z - hPos.z);

          if (dx < h.size[0] / 2 + 0.4 && dy < h.size[1] / 2 + 0.4 && dz < h.size[2] / 2 + 0.4) {
            this.triggerHurt();
          }
        }
      });
    }

    // 10. Core Player Movement & Physics Integration (sub-stepped for rock-solid stability)
    const safeDelta = Math.min(delta, 0.033);
    const steps = 3;
    const subDelta = safeDelta / steps;
    for (let i = 0; i < steps; i++) {
      this.updatePlayerPhysics(subDelta);
    }

    // 11. Update Player Visuals & Particles
    this.player.setPosition(this.playerPos.x, this.playerPos.y, this.playerPos.z);
    this.player.update(delta, this.playerVel, this.isGrounded);
    this.particles.update(delta);
  }

  private triggerHurt() {
    if (this.isDying || this.isCompleted) return;
    this.isDying = true;
    this.deathTimer = 0;
    this.lives = Math.max(0, this.lives - 1);
    soundManager.playHurt();
    this.player.applySquash(1.8, 0.2, 1.8);
    this.player.setVisible(false); // Ball pops & disappears instantly (dead, same as falling into the void)
    this.particles.emitBurst(this.playerPos, 35, 0xef4444);
    this.particles.emitSparkles(this.playerPos, 20, 0xf97316);
    this.callbacks.onLifeLost(this.lives);
  }

  private updatePlayerPhysics(clampedDelta: number) {
    // Continuous contact check with devil enemies: guarantees instant death on contact
    if (!this.isDying && this.enemies.length > 0) {
      for (let i = 0; i < this.enemies.length; i++) {
        if (this.enemies[i].pos.distanceTo(this.playerPos) < 1.15) {
          this.triggerHurt();
          return;
        }
      }
    }

    // Apply wind forces if player is in wind zone
    if (this.level.windZones) {
      this.level.windZones.forEach(wz => {
        const wPos = new THREE.Vector3(...wz.pos);
        const dx = Math.abs(this.playerPos.x - wPos.x);
        const dy = Math.abs(this.playerPos.y - wPos.y);
        const dz = Math.abs(this.playerPos.z - wPos.z);
        if (dx < wz.size[0] / 2 && dy < wz.size[1] / 2 && dz < wz.size[2] / 2) {
          this.playerVel.x += wz.force[0] * clampedDelta;
          this.playerVel.y += wz.force[1] * clampedDelta;
          this.playerVel.z += wz.force[2] * clampedDelta;
        }
      });
    }

    // Movement parameters
    const maxSpeed = this.isBoosting ? 14.5 : 9.5;
    const accelRate = this.isGrounded ? 36.0 : 18.0;

    const targetVx = this.inputMove.x * maxSpeed;
    const targetVz = this.inputMove.y * maxSpeed;

    // Air friction vs ground friction
    let groundFriction = 0.88;
    let standingSurfaceType: LevelDef['platforms'][0]['type'] = 'normal';
    let standingPlatformDelta: THREE.Vector3 | null = null;
    let standingConveyorSpeed: THREE.Vector3 | null = null;

    // Coyote time & Jump buffer
    if (this.isGrounded) {
      this.coyoteTimer = 0.25;
      this.canJump = true;
    } else {
      this.coyoteTimer -= clampedDelta;
    }

    if (this.isJumping) {
      this.jumpBuffer = 0.30;
    } else {
      this.jumpBuffer -= clampedDelta;
    }

    // Trigger Jump: instant zero-latency jump response
    if (this.jumpBuffer > 0 && (this.coyoteTimer > 0 || this.isGrounded) && this.canJump) {
      this.playerVel.y = 13.5;
      this.playerPos.y += 0.15; // Instantly unstick from platform surface
      this.isGrounded = false;
      this.coyoteTimer = 0;
      this.jumpBuffer = 0;
      this.canJump = false;
      soundManager.playJump();
      this.player.onJump();
      this.particles.emitDust(this.playerPos, 8, 0xffffff);
    }

    // Apply gravity
    const gravity = -28.0;
    this.playerVel.y += gravity * clampedDelta;

    // Horizontal acceleration
    this.playerVel.x += (targetVx - this.playerVel.x) * (accelRate * clampedDelta);
    this.playerVel.z += (targetVz - this.playerVel.z) * (accelRate * clampedDelta);

    // Friction when no input
    if (this.inputMove.lengthSq() < 0.01 && this.isGrounded) {
      this.playerVel.x *= groundFriction;
      this.playerVel.z *= groundFriction;
    }

    // Integrate position first
    this.playerPos.x += this.playerVel.x * clampedDelta;
    this.playerPos.y += this.playerVel.y * clampedDelta;
    this.playerPos.z += this.playerVel.z * clampedDelta;

    // Platform collision & Ground detection (Sphere vs Boxes)
    const sphereRadius = this.player.radius;
    let foundGround = false;

    // Perform collision resolution against all solid platforms and doors
    for (const p of this.platformMeshes) {
      // Skip falling collapsed platforms
      const collapsing = this.collapsingPlatforms.find(c => c.id === p.def.id);
      if (collapsing && collapsing.state === 'falling') continue;

      const pPos = p.mesh.position;
      const pHalfW = p.def.size[0] / 2;
      const pHalfH = p.def.size[1] / 2;
      const pHalfD = p.def.size[2] / 2;

      const topSurfaceY = pPos.y + pHalfH;
      const floorY = topSurfaceY + sphereRadius;

      // Check if horizontally within top platform bounds
      const inTopX = this.playerPos.x >= pPos.x - pHalfW - sphereRadius * 0.75 &&
                     this.playerPos.x <= pPos.x + pHalfW + sphereRadius * 0.75;
      const inTopZ = this.playerPos.z >= pPos.z - pHalfD - sphereRadius * 0.75 &&
                     this.playerPos.z <= pPos.z + pHalfD + sphereRadius * 0.75;

      // If player is on or falling onto the top surface of this platform (ONLY when falling or standing, NOT jumping upward):
      if (inTopX && inTopZ && this.playerVel.y <= 0.05 && this.playerPos.y <= floorY + 0.30 && this.playerPos.y >= topSurfaceY - 0.50) {
        this.playerPos.y = floorY;
        if (this.playerVel.y < 0) {
          if (this.playerVel.y < -3) {
            soundManager.playLand();
            this.player.onLand(Math.abs(this.playerVel.y));
            this.particles.emitDust(this.playerPos, 8, 0xffffff);
          }
          this.playerVel.y = 0;
        }
        foundGround = true;
        standingSurfaceType = p.def.type || 'normal';

        const moving = this.movingPlatforms.find(m => m.id === p.def.id);
        if (moving) standingPlatformDelta = moving.currentDelta;

        if (p.def.conveyorSpeed) standingConveyorSpeed = new THREE.Vector3(...p.def.conveyorSpeed);

        if (collapsing && collapsing.state === 'idle') {
          collapsing.state = 'shaking';
          collapsing.timer = 0;
        }
        continue;
      }

      // Side wall / bottom box collision
      const closestX = Math.max(pPos.x - pHalfW, Math.min(this.playerPos.x, pPos.x + pHalfW));
      const closestY = Math.max(pPos.y - pHalfH, Math.min(this.playerPos.y, pPos.y + pHalfH));
      const closestZ = Math.max(pPos.z - pHalfD, Math.min(this.playerPos.z, pPos.z + pHalfD));

      const distX = this.playerPos.x - closestX;
      const distY = this.playerPos.y - closestY;
      const distZ = this.playerPos.z - closestZ;
      const distSq = distX * distX + distY * distY + distZ * distZ;

      if (distSq < sphereRadius * sphereRadius) {
        const dist = Math.sqrt(distSq);
        const overlap = sphereRadius - dist;

        let nx = distX;
        let ny = distY;
        let nz = distZ;

        if (dist > 0.0001) {
          nx /= dist;
          ny /= dist;
          nz /= dist;
        } else {
          ny = 1;
        }

        // If player is on or above the platform's center, do not push downward through the platform
        if (this.playerPos.y >= pPos.y && ny < 0) {
          ny = 0;
        }

        this.playerPos.x += nx * overlap;
        this.playerPos.y += ny * overlap;
        this.playerPos.z += nz * overlap;

        if (ny > 0.5) {
          foundGround = true;
          standingSurfaceType = p.def.type || 'normal';
          if (this.playerVel.y < 0) this.playerVel.y = 0;
        } else if (ny < -0.5) {
          if (this.playerVel.y > 0) this.playerVel.y = 0;
        } else {
          const dot = this.playerVel.x * nx + this.playerVel.z * nz;
          if (dot < 0) {
            this.playerVel.x -= dot * nx;
            this.playerVel.z -= dot * nz;
          }
        }
      }
    }

    // Door collisions
    this.doors.forEach(dr => {
      const pPos = dr.mesh.position;
      const drDef = this.level.doors?.find(d => d.id === dr.id);
      if (!drDef) return;

      const pHalfW = drDef.size[0] / 2;
      const pHalfH = drDef.size[1] / 2;
      const pHalfD = drDef.size[2] / 2;

      const closestX = Math.max(pPos.x - pHalfW, Math.min(this.playerPos.x, pPos.x + pHalfW));
      const closestY = Math.max(pPos.y - pHalfH, Math.min(this.playerPos.y, pPos.y + pHalfH));
      const closestZ = Math.max(pPos.z - pHalfD, Math.min(this.playerPos.z, pPos.z + pHalfD));

      const distX = this.playerPos.x - closestX;
      const distY = this.playerPos.y - closestY;
      const distZ = this.playerPos.z - closestZ;
      const distSq = distX * distX + distY * distY + distZ * distZ;

      if (distSq < sphereRadius * sphereRadius) {
        const dist = Math.sqrt(distSq);
        const overlap = sphereRadius - dist;
        let nx = dist > 0.0001 ? distX / dist : 0;
        let ny = dist > 0.0001 ? distY / dist : 1;
        let nz = dist > 0.0001 ? distZ / dist : 0;

        this.playerPos.x += nx * overlap;
        this.playerPos.y += ny * overlap;
        this.playerPos.z += nz * overlap;

        const dot = this.playerVel.x * nx + this.playerVel.y * ny + this.playerVel.z * nz;
        if (dot < 0) {
          this.playerVel.x -= dot * nx;
          this.playerVel.y -= dot * ny;
          this.playerVel.z -= dot * nz;
        }
      }
    });

    // Check Mushroom / Springs bounce (zero-allocation physics)
    if (this.level.springs) {
      for (let i = 0; i < this.level.springs.length; i++) {
        const sp = this.level.springs[i];
        const dx = this.playerPos.x - sp.pos[0];
        const dy = this.playerPos.y - (sp.pos[1] + 0.45);
        const dz = this.playerPos.z - sp.pos[2];
        if (dx * dx + dz * dz < 0.95 * 0.95 && dy > -0.25 && dy < 1.1 && this.playerVel.y <= 1.0) {
          this.playerVel.y = sp.power;
          soundManager.playBounce(true);
          this.player.onBounce(sp.power);
          this.particles.emitSparkles(this.playerPos, 18, 0xf43f5e);
          foundGround = false;
        }
      }
    }

    // Apply ground displacement if on moving platform
    if (standingPlatformDelta) {
      this.playerPos.add(standingPlatformDelta);
    }

    // Apply conveyor speed
    if (standingConveyorSpeed) {
      this.playerVel.x += standingConveyorSpeed.x * clampedDelta * 4;
      this.playerVel.z += standingConveyorSpeed.z * clampedDelta * 4;
    }

    // Surface friction adjustments
    if (standingSurfaceType === 'ice') {
      groundFriction = 0.985; // high drift
    } else if (this.worldInfo.theme === 'desert') {
      groundFriction = 0.78;
    }

    this.isGrounded = foundGround;

    // Emit rolling particles when rolling fast on the ground
    const horizSpeed = Math.sqrt(this.playerVel.x * this.playerVel.x + this.playerVel.z * this.playerVel.z);
    if (this.isGrounded && horizSpeed > 3.0 && Math.random() < 0.25) {
      this.particles.emitDust(this.playerPos, 2, 0xe2e8f0);
    }
  }

  public dispose() {
    this.particles.dispose(this.scene);
    this.platformMeshes.forEach(p => {
      this.scene.remove(p.mesh);
      p.mesh.traverse((child) => {
        if ((child as THREE.Mesh).isMesh || (child as THREE.LineSegments).isLineSegments) {
          const meshChild = child as THREE.Mesh;
          if (meshChild.geometry) meshChild.geometry.dispose();
          if (meshChild.material) {
            if (Array.isArray(meshChild.material)) {
              meshChild.material.forEach(m => m.dispose());
            } else {
              meshChild.material.dispose();
            }
          }
        }
      });
    });
    this.collectibles.forEach(c => {
      this.scene.remove(c.mesh);
    });
    this.enemies.forEach(e => {
      this.scene.remove(e.mesh);
    });
    this.scene.remove(this.player.group);
  }
}
