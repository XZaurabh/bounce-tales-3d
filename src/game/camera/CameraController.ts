import * as THREE from 'three';

export type CameraMode = 'assisted' | 'manual' | 'fixed';

export class CameraController {
  public camera: THREE.PerspectiveCamera;
  public mode: CameraMode = 'manual';

  // Spherical coordinates
  public distance = 7.5;
  public targetDistance = 7.5;
  public minDistance = 3.5;
  public maxDistance = 14.0;

  // Unlimited 360-degree yaw angle in radians
  public yaw = 0;
  // Pitch angle in radians (from low ground angle to overhead)
  public pitch = 0.38;

  public sensitivity = 1.0;
  public invertX = false;
  public invertY = false;

  // Manual interaction timer (prevents auto-assist from overriding active player input)
  private timeSinceManualInput = 999;

  // Smoothing
  private currentLookTarget = new THREE.Vector3();
  private currentCamPos = new THREE.Vector3();

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.camera.position.set(0, 4, 8);
    this.camera.lookAt(0, 1, 0);
  }

  /**
   * Immediately snap camera target and position to player spawn point (no frame-1 swoop)
   */
  public init(playerPos: THREE.Vector3) {
    this.currentLookTarget.set(playerPos.x, playerPos.y + 0.6, playerPos.z);
    const cosPitch = Math.cos(this.pitch);
    const sinPitch = Math.sin(this.pitch);
    const cosYaw = Math.cos(this.yaw);
    const sinYaw = Math.sin(this.yaw);

    const offsetX = this.distance * cosPitch * sinYaw;
    const offsetY = this.distance * sinPitch;
    const offsetZ = this.distance * cosPitch * cosYaw;

    this.currentCamPos.set(
      this.currentLookTarget.x + offsetX,
      this.currentLookTarget.y + offsetY,
      this.currentLookTarget.z + offsetZ
    );
    this.camera.position.copy(this.currentCamPos);
    this.camera.lookAt(this.currentLookTarget);
  }

  public setMode(mode: CameraMode) {
    this.mode = mode;
    if (mode === 'fixed') {
      this.yaw = 0;
      this.pitch = 0.45;
    }
  }

  /**
   * Continuous 360-degree orbital rotation from mouse, touch drag, or gamepad
   */
  public rotate(deltaX: number, deltaY: number) {
    if (this.mode === 'fixed') return;

    this.timeSinceManualInput = 0;

    const dirX = this.invertX ? -1 : 1;
    const dirY = this.invertY ? -1 : 1;

    // Rotate yaw freely in full 360 degrees
    this.yaw -= deltaX * 0.0035 * this.sensitivity * dirX;

    // Normalizing yaw to keep within [-PI, PI] for numerical stability
    while (this.yaw > Math.PI) this.yaw -= Math.PI * 2;
    while (this.yaw < -Math.PI) this.yaw += Math.PI * 2;

    // Clamp pitch between near-ground and overhead
    this.pitch += deltaY * 0.0035 * this.sensitivity * dirY;
    this.pitch = Math.max(0.08, Math.min(1.38, this.pitch));
  }

  /**
   * Rotate yaw directly (for Q/E keys and on-screen rotation buttons)
   */
  public rotateYaw(deltaAngle: number) {
    if (this.mode === 'fixed') return;
    this.timeSinceManualInput = 0;
    this.yaw += deltaAngle;
    while (this.yaw > Math.PI) this.yaw -= Math.PI * 2;
    while (this.yaw < -Math.PI) this.yaw += Math.PI * 2;
  }

  /**
   * Zoom distance control (mouse scroll or pinch)
   */
  public zoom(deltaDistance: number) {
    this.targetDistance = Math.max(this.minDistance, Math.min(this.maxDistance, this.targetDistance + deltaDistance));
  }

  public resetHeading() {
    this.yaw = 0;
    this.pitch = 0.38;
    this.targetDistance = 7.5;
    this.timeSinceManualInput = 0;
  }

  public update(delta: number, playerPos: THREE.Vector3, playerVel: THREE.Vector3) {
    this.timeSinceManualInput += delta;

    // 1. In 'assisted' mode: ONLY assist if user hasn't rotated for > 2 seconds and is moving forward steadily
    if (this.mode === 'assisted' && this.timeSinceManualInput > 2.0) {
      const horizontalSpeedSq = playerVel.x * playerVel.x + playerVel.z * playerVel.z;
      if (horizontalSpeedSq > 9.0) {
        // Desired yaw is opposite to travel velocity (camera sits behind travel vector)
        const velAngle = Math.atan2(playerVel.x, playerVel.z);
        let diff = (velAngle - this.yaw) % (Math.PI * 2);
        if (diff > Math.PI) diff -= Math.PI * 2;
        if (diff < -Math.PI) diff += Math.PI * 2;

        this.yaw += diff * Math.min(1.0, delta * 1.5);
      }
    }

    // 2. Smooth distance zoom interpolation
    this.distance = THREE.MathUtils.lerp(this.distance, this.targetDistance, Math.min(1.0, delta * 8.0));

    // 3. Smooth look target (center of player ball)
    const desiredTarget = new THREE.Vector3(playerPos.x, playerPos.y + 0.6, playerPos.z);
    this.currentLookTarget.lerp(desiredTarget, Math.min(1.0, delta * 14.0));

    // 4. Compute spherical orbit coordinates from target
    const cosPitch = Math.cos(this.pitch);
    const sinPitch = Math.sin(this.pitch);
    const cosYaw = Math.cos(this.yaw);
    const sinYaw = Math.sin(this.yaw);

    const offsetX = this.distance * cosPitch * sinYaw;
    const offsetY = this.distance * sinPitch;
    const offsetZ = this.distance * cosPitch * cosYaw;

    const desiredCamPos = new THREE.Vector3(
      this.currentLookTarget.x + offsetX,
      this.currentLookTarget.y + offsetY,
      this.currentLookTarget.z + offsetZ
    );

    // Keep camera above minimum floor height relative to player
    if (desiredCamPos.y < playerPos.y + 0.4) {
      desiredCamPos.y = playerPos.y + 0.4;
    }

    // Smooth position interpolation
    this.currentCamPos.lerp(desiredCamPos, Math.min(1.0, delta * 18.0));
    this.camera.position.copy(this.currentCamPos);
    this.camera.lookAt(this.currentLookTarget);
  }
}
