import type { AmmoProfile } from "../systems/combat/damage";
import type { WeaponClass } from "../systems/combat/loadout";

export interface AmmoDefinition {
  id: string;
  caliber: string;
  weaponClass: WeaponClass;
  penetrationLevel: number;
  ammoProfile: AmmoProfile;
  baseDamage: number;
  velocity: number;
  notes?: string;
}

export interface WeaponDefinition {
  id: string;
  displayName: string;
  weaponClass: WeaponClass;
  caliber: string;
  supportedPenetrationLevels: number[];
  roundsPerSecond: number;
  magazineSize: number;
}

export interface ArmorDefinition {
  id: string;
  displayName: string;
  slot: "helmet" | "vest";
  tier: number;
  maxDurability: number;
}

// Data ranges enforced by design:
// - bolt-action: penetration Lv.2-6
// - rifle (full/semi): penetration Lv.1-5
// - smg: penetration Lv.1-4
// - RIP profile: smg-only
export const AMMO_DEFINITIONS: AmmoDefinition[] = [
  { id: "ammo-9x19-rip-lv2", caliber: "9x19", weaponClass: "smg", penetrationLevel: 0, ammoProfile: "rip", baseDamage: 22, velocity: 420, notes: "High flesh damage, minimal armor chip." },
  { id: "ammo-9x19-ap-lv4", caliber: "9x19", weaponClass: "smg", penetrationLevel: 4, ammoProfile: "standard", baseDamage: 18, velocity: 450 },
  { id: "ammo-556-fmj-lv2", caliber: "5.56x45", weaponClass: "rifle", penetrationLevel: 2, ammoProfile: "standard", baseDamage: 24, velocity: 880 },
  { id: "ammo-556-ap-lv5", caliber: "5.56x45", weaponClass: "rifle", penetrationLevel: 5, ammoProfile: "standard", baseDamage: 20, velocity: 910 },
  { id: "ammo-762-ap-lv4", caliber: "7.62x39", weaponClass: "rifle", penetrationLevel: 4, ammoProfile: "standard", baseDamage: 28, velocity: 730 },
  { id: "ammo-338-match-lv5", caliber: ".338", weaponClass: "bolt-action", penetrationLevel: 5, ammoProfile: "standard", baseDamage: 56, velocity: 900 },
  { id: "ammo-50-bmg-lv6", caliber: ".50 BMG", weaponClass: "bolt-action", penetrationLevel: 6, ammoProfile: "standard", baseDamage: 80, velocity: 890 },
];

export const WEAPON_DEFINITIONS: WeaponDefinition[] = [
  {
    id: "weapon-viper9",
    displayName: "Viper-9 SMG",
    weaponClass: "smg",
    caliber: "9x19",
    supportedPenetrationLevels: [1, 2, 3, 4],
    roundsPerSecond: 8,
    magazineSize: 24,
  },
  {
    id: "weapon-carbine-mk1",
    displayName: "Carbine MK1",
    weaponClass: "rifle",
    caliber: "5.56x45",
    supportedPenetrationLevels: [1, 2, 3, 4, 5],
    roundsPerSecond: 6,
    magazineSize: 30,
  },
  {
    id: "weapon-ranger-338",
    displayName: "Ranger .338",
    weaponClass: "bolt-action",
    caliber: ".338",
    supportedPenetrationLevels: [2, 3, 4, 5, 6],
    roundsPerSecond: 1.2,
    magazineSize: 5,
  },
];

export const ARMOR_DEFINITIONS: ArmorDefinition[] = [
  { id: "helmet-t1", displayName: "Helmet T1", slot: "helmet", tier: 1, maxDurability: 30 },
  { id: "helmet-t2", displayName: "Helmet T2", slot: "helmet", tier: 2, maxDurability: 60 },
  { id: "helmet-t3", displayName: "Helmet T3", slot: "helmet", tier: 3, maxDurability: 90 },
  { id: "helmet-t4", displayName: "Helmet T4", slot: "helmet", tier: 4, maxDurability: 120 },
  { id: "helmet-t5", displayName: "Helmet T5", slot: "helmet", tier: 5, maxDurability: 150 },
  { id: "helmet-t6", displayName: "Helmet T6", slot: "helmet", tier: 6, maxDurability: 180 },
  { id: "vest-t1", displayName: "Vest T1", slot: "vest", tier: 1, maxDurability: 30 },
  { id: "vest-t2", displayName: "Vest T2", slot: "vest", tier: 2, maxDurability: 60 },
  { id: "vest-t3", displayName: "Vest T3", slot: "vest", tier: 3, maxDurability: 90 },
  { id: "vest-t4", displayName: "Vest T4", slot: "vest", tier: 4, maxDurability: 120 },
  { id: "vest-t5", displayName: "Vest T5", slot: "vest", tier: 5, maxDurability: 150 },
  { id: "vest-t6", displayName: "Vest T6", slot: "vest", tier: 6, maxDurability: 180 },
];
