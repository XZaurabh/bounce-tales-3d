import React, { useRef, useState } from 'react';
import { InputManager } from '../game/input/InputManager';

interface MobileControlsProps {
  inputManager: InputManager | null;
  onCameraRotate?: (dx: number, dy: number) => void;
  onCameraZoom?: (dz: number) => void;
  onResetCamera?: () => void;
  onPause?: () => void;
  sensitivity?: number;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  inputManager,
  onCameraRotate,
  onCameraZoom,
  onResetCamera,
  onPause,
  sensitivity = 1.0,
}) => {
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState(false);
  const joystickTouchIdRef = useRef<number | null>(null);

  // Camera swipe touch tracking
  const cameraTouchIdRef = useRef<number | null>(null);
  const lastCamPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pinchDistRef = useRef<number | null>(null);

  // Joystick touch handlers
  const handleJoystickStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (joystickTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    joystickTouchIdRef.current = touch.identifier;
    setIsJoystickActive(true);
    updateJoystickPos(touch.clientX, touch.clientY);
  };

  const handleJoystickMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchIdRef.current) {
        updateJoystickPos(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleJoystickEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchIdRef.current) {
        joystickTouchIdRef.current = null;
        setIsJoystickActive(false);
        setKnobPos({ x: 0, y: 0 });
        if (inputManager) {
          inputManager.touchJoystickVector.set(0, 0);
        }
        break;
      }
    }
  };

  const updateJoystickPos = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current || !inputManager) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const maxRadius = rect.width / 2;
    let dx = clientX - centerX;
    let dy = clientY - centerY;

    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    setKnobPos({ x: dx, y: dy });

    // Normalized input vector: -1 to 1
    const normX = (dx / maxRadius) * sensitivity;
    const normY = (dy / maxRadius) * sensitivity;
    inputManager.touchJoystickVector.set(normX, normY);
  };

  // Full Screen Touch Surface for Camera Drag & Pinch Zoom
  const handleSurfaceTouchStart = (e: React.TouchEvent) => {
    // If touching an interactive UI button, do not capture camera touch
    if ((e.target as HTMLElement)?.closest('button, [data-interactive="true"], a')) return;

    // If 2 touches, handle pinch zoom
    if (e.touches.length === 2 && onCameraZoom) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      pinchDistRef.current = dist;
      return;
    }

    // Single touch for 360 degree camera drag
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      // Do not steal the joystick's touch
      if (touch.identifier === joystickTouchIdRef.current) continue;

      if (cameraTouchIdRef.current === null) {
        cameraTouchIdRef.current = touch.identifier;
        lastCamPosRef.current = { x: touch.clientX, y: touch.clientY };
        break;
      }
    }
  };

  const handleSurfaceTouchMove = (e: React.TouchEvent) => {
    // Pinch zoom handling
    if (e.touches.length === 2 && pinchDistRef.current !== null && onCameraZoom) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const delta = (pinchDistRef.current - currentDist) * 0.05;
      onCameraZoom(delta);
      pinchDistRef.current = currentDist;
      return;
    }

    // Camera drag handling
    if (cameraTouchIdRef.current !== null && onCameraRotate) {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === cameraTouchIdRef.current) {
          const dx = touch.clientX - lastCamPosRef.current.x;
          const dy = touch.clientY - lastCamPosRef.current.y;
          // Apply touch sensitivity and smooth scaling
          onCameraRotate(dx * 1.5 * sensitivity, dy * 1.5 * sensitivity);
          lastCamPosRef.current = { x: touch.clientX, y: touch.clientY };
          break;
        }
      }
    }
  };

  const handleSurfaceTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      pinchDistRef.current = null;
    }

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === cameraTouchIdRef.current) {
        cameraTouchIdRef.current = null;
        break;
      }
    }
  };

  return (
    <div
      onTouchStart={handleSurfaceTouchStart}
      onTouchMove={handleSurfaceTouchMove}
      onTouchEnd={handleSurfaceTouchEnd}
      onTouchCancel={handleSurfaceTouchEnd}
      style={{ touchAction: 'none' }}
      className="absolute inset-0 select-none z-20 pointer-events-auto"
    >
      {/* Left: Virtual Movement Joystick */}
      <div className="absolute bottom-6 left-6 pointer-events-auto" data-interactive="true">
        <div
          ref={joystickBaseRef}
          onTouchStart={handleJoystickStart}
          onTouchMove={handleJoystickMove}
          onTouchEnd={handleJoystickEnd}
          onTouchCancel={handleJoystickEnd}
          className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full border-2 transition-colors touch-none flex items-center justify-center relative ${
            isJoystickActive ? 'bg-black/50 border-amber-400' : 'bg-black/35 border-white/35'
          } backdrop-blur-xs shadow-2xl`}
        >
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg absolute pointer-events-none transition-transform duration-75"
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
            }}
          />
        </div>
      </div>

      {/* Right: Jump Button (Identical size to Joystick base, bold and accessible) */}
      <div className="absolute bottom-6 right-6 pointer-events-auto" data-interactive="true">
        <button
          data-interactive="true"
          onPointerDown={e => {
            e.preventDefault();
            e.stopPropagation();
            if (inputManager) inputManager.triggerJump();
          }}
          onTouchStart={e => {
            e.preventDefault();
            e.stopPropagation();
            if (inputManager) inputManager.triggerJump();
          }}
          onTouchEnd={e => {
            e.preventDefault();
            e.stopPropagation();
            if (inputManager) inputManager.releaseJump();
          }}
          onPointerUp={e => {
            e.preventDefault();
            e.stopPropagation();
            if (inputManager) inputManager.releaseJump();
          }}
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            if (inputManager) inputManager.triggerJump();
          }}
          className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-rose-500 via-rose-600 to-red-600 active:scale-95 active:brightness-90 text-white font-black text-lg sm:text-xl tracking-wider flex items-center justify-center shadow-2xl border-2 border-white/40 transition-transform touch-none cursor-pointer select-none"
        >
          JUMP
        </button>
      </div>
    </div>
  );
};
