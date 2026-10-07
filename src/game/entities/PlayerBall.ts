import * as THREE from 'three';

export class PlayerBall {
  public group: THREE.Group;
  public innerMesh: THREE.Mesh;
  public faceGroup: THREE.Group;
  public leftEye: THREE.Mesh;
  public rightEye: THREE.Mesh;
  public leftPupil: THREE.Mesh;
  public rightPupil: THREE.Mesh;

  public radius = 0.5;

  // Squash and stretch state
  public targetScale = new THREE.Vector3(1, 1, 1);
  public currentScale = new THREE.Vector3(1, 1, 1);
  public stretchVelocity = new THREE.Vector3(0, 0, 0);

  // Rotation quaternion for physics rolling
  public rollQuaternion = new THREE.Quaternion();

  // Face look direction
  private lookTarget = new THREE.Vector3(0, 0, -1);
  private currentLook = new THREE.Vector3(0, 0, -1);

  constructor() {
    this.group = new THREE.Group();

    // Red sphere body
    const bodyGeometry = new THREE.SphereGeometry(this.radius, 32, 24);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xef4444, // Vibrant iconic red
      roughness: 0.25,
      metalness: 0.15,
      emissive: 0x991b1b,
      emissiveIntensity: 0.15,
    });

    this.innerMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.innerMesh.castShadow = true;
    this.innerMesh.receiveShadow = false;
    this.group.add(this.innerMesh);

    // Subtle decorative pattern lines on the ball (golden bounce seam)
    const ringGeo = new THREE.TorusGeometry(this.radius * 0.99, 0.015, 12, 48);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      roughness: 0.3,
      metalness: 0.5,
    });
    const seam = new THREE.Mesh(ringGeo, ringMat);
    seam.rotation.x = Math.PI / 2;
    this.innerMesh.add(seam);

    // Face group for expressive eyes (floats slightly on front of ball and looks toward velocity)
    this.faceGroup = new THREE.Group();
    this.group.add(this.faceGroup);

    // Eye whites
    const eyeGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
    });

    this.leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    this.leftEye.position.set(-0.16, 0.14, 0.42);
    this.leftEye.scale.set(1.0, 1.3, 0.6);
    this.faceGroup.add(this.leftEye);

    this.rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    this.rightEye.position.set(0.16, 0.14, 0.42);
    this.rightEye.scale.set(1.0, 1.3, 0.6);
    this.faceGroup.add(this.rightEye);

    // Pupils
    const pupilGeo = new THREE.SphereGeometry(0.065, 16, 16);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x1e1b4b });

    this.leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    this.leftPupil.position.set(-0.16, 0.14, 0.47);
    this.faceGroup.add(this.leftPupil);

    this.rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    this.rightPupil.position.set(0.16, 0.14, 0.47);
    this.faceGroup.add(this.rightPupil);
  }

  public applySquash(sx: number, sy: number, sz: number) {
    this.currentScale.set(sx, sy, sz);
  }

  public onJump() {
    this.applySquash(0.75, 1.4, 0.75);
  }

  public onLand(impactSpeed: number) {
    const factor = Math.min(0.5, impactSpeed * 0.03);
    this.applySquash(1 + factor * 1.2, 1 - factor * 1.5, 1 + factor * 1.2);
  }

  public onBounce(power: number) {
    const factor = Math.min(0.6, power * 0.035);
    this.applySquash(1 - factor * 0.8, 1 + factor * 1.5, 1 - factor * 0.8);
  }

  public update(delta: number, velocity: THREE.Vector3, isGrounded: boolean) {
    // 1. Spring squash-and-stretch back to (1, 1, 1)
    const tension = 320;
    const damping = 22;

    const diff = new THREE.Vector3().subVectors(this.targetScale, this.currentScale);
    const accel = diff.multiplyScalar(tension).sub(this.stretchVelocity.clone().multiplyScalar(damping));

    this.stretchVelocity.addScaledVector(accel, delta);
    this.currentScale.addScaledVector(this.stretchVelocity, delta);

    // Clamp scales to safe physical values
    this.currentScale.x = Math.max(0.4, Math.min(2.0, this.currentScale.x));
    this.currentScale.y = Math.max(0.3, Math.min(2.2, this.currentScale.y));
    this.currentScale.z = Math.max(0.4, Math.min(2.0, this.currentScale.z));

    this.innerMesh.scale.copy(this.currentScale);

    // 2. Physical ball rolling rotation
    // Calculate angular velocity vector perpendicular to ground motion
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
    if (speed > 0.05) {
      const axis = new THREE.Vector3(velocity.z, 0, -velocity.x).normalize();
      const angle = (speed / this.radius) * delta;
      const rotQuat = new THREE.Quaternion().setFromAxisAngle(axis, angle);
      this.rollQuaternion.premultiply(rotQuat);
      this.innerMesh.quaternion.copy(this.rollQuaternion);

      // Face looks toward direction of travel
      this.lookTarget.set(velocity.x, 0, velocity.z).normalize();
    }

    // 3. Smoothly align face towards travel or forward
    this.currentLook.lerp(this.lookTarget, delta * 8.0);
    this.faceGroup.lookAt(
      this.faceGroup.position.x + this.currentLook.x,
      this.faceGroup.position.y,
      this.faceGroup.position.z + this.currentLook.z
    );

    // 4. Subtle airborne stretch along velocity Y
    if (!isGrounded && Math.abs(velocity.y) > 4) {
      const vertStretch = Math.sign(velocity.y) * Math.min(0.2, Math.abs(velocity.y) * 0.015);
      this.targetScale.set(1 - vertStretch * 0.5, 1 + vertStretch, 1 - vertStretch * 0.5);
    } else {
      this.targetScale.set(1, 1, 1);
    }
  }

  public setPosition(x: number, y: number, z: number) {
    this.group.position.set(x, y, z);
  }

  public setVisible(v: boolean) {
    this.group.visible = v;
  }
}
