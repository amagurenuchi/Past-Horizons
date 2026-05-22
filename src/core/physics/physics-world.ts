export class PhysicsWorld {
  private running = false;
  private readonly gravity = { x: 0, y: -9.81, z: 0 };

  async initialize(): Promise<void> {
    // Placeholder for Ammo.js WASM initialization and world creation.
    this.running = true;
  }

  stepSimulation(_fixedDeltaSeconds: number): void {
    if (!this.running) {
      return;
    }

    // Placeholder for deterministic Ammo.js step logic.
  }

  getGravity(): { x: number; y: number; z: number } {
    return this.gravity;
  }

  dispose(): void {
    this.running = false;
  }
}
