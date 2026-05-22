import type { IInputService } from "./services";

export class BrowserInputAdapter implements IInputService {
  private readonly actionMap = new Map<string, string>();
  private readonly pressedCodes = new Set<string>();
  private lookDelta = { x: 0, y: 0 };

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    this.pressedCodes.add(event.code);
  };

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    this.pressedCodes.delete(event.code);
  };

  private readonly onMouseDown = (event: MouseEvent): void => {
    if (event.button === 0) {
      this.pressedCodes.add("MouseLeft");
    }
    if (event.button === 2) {
      this.pressedCodes.add("MouseRight");
    }
  };

  private readonly onMouseUp = (event: MouseEvent): void => {
    if (event.button === 0) {
      this.pressedCodes.delete("MouseLeft");
    }
    if (event.button === 2) {
      this.pressedCodes.delete("MouseRight");
    }
  };

  private readonly onMouseMove = (event: MouseEvent): void => {
    if (!this.isPointerLocked()) {
      return;
    }

    this.lookDelta.x += event.movementX;
    this.lookDelta.y += event.movementY;
  };

  private readonly onContextMenu = (event: MouseEvent): void => {
    if (this.isPointerLocked()) {
      event.preventDefault();
    }
  };

  constructor(private readonly target: Window = window) {
    this.target.addEventListener("keydown", this.onKeyDown);
    this.target.addEventListener("keyup", this.onKeyUp);
    this.target.addEventListener("mousedown", this.onMouseDown);
    this.target.addEventListener("mouseup", this.onMouseUp);
    this.target.addEventListener("mousemove", this.onMouseMove);
    this.target.addEventListener("contextmenu", this.onContextMenu);
  }

  bind(action: string, code: string): void {
    this.actionMap.set(action, code);
  }

  isPressed(action: string): boolean {
    const code = this.actionMap.get(action);
    if (!code) {
      return false;
    }

    return this.pressedCodes.has(code);
  }

  consumeLookDelta(): { x: number; y: number } {
    const current = { ...this.lookDelta };
    this.lookDelta = { x: 0, y: 0 };
    return current;
  }

  requestPointerLock(): void {
    document.body.requestPointerLock();
  }

  releasePointerLock(): void {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }

  isPointerLocked(): boolean {
    return document.pointerLockElement !== null;
  }

  dispose(): void {
    this.target.removeEventListener("keydown", this.onKeyDown);
    this.target.removeEventListener("keyup", this.onKeyUp);
    this.target.removeEventListener("mousedown", this.onMouseDown);
    this.target.removeEventListener("mouseup", this.onMouseUp);
    this.target.removeEventListener("mousemove", this.onMouseMove);
    this.target.removeEventListener("contextmenu", this.onContextMenu);
  }
}
