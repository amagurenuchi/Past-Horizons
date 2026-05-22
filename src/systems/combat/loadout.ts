import type { AmmoProfile } from "./damage";

export type WeaponClass = "bolt-action" | "rifle" | "smg";

export interface WeaponSpec {
  id: string;
  displayName: string;
  weaponClass: WeaponClass;
  caliber: string;
  penetrationLevel: number;
  ammoProfile: AmmoProfile;
  baseDamage: number;
  roundsPerSecond: number;
}

function assertAmmoProfile(weaponClass: WeaponClass, ammoProfile: AmmoProfile): AmmoProfile {
  if (ammoProfile === "rip" && weaponClass !== "smg") {
    throw new Error("RIP ammo is restricted to SMG-class weapons.");
  }

  return ammoProfile;
}

function assertPenetrationRange(weaponClass: WeaponClass, level: number): number {
  if (weaponClass === "bolt-action" && (level < 2 || level > 6)) {
    throw new Error(`Bolt-action ammo must use penetration level 2-6, got ${level}.`);
  }

  if (weaponClass === "rifle" && (level < 1 || level > 5)) {
    throw new Error(`Rifle ammo must use penetration level 1-5, got ${level}.`);
  }

  if (weaponClass === "smg" && (level < 1 || level > 4)) {
    throw new Error(`SMG ammo must use penetration level 1-4, got ${level}.`);
  }

  return level;
}

export const STARTER_WEAPON: WeaponSpec = {
  id: "smg-viper-9",
  displayName: "Viper-9 SMG",
  weaponClass: "smg",
  caliber: "9x19",
  penetrationLevel: assertPenetrationRange("smg", 2),
  ammoProfile: assertAmmoProfile("smg", "rip"),
  baseDamage: 22,
  roundsPerSecond: 8,
};
