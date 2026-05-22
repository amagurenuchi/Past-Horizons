export type AmmoProfile = "standard" | "rip";

export interface DamageResult {
  healthDamage: number;
  armorDamage: number;
  penetrated: boolean;
}

export interface DamageInput {
  penetrationLevel: number;
  armorTier: number;
  baseDamage: number;
  ammoProfile: AmmoProfile;
}

export function calculateDamage(input: DamageInput): DamageResult {
  const { penetrationLevel, armorTier, baseDamage, ammoProfile } = input;

  if (armorTier <= 0) {
    if (ammoProfile === "rip") {
      return { healthDamage: baseDamage * 1.35, armorDamage: 0, penetrated: false };
    }

    return { healthDamage: baseDamage, armorDamage: 0, penetrated: true };
  }

  if (ammoProfile === "rip") {
    return { healthDamage: 0, armorDamage: baseDamage * 0.15, penetrated: false };
  }

  if (armorTier > penetrationLevel) {
    return { healthDamage: 0, armorDamage: baseDamage * 0.5, penetrated: false };
  }

  if (armorTier === penetrationLevel) {
    return { healthDamage: baseDamage * 0.5, armorDamage: baseDamage * 0.5, penetrated: false };
  }

  if (armorTier < penetrationLevel - 1) {
    return { healthDamage: baseDamage, armorDamage: baseDamage * 0.25, penetrated: true };
  }

  return { healthDamage: baseDamage * 0.75, armorDamage: baseDamage * 0.5, penetrated: false };
}
