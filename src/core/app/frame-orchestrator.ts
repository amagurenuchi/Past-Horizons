import type { ITimerService } from "./services";
import type { IInputService } from "./services";
import type { InventoryContainerKey } from "./services";
import type { PhysicsWorld } from "../physics/physics-world";
import type { ThreeRenderer } from "../rendering/three-renderer";
import type { IUiRenderer } from "./services";
import { CombatSimulation } from "../game-state/combat-sim";

const FIXED_STEP_SECONDS = 1 / 60;
const FIXED_STEP_MS = FIXED_STEP_SECONDS * 1000;
const MAX_FRAME_MS = 100;

export class FrameOrchestrator {
  private lastTimestampMs = 0;
  private accumulatorMs = 0;
  private rafId: number | null = null;
  private frameCounter = 0;
  private fpsWindowStartMs = 0;
  private latestFps = 0;
  private readonly simulation: CombatSimulation;

  constructor(
    private readonly timer: ITimerService,
    input: IInputService,
    private readonly physicsWorld: PhysicsWorld,
    private readonly threeRenderer: ThreeRenderer,
    private readonly uiRenderer: IUiRenderer,
  ) {
    this.simulation = new CombatSimulation(input);
  }

  start(): void {
    this.lastTimestampMs = this.timer.now();
    this.fpsWindowStartMs = this.lastTimestampMs;
    this.rafId = window.requestAnimationFrame(this.tick);
  }

  stop(): void {
    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  moveInventoryItem(
    from: { container: InventoryContainerKey; slotIndex: number },
    to: { container: InventoryContainerKey; slotIndex: number },
  ): boolean {
    return this.simulation.moveInventoryItem(from, to);
  }

  toggleStash(): void {
    this.simulation.toggleStashScreen();
  }

  startRaid(): void {
    this.simulation.startRaidFromMenu();
  }

  private readonly tick = (): void => {
    const now = this.timer.now();
    const frameMs = Math.min(now - this.lastTimestampMs, MAX_FRAME_MS);
    this.lastTimestampMs = now;
    this.accumulatorMs += frameMs;

    while (this.accumulatorMs >= FIXED_STEP_MS) {
      this.physicsWorld.stepSimulation(FIXED_STEP_SECONDS);
      this.simulation.step(FIXED_STEP_SECONDS);
      this.accumulatorMs -= FIXED_STEP_MS;
    }

    const snapshot = this.simulation.getSnapshot();
    this.threeRenderer.updateTransforms({
      player: this.simulation.getPlayerPosition(),
      enemy: this.simulation.getEnemyPosition(),
      viewAngles: this.simulation.getViewAngles(),
      shotTraces: this.simulation.getShotTraces(),
      extractionMarkers: this.simulation.getExtractionMarkers(),
      inMainMenu: snapshot.inMainMenu,
      equippedHelmetId: snapshot.equippedHelmetId,
      equippedVestId: snapshot.equippedVestId,
      equippedPrimaryWeaponName: snapshot.equippedPrimaryWeaponName,
    });
    this.threeRenderer.render(now / 1000);
    this.updateFps(now);
    this.uiRenderer.updateHud({
      fps: this.latestFps,
      accumulatorMs: this.accumulatorMs,
      ...snapshot,
    });

    this.rafId = window.requestAnimationFrame(this.tick);
  };

  private updateFps(nowMs: number): void {
    this.frameCounter += 1;
    const elapsedMs = nowMs - this.fpsWindowStartMs;
    if (elapsedMs < 500) {
      return;
    }

    this.latestFps = (this.frameCounter * 1000) / elapsedMs;
    this.frameCounter = 0;
    this.fpsWindowStartMs = nowMs;
  }
}
