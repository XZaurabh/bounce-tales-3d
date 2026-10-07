import * as THREE from 'three';

export interface InputState {
  move: THREE.Vector2; // X: -1..1, Y: -1..1 (relative to camera yaw)
  jump: boolean;
  boost: boolean;
  pause: boolean;
  camDeltaX: number;
  camDeltaY: number;
  zoomDelta: number;
}

export class InputManager {
  public state: InputState = {
    move: new THREE.Vector2(0, 0),
    jump: false,
    boost: false,
    pause: false,
    camDeltaX: 0,
    camDeltaY: 0,
    zoomDelta: 0,
  };

  private keys: Record<string, boolean> = {};
  private isPointerDown = false;
  private prevPointerX = 0;
  private prevPointerY = 0;
  public isPointerLocked = false;

  // Virtual touch controls
  public touchJoystickVector = new THREE.Vector2(0, 0);
  public touchJumpPressed = false;
  public touchBoostPressed = false;
  public jumpBufferedUntil = 0;

  public triggerJump() {
    this.jumpBufferedUntil = performance.now() + 350;
    this.touchJumpPressed = true;
  }

  public releaseJump() {
    this.touchJumpPressed = false;
  }

  private onPauseCallback: (() => void) | null = null;
  private onResetCamCallback: (() => void) | null = null;

  constructor() {
    this.setupKeyboard();
    this.setupMouse();
  }

  public setOnPause(cb: () => void) {
    this.onPauseCallback = cb;
  }

  public setOnResetCam(cb: () => void) {
    this.onResetCamCallback = cb;
  }

