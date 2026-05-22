export type ItemKind = "ammo" | "med";
export type InventoryContainerKey = "chestRig" | "pockets" | "backpack" | "stash" | "materials";

export interface QuickUseItem {
  id: string;
  label: string;
  kind: ItemKind;
  quantity: number;
}

export interface ContainerSlot {
  id: string;
  item: QuickUseItem | null;
}

export interface StorageState {
  chestRig: ContainerSlot[];
  pockets: ContainerSlot[];
  backpack: ContainerSlot[];
  stash: ContainerSlot[];
  materials: ContainerSlot[];
}

export class InventoryLoadout {
  private readonly storage: StorageState = {
    chestRig: [
      { id: "rig-1", item: { id: "smg-rip-9x19-lv2", label: "9x19 RIP Lv.2", kind: "ammo", quantity: 60 } },
      { id: "rig-2", item: { id: "med-bandage", label: "Bandage", kind: "med", quantity: 2 } },
      { id: "rig-3", item: null },
      { id: "rig-4", item: null },
    ],
    pockets: [
      { id: "pocket-1", item: { id: "med-painkiller", label: "Painkiller", kind: "med", quantity: 1 } },
      { id: "pocket-2", item: { id: "smg-rip-9x19-lv2", label: "9x19 RIP Lv.2", kind: "ammo", quantity: 30 } },
      { id: "pocket-3", item: null },
      { id: "pocket-4", item: null },
    ],
    backpack: [
      { id: "bp-1", item: { id: "med-ifak", label: "IFAK", kind: "med", quantity: 1 } },
      { id: "bp-2", item: { id: "smg-rip-9x19-lv2", label: "9x19 RIP Lv.2", kind: "ammo", quantity: 90 } },
      { id: "bp-3", item: null },
      { id: "bp-4", item: null },
      { id: "bp-5", item: null },
      { id: "bp-6", item: null },
    ],
    stash: [
      { id: "stash-1", item: { id: "med-splint", label: "Splint", kind: "med", quantity: 1 } },
      { id: "stash-2", item: { id: "smg-rip-9x19-lv2", label: "9x19 RIP Lv.2", kind: "ammo", quantity: 120 } },
      { id: "stash-3", item: null },
      { id: "stash-4", item: null },
      { id: "stash-5", item: null },
      { id: "stash-6", item: null },
    ],
    materials: [
      { id: "mat-1", item: { id: "mat-casing", label: "Casing", kind: "ammo", quantity: 24 } },
      { id: "mat-2", item: { id: "mat-soft-core", label: "Soft Core", kind: "ammo", quantity: 18 } },
      { id: "mat-3", item: { id: "mat-cloth", label: "Cloth", kind: "med", quantity: 12 } },
      { id: "mat-4", item: { id: "mat-antiseptic", label: "Antiseptic", kind: "med", quantity: 4 } },
      { id: "mat-5", item: null },
      { id: "mat-6", item: null },
    ],
  };

  private quickUseIndex = 0;

  getQuickUseItems(): QuickUseItem[] {
    const fromQuickAccess = [...this.storage.chestRig, ...this.storage.pockets];
    return fromQuickAccess
      .map((slot) => slot.item)
      .filter((item): item is QuickUseItem => item !== null)
      .filter((item) => item.quantity > 0)
      .filter((item) => item.kind === "ammo" || item.kind === "med");
  }

  cycleQuickUse(direction: 1 | -1): void {
    const items = this.getQuickUseItems();
    if (items.length === 0) {
      this.quickUseIndex = 0;
      return;
    }

    const next = this.quickUseIndex + direction;
    this.quickUseIndex = (next + items.length) % items.length;
  }

  getSelectedQuickUseItem(): QuickUseItem | null {
    const items = this.getQuickUseItems();
    if (items.length === 0) {
      return null;
    }

    if (this.quickUseIndex >= items.length) {
      this.quickUseIndex = 0;
    }

    return items[this.quickUseIndex];
  }

