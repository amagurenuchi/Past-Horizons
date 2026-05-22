import type { ISceneLifecycle } from "./services";

interface PhaserGameLike {
  destroy?: (removeCanvas?: boolean) => void;
}

export class PhaserAppAdapter {
  private game: PhaserGameLike | null = null;

  async initialize(container: HTMLElement, lifecycle: ISceneLifecycle): Promise<void> {
    const phaserModule = (await import("phaser")) as Record<string, unknown>;
    const PhaserAny = phaserModule.default ?? phaserModule;

    const GameCtor = (PhaserAny as { Game?: new (config: unknown) => PhaserGameLike }).Game;
    if (!GameCtor) {
      throw new Error("Unable to find Phaser Game constructor. Check Phaser 4 package/version.");
    }

    const AUTO = (PhaserAny as { AUTO?: unknown }).AUTO ?? 0;

    this.game = new GameCtor({
      type: AUTO,
      width: container.clientWidth,
      height: container.clientHeight,
      parent: container,
      backgroundColor: "#00000000",
      scene: {
        create: () => lifecycle.triggerBoot(),
        shutdown: () => lifecycle.triggerShutdown(),
      },
    });
  }

  dispose(): void {
    this.game?.destroy?.(true);
    this.game = null;
  }
}
