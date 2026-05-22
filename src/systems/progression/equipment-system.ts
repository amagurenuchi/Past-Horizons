import type { WeaponSpec } from "../combat/loadout";

export interface EquipmentState {
  primaryWeapon: WeaponSpec | null;
  secondaryWeapon: WeaponSpec | null;
  helmetId: string | null;
  vestId: string | null;
}

export class EquipmentSystem {
  private state: EquipmentState = {
    primaryWeapon: null,
    secondaryWeapon: null,
    helmetId: "helmet-t3",
    vestId: "vest-t3",
  };

  equipPrimary(weapon: WeaponSpec): void {
    this.state.primaryWeapon = weapon;
  }

  equipSecondary(weapon: WeaponSpec): void {
    this.state.secondaryWeapon = weapon;
  }

  getState(): EquipmentState {
    return this.state;
  }

  applyLoadoutFromMenu(): void {
    // Placeholder hook for future menu-driven equipment customization.
  }
}