  getBackpackUsage(): { used: number; total: number } {
    const used = this.storage.backpack.filter((slot) => slot.item !== null).length;
    return { used, total: this.storage.backpack.length };
  }

  getStashItemCount(): number {
    return this.storage.stash.filter((slot) => slot.item !== null).length;
  }

  addToBackpack(item: QuickUseItem): boolean {
    const empty = this.storage.backpack.find((slot) => slot.item === null);
    if (!empty) {
      return false;
    }

    empty.item = { ...item };
    return true;
  }

  addToStash(item: QuickUseItem): boolean {
    const empty = this.storage.stash.find((slot) => slot.item === null);
    if (!empty) {
      return false;
    }

    empty.item = { ...item };
    return true;
  }

  commitExtractionToStash(): number {
    let moved = 0;
    for (const slot of this.storage.backpack) {
      if (!slot.item) {
        continue;
      }

      const stored = this.addToStash(slot.item);
      if (stored) {
        slot.item = null;
        moved += 1;
      }
    }

    return moved;
  }

  clearBackpackOnDeath(): number {
    let removed = 0;
    for (const slot of this.storage.backpack) {
      if (slot.item) {
        slot.item = null;
        removed += 1;
      }
    }

    return removed;
  }

  moveItem(
    from: { container: InventoryContainerKey; slotIndex: number },
    to: { container: InventoryContainerKey; slotIndex: number },
  ): boolean {
    const fromSlots = this.storage[from.container];
    const toSlots = this.storage[to.container];
    const fromSlot = fromSlots[from.slotIndex];
    const toSlot = toSlots[to.slotIndex];

    if (!fromSlot || !toSlot || !fromSlot.item) {
      return false;
    }

    const moved = fromSlot.item;
    fromSlot.item = toSlot.item;
    toSlot.item = moved;
    return true;
  }

  getInventoryView(): {
    containers: Array<{
      key: InventoryContainerKey;
      label: string;
      slots: Array<{ id: string; label: string | null; quantity: number; kind: string | null }>;
    }>;
    hint: string;
  } {
    const toView = (
      key: InventoryContainerKey,
      label: string,
      slots: ContainerSlot[],
    ): { key: InventoryContainerKey; label: string; slots: Array<{ id: string; label: string | null; quantity: number; kind: string | null }> } => ({
      key,
      label,
      slots: slots.map((slot) => ({
        id: slot.id,
        label: slot.item?.label ?? null,
        quantity: slot.item?.quantity ?? 0,
        kind: slot.item?.kind ?? null,
      })),
    });

    return {
      containers: [
        toView("chestRig", "Chest Rig", this.storage.chestRig),
        toView("pockets", "Pockets", this.storage.pockets),
        toView("backpack", "Backpack", this.storage.backpack),
        toView("stash", "Stash", this.storage.stash),
        toView("materials", "Materials", this.storage.materials),
      ],
      hint: "Drag items between slots to move/swap them. Quick-use reads from Chest Rig + Pockets.",
    };
  }

  consumeMaterials(requirements: Array<{ itemId: string; quantity: number }>): boolean {
    for (const req of requirements) {
      if (this.getMaterialQuantity(req.itemId) < req.quantity) {
        return false;
      }
    }

    for (const req of requirements) {
      this.removeMaterial(req.itemId, req.quantity);
    }

    return true;
  }

  getMaterialQuantity(itemId: string): number {
    let total = 0;
    for (const slot of this.storage.materials) {
      if (slot.item?.id === itemId) {
        total += slot.item.quantity;
      }
    }

    return total;
  }

  private removeMaterial(itemId: string, quantity: number): void {
    let remaining = quantity;
    for (const slot of this.storage.materials) {
      if (!slot.item || slot.item.id !== itemId) {
        continue;
      }

      const used = Math.min(slot.item.quantity, remaining);
      slot.item.quantity -= used;
      remaining -= used;
      if (slot.item.quantity <= 0) {
        slot.item = null;
      }

      if (remaining <= 0) {
        return;
      }
    }
  }
}
