import * as THREE from 'three';

export interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  size: number;
  maxLife: number;
  life: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  public mesh: THREE.Points;

  private maxParticles = 600;
  private positions: Float32Array;
  private colors: Float32Array;
  private sizes: Float32Array;

  constructor(scene: THREE.Scene) {
    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.maxParticles * 3);
    this.colors = new Float32Array(this.maxParticles * 3);
    this.sizes = new Float32Array(this.maxParticles);

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));

    this.material = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.mesh = new THREE.Points(this.geometry, this.material);
    scene.add(this.mesh);
  }

  public emitDust(pos: THREE.Vector3, count = 8, colorHex = 0xffffff) {
    const col = new THREE.Color(colorHex);
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 1.5;
      this.particles.push({
        position: pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.3, 0.1, (Math.random() - 0.5) * 0.3)),
        velocity: new THREE.Vector3(Math.cos(angle) * speed, Math.random() * 0.8 + 0.3, Math.sin(angle) * speed),
        color: col,
        size: 0.2 + Math.random() * 0.25,
        maxLife: 0.4 + Math.random() * 0.3,
        life: 0,
      });
    }
  }

  public emitSparkles(pos: THREE.Vector3, count = 16, colorHex = 0xfacc15) {
    const col = new THREE.Color(colorHex);
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const speed = 1.5 + Math.random() * 3.0;

      this.particles.push({
        position: pos.clone(),
        velocity: new THREE.Vector3(
          Math.sin(theta) * Math.cos(phi) * speed,
          Math.cos(theta) * speed + 1.0,
          Math.sin(theta) * Math.sin(phi) * speed
        ),
        color: col,
        size: 0.25 + Math.random() * 0.3,
        maxLife: 0.6 + Math.random() * 0.4,
        life: 0,
      });
    }
  }

  public emitBurst(pos: THREE.Vector3, count = 25, colorHex = 0xef4444) {
    const col = new THREE.Color(colorHex);
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      this.particles.push({
        position: pos.clone(),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 5,
          Math.random() * 4 + 1.5,
          (Math.random() - 0.5) * 5
        ),
        color: col,
        size: 0.35 + Math.random() * 0.25,
        maxLife: 0.8,
        life: 0,
      });
    }
  }

  public update(delta: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += delta;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      // Physics integration
      p.position.addScaledVector(p.velocity, delta);
      p.velocity.y -= 9.8 * delta * 0.5; // gentle gravity
      p.velocity.multiplyScalar(0.97); // drag
    }

    // Update geometry buffers
    const activeCount = this.particles.length;
    for (let i = 0; i < this.maxParticles; i++) {
      const i3 = i * 3;
      if (i < activeCount) {
        const p = this.particles[i];
        const progress = p.life / p.maxLife;
        const fade = 1 - progress;

        this.positions[i3] = p.position.x;
        this.positions[i3 + 1] = p.position.y;
        this.positions[i3 + 2] = p.position.z;

        this.colors[i3] = p.color.r * fade;
        this.colors[i3 + 1] = p.color.g * fade;
        this.colors[i3 + 2] = p.color.b * fade;

        this.sizes[i] = p.size * fade;
      } else {
        this.positions[i3] = 0;
        this.positions[i3 + 1] = -9999;
        this.positions[i3 + 2] = 0;
        this.sizes[i] = 0;
      }
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
    this.geometry.attributes.size.needsUpdate = true;
  }

  public dispose(scene: THREE.Scene) {
    scene.remove(this.mesh);
    this.geometry.dispose();
    this.material.dispose();
  }
}
