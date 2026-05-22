import type { QuickUseItem } from "../inventory/loadout-data";

export type LootTier = "white" | "green" | "blue" | "purple" | "gold" | "red";
export type ContainerType = "cache" | "locker" | "weapon-crate" | "medical-box";

export interface LootContainer {
  id: string;
  type: ContainerType;
  x: number;
  y: number;
  opened: boolean;
  revealed: boolean;
  tier: LootTier;
  item: QuickUseItem | null;
}

export interface SearchStatus {
  containerId: string | null;
  progressSeconds: number;
  requiredSeconds: number;
}

export class LootSystem {
  private readonly containers: LootContainer[] = [
    {
      id: "cache-alpha",
      type: "cache",
      x: 4,
      y: 0,
      opened: false,
      revealed: false,
      tier: "green",
      item: { id: "med-ifak", label: "IFAK", kind: "med", quantity: 1 },
    },
    {
      id: "cache-echo",
      type: "cache",
      x: 2,
      y: 4,
      opened: false,
      revealed: false,
      tier: "white",
      item: { id: "med-bandage", label: "Bandage", kind: "med", quantity: 1 },
    },
    {
      id: "locker-bravo",
      type: "locker",
      x: -3,
      y: -1,
      opened: false,
      revealed: false,
      tier: "blue",
      item: { id: "smg-rip-9x19-lv2", label: "9x19 RIP Lv.2", kind: "ammo", quantity: 45 },
    },
    {
      id: "weapon-crate-charlie",
      type: "weapon-crate",
      x: 6,
      y: 2,
      opened: false,
      revealed: false,
      tier: "gold",
      item: { id: "med-bandage", label: "Bandage", kind: "med", quantity: 2 },
    },
    {
      id: "locker-foxtrot",
      type: "locker",
      x: -1,
      y: 5,
      opened: false,
      revealed: false,
      tier: "purple",
      item: { id: "smg-rip-9x19-lv2", label: "9x19 RIP Lv.2", kind: "ammo", quantity: 60 },
    },
    {
      id: "medical-box-delta",
      type: "medical-box",
      x: -6,
      y: 3,
      opened: false,
      revealed: false,
      tier: "red",
      item: { id: "med-ifak", label: "IFAK", kind: "med", quantity: 2 },
    },
  ];
  private activeSearch: SearchStatus = { containerId: null, progressSeconds: 0, requiredSeconds: 0 };

  findNearbyContainer(player: { x: number; y: number }, radius = 1.25): LootContainer | null {
    for (const container of this.containers) {
      if (container.opened || !container.item) {
        continue;
      }

      const distance = Math.hypot(player.x - container.x, player.y - container.y);
      if (distance <= radius) {
        return container;
      }
    }

    return null;
  }

  updateSearch(
    player: { x: number; y: number },
    isSearching: boolean,
    deltaSeconds: number,
  ): SearchStatus {
    const nearby = this.findNearbyContainer(player);
    if (!isSearching || !nearby) {
      this.activeSearch = { containerId: null, progressSeconds: 0, requiredSeconds: 0 };
      return this.activeSearch;
    }

    const requiredSeconds = this.getSearchDuration(nearby.tier);
    if (this.activeSearch.containerId !== nearby.id) {
      this.activeSearch = { containerId: nearby.id, progressSeconds: 0, requiredSeconds };
    }

    this.activeSearch.progressSeconds = Math.min(
      this.activeSearch.progressSeconds + deltaSeconds,
      requiredSeconds,
    );

    if (this.activeSearch.progressSeconds >= requiredSeconds) {
      nearby.revealed = true;
    }

    return this.activeSearch;
  }

  pickupFromContainer(containerId: string): QuickUseItem | null {
    const container = this.containers.find((entry) => entry.id === containerId);
    if (!container || container.opened || !container.revealed || !container.item) {
      return null;
    }

    const item = container.item;
    container.item = null;
    container.opened = true;
    return item;
  }

  private getSearchDuration(tier: LootTier): number {
    if (tier === "purple" || tier === "gold") {
      return 1;
    }
    if (tier === "red") {
      return 2;
    }

    // Blue or below (white/green/blue)
    return 0.5;
  }
}
