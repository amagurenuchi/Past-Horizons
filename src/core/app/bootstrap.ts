import { SceneLifecycle } from "./lifecycle";
import { PhaserAppAdapter } from "./phaser-app-adapter";
import { BrowserInputAdapter } from "./input-adapter";
import { HighResolutionTimer } from "./timer-adapter";
import { HudRenderer } from "../../ui/hud/hud-renderer";
import { PhysicsWorld } from "../physics/physics-world";
import { ThreeRenderer } from "../rendering/three-renderer";
import { FrameOrchestrator } from "./frame-orchestrator";

export async function bootstrapApplication(root: HTMLElement): Promise<void> {
  const lifecycle = new SceneLifecycle();
  const input = new BrowserInputAdapter();
  const timer = new HighResolutionTimer();
  const ui = new HudRenderer();
  const physics = new PhysicsWorld();
  const three = new ThreeRenderer();
  const phaser = new PhaserAppAdapter();

  input.bind("moveForward", "KeyW");
  input.bind("moveBackward", "KeyS");
  input.bind("moveLeft", "KeyA");
  input.bind("moveRight", "KeyD");
  input.bind("jump", "Space");
  input.bind("crouch", "ControlLeft");
  input.bind("sprint", "ShiftLeft");
  input.bind("shootMouse", "MouseLeft");
  input.bind("aimMouse", "MouseRight");
  input.bind("reload", "KeyR");
  input.bind("quickUseNext", "KeyE");
  input.bind("quickUsePrev", "KeyQ");
  input.bind("toggleInventory", "Tab");
  input.bind("pickupLoot", "KeyF");
  input.bind("searchLoot", "KeyV");
  input.bind("craftItem", "KeyC");
  input.bind("advanceRaidEndScreen", "Enter");

  ui.mount(root);
  three.initialize(root);

  const orchestrator = new FrameOrchestrator(timer, input, physics, three, ui);
  ui.setInventoryBridge({
    moveItem: (from, to) => orchestrator.moveInventoryItem(from, to),
    toggleStash: () => orchestrator.toggleStash(),
    startRaid: () => orchestrator.startRaid(),
  });

  lifecycle.onBoot(() => {
    orchestrator.start();
  });

  lifecycle.onShutdown(() => {
    orchestrator.stop();
  });

  await physics.initialize();
  await phaser.initialize(root, lifecycle);

  // Support Vite HMR cleanup in dev.
  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      orchestrator.stop();
      phaser.dispose();
      three.dispose();
      physics.dispose();
      ui.dispose();
      input.dispose();
    });
  }
}
