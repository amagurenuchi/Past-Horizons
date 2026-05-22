import type { ISceneLifecycle } from "./services";

export class SceneLifecycle implements ISceneLifecycle {
  private readonly bootCallbacks: Array<() => void> = [];
  private readonly shutdownCallbacks: Array<() => void> = [];

  onBoot(callback: () => void): void {
    this.bootCallbacks.push(callback);
  }

  onShutdown(callback: () => void): void {
    this.shutdownCallbacks.push(callback);
  }

  triggerBoot(): void {
    for (const callback of this.bootCallbacks) {
      callback();
    }
  }

  triggerShutdown(): void {
    for (const callback of this.shutdownCallbacks) {
      callback();
    }
  }
}