  private setupKeyboard() {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      this.keys[e.code] = true;
      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (this.onPauseCallback) {
          this.onPauseCallback();
        }
      }
      if (e.code === 'KeyR') {
        if (this.onResetCamCallback) {
          this.onResetCamCallback();
        }
      }
    });

    window.addEventListener('keyup', (e: KeyboardEvent) => {
      this.keys[e.code] = false;
    });
  }

  private setupMouse() {
    // Pointer lock change listener
    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement !== null;
    });

    // Mousedown for drag or lock
    window.addEventListener('mousedown', (e: MouseEvent) => {
      // Ignore if clicking on interactive UI buttons
      if ((e.target as HTMLElement)?.closest('button, [data-interactive="true"]')) return;
      this.isPointerDown = true;
      this.prevPointerX = e.clientX;
      this.prevPointerY = e.clientY;
    });

    window.addEventListener('mousemove', (e: MouseEvent) => {
      if (this.isPointerLocked) {
        // Pointer locked direct delta
        this.state.camDeltaX += e.movementX;
        this.state.camDeltaY += e.movementY;
      } else if (this.isPointerDown) {
        // Click and drag delta
        const dx = e.clientX - this.prevPointerX;
        const dy = e.clientY - this.prevPointerY;
        this.state.camDeltaX += dx;
        this.state.camDeltaY += dy;
        this.prevPointerX = e.clientX;
        this.prevPointerY = e.clientY;
      }
    });

    window.addEventListener('mouseup', () => {
      this.isPointerDown = false;
    });

    // Mouse wheel for camera distance zoom
    window.addEventListener(
      'wheel',
      (e: WheelEvent) => {
        if ((e.target as HTMLElement)?.closest('[data-scrollable="true"]')) return;
        this.state.zoomDelta += Math.sign(e.deltaY) * 0.75;
      },
      { passive: true }
    );
  }

  public update(cameraYaw: number, delta: number): InputState {
    // 1. Keyboard Movement Intent: inputForward (+1 forward, -1 backward), inputRight (+1 right, -1 left)
    let inputForward = 0;
    let inputRight = 0;

    // Movement: WASD or Arrow Keys
    if (this.keys['KeyW'] || this.keys['ArrowUp']) inputForward += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) inputForward -= 1;
    if (this.keys['KeyD']) inputRight += 1;
    if (this.keys['KeyA']) inputRight -= 1;

    // Arrow keys for steering if not already used:
    if (this.keys['ArrowRight'] && !this.keys['KeyD']) inputRight += 1;
    if (this.keys['ArrowLeft'] && !this.keys['KeyA']) inputRight -= 1;

    // Keyboard Camera Rotation with Q and E keys (or J and L)
    const keyCamSpeed = 120 * delta;
    if (this.keys['KeyQ']) this.state.camDeltaX -= keyCamSpeed;
    if (this.keys['KeyE']) this.state.camDeltaX += keyCamSpeed;
    if (this.keys['KeyJ']) this.state.camDeltaX -= keyCamSpeed;
    if (this.keys['KeyL']) this.state.camDeltaX += keyCamSpeed;

    // 2. Add Virtual touch joystick input if mobile
    if (this.touchJoystickVector.lengthSq() > 0.01) {
      inputRight += this.touchJoystickVector.x;
      // Note: On screen dragging joystick UP yields negative Y in client coords, so invert for forward
      inputForward -= this.touchJoystickVector.y;
    }

    // 3. Gamepad input
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0];
    if (gp) {
      // Left stick (movement)
      if (Math.abs(gp.axes[0]) > 0.15) inputRight += gp.axes[0];
      if (Math.abs(gp.axes[1]) > 0.15) inputForward -= gp.axes[1];

      // Right stick (camera orbit)
      if (Math.abs(gp.axes[2]) > 0.15) this.state.camDeltaX += gp.axes[2] * 14;
      if (Math.abs(gp.axes[3]) > 0.15) this.state.camDeltaY += gp.axes[3] * 14;

      // Button A (Jump)
      if (gp.buttons[0]?.pressed) {
        this.state.jump = true;
      }
      // Button B / RB (Boost)
      if (gp.buttons[1]?.pressed || gp.buttons[5]?.pressed) {
        this.state.boost = true;
      }
      // Start (Pause)
      if (gp.buttons[9]?.pressed) {
        if (this.onPauseCallback) this.onPauseCallback();
      }
    }

    // Normalize input magnitude to max 1.0 (prevents diagonal speed boost)
    const len = Math.sqrt(inputRight * inputRight + inputForward * inputForward);
    if (len > 1.0) {
      inputRight /= len;
      inputForward /= len;
    }

    // 4. Exact Camera-Relative Movement Transformation:
    // When camera is at spherical angle 'yaw':
    // Gaze forward vector on XZ plane: (-sinYaw, -cosYaw)
    // Gaze right vector on XZ plane:   (cosYaw,  -sinYaw)
    //
    // Movement = (ForwardVector * inputForward) + (RightVector * inputRight)
    const sinYaw = Math.sin(cameraYaw);
    const cosYaw = Math.cos(cameraYaw);

    const worldMoveX = inputForward * (-sinYaw) + inputRight * cosYaw;
    const worldMoveZ = inputForward * (-cosYaw) + inputRight * (-sinYaw);

    this.state.move.set(worldMoveX, worldMoveZ);

    const isBufferedJump = performance.now() < this.jumpBufferedUntil;
    this.state.jump = Boolean(this.keys['Space'] || this.touchJumpPressed || isBufferedJump || gp?.buttons[0]?.pressed);
    this.state.boost = Boolean(
      this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.touchBoostPressed || gp?.buttons[1]?.pressed || gp?.buttons[5]?.pressed
    );

    return this.state;
  }

  public consumeCameraDelta(): { dx: number; dy: number; zoom: number } {
    const res = {
      dx: this.state.camDeltaX,
      dy: this.state.camDeltaY,
      zoom: this.state.zoomDelta,
    };
    this.state.camDeltaX = 0;
    this.state.camDeltaY = 0;
    this.state.zoomDelta = 0;
    return res;
  }
}
