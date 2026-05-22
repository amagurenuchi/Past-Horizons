import type { IInputService } from "../app/services";
import type { InventoryContainerKey, InventoryUiState } from "../app/services";
import { calculateDamage } from "../../systems/combat/damage";
import { STARTER_WEAPON, type WeaponSpec } from "../../systems/combat/loadout";
import { InventoryLoadout } from "../../systems/inventory/loadout-data";
import { LootSystem } from "../../systems/loot/loot-system";
import { ExtractionSystem } from "../../systems/extraction/extraction-system";
import { SessionManager } from "../../systems/session/session-manager";
import { CraftingSystem } from "../../systems/progression/crafting-system";
import { EquipmentSystem } from "../../systems/progression/equipment-system";

interface ArmorPiece {
  tier: number;
  durability: number;
}

interface Combatant {
  health: number;
  helmet: ArmorPiece;
  vest: ArmorPiece;
}

type HitLocation = "head" | "chest" | "limb";
interface ViewAngles {
  yaw: number;
  pitch: number;
}

interface ShotTrace {
  id: string;
  from: { x: number; y: number; z: number };
  to: { x: number; y: number; z: number };
  ttlSeconds: number;
}

export interface CombatSnapshot {
  playerHealth: number;
  playerHelmetTier: number;
  playerHelmetDurability: number;
  playerVestTier: number;
  playerVestDurability: number;
  enemyHealth: number;
  enemyHelmetTier: number;
  enemyHelmetDurability: number;
  enemyVestTier: number;
  enemyVestDurability: number;
  ammoProfile: string;
  ammoCaliber: string;
  penetrationLevel: number;
  ammoInMagazine: number;
  quickUseSelected: string;
  quickUseCount: number;
  inventoryOpen: boolean;
  backpackUsage: string;
  stashItemCount: number;
  nearbyLoot: string;
  inventoryState: InventoryUiState;
  raidTimer: string;
  extractionStatus: string;
  sessionOutcome: string;
  raidSummary: string;
  equipmentStatus: string;
  craftingStatus: string;
  activeExtractionZoneId: string | null;
  interactionPrompt: string;
  raidSummaryDetails: string[];
  inMainMenu: boolean;
  mainMenuStatus: string;
  equippedHelmetId: string | null;
  equippedVestId: string | null;
  equippedPrimaryWeaponName: string;
  currentWeaponName: string;
  currentWeaponClass: string;
  currentAmmoCaliber: string;
  currentAmmoProfile: string;
  currentPenetrationLevel: number;
  currentMagazine: string;
  isAds: boolean;
}

export class CombatSimulation {
  private player = {
    x: 0,
    y: 0,
    speed: 4.25,
  };

  private readonly playerStats: Combatant = {
    health: 100,
    helmet: this.createArmor(3),
    vest: this.createArmor(3),
  };

  private readonly enemyStats: Combatant = {
    health: 120,
    helmet: this.createArmor(3),
    vest: this.createArmor(3),
  };

  private readonly weapon: WeaponSpec = STARTER_WEAPON;
  private readonly magazineCapacity = 24;
  private ammoInMagazine = this.magazineCapacity;
  private timeToNextShot = 0;
  private enemyFireCooldown = 0.75;
  private enemyDirection = 1;
  private enemyX = 8;
  private readonly inventory = new InventoryLoadout();
  private readonly lootSystem = new LootSystem();
  private readonly extractionSystem = new ExtractionSystem();
  private readonly sessionManager = new SessionManager();
  private readonly craftingSystem = new CraftingSystem();
  private readonly equipmentSystem = new EquipmentSystem();
  private shotCounter = 0;
  private quickUseNextWasPressed = false;
  private quickUsePrevWasPressed = false;
  private inventoryToggleWasPressed = false;
  private pickupWasPressed = false;
  private inventoryOpen = false;
  private nearbyLootLabel = "none";
  private craftWasPressed = false;
  private craftingStatus = "idle";
  private extractionStatus = "not in zone";
  private readonly damageTakenByBodyPart: Record<HitLocation, number> = { head: 0, chest: 0, limb: 0 };
  private damageDealtToEnemy = 0;
  private previousOutcome: "active" | "extracted" | "died" | "timeout" = "active";
  private readonly viewAngles: ViewAngles = { yaw: 0, pitch: 0 };
  private shotTraceCounter = 0;
  private shotTraces: ShotTrace[] = [];
  private recoilPitchOffset = 0;
  private recoilYawOffset = 0;
  private isAds = false;
  private isReloading = false;
  private reloadRemainingSeconds = 0;
  private reloadPressedLastFrame = false;

  constructor(private readonly input: IInputService) {}

  step(deltaSeconds: number): void {
    if (this.sessionManager.isInMainMenu() && this.input.isPointerLocked()) {
      this.input.releasePointerLock();
    }

    this.stepInventoryToggle();
    this.stepQuickUseWheel();
    if (!this.sessionManager.isInMainMenu()) {
      this.stepAimState();
      this.stepReload(deltaSeconds);
      this.stepMouseLook();
      this.stepMovement(deltaSeconds);
    }
    if (this.sessionManager.getOutcome() === "active" && !this.sessionManager.isInMainMenu()) {
      this.stepShooting(deltaSeconds);
      this.stepEnemyBehavior(deltaSeconds);
    }
    this.stepLootInteraction(deltaSeconds);
    this.stepExtractionAndSession(deltaSeconds);
    this.stepCrafting();
    this.stepShotTraces(deltaSeconds);
    this.stepRecoilRecovery(deltaSeconds);
  }

  getSnapshot(): CombatSnapshot {
    return {
      playerHealth: this.playerStats.health,
      playerHelmetTier: this.playerStats.helmet.tier,
      playerHelmetDurability: this.playerStats.helmet.durability,
      playerVestTier: this.playerStats.vest.tier,
      playerVestDurability: this.playerStats.vest.durability,
      enemyHealth: this.enemyStats.health,
      enemyHelmetTier: this.enemyStats.helmet.tier,
      enemyHelmetDurability: this.enemyStats.helmet.durability,
      enemyVestTier: this.enemyStats.vest.tier,
      enemyVestDurability: this.enemyStats.vest.durability,
      ammoProfile: this.weapon.ammoProfile,
      ammoCaliber: this.weapon.caliber,
      penetrationLevel: this.weapon.penetrationLevel,
      ammoInMagazine: this.ammoInMagazine,
      quickUseSelected: this.inventory.getSelectedQuickUseItem()?.label ?? "none",
      quickUseCount: this.inventory.getQuickUseItems().length,
      inventoryOpen: this.inventoryOpen,
      backpackUsage: this.formatBackpackUsage(),
      stashItemCount: this.inventory.getStashItemCount(),
      nearbyLoot: this.nearbyLootLabel,
      inventoryState: this.inventory.getInventoryView(),
      raidTimer: this.formatRaidTimer(),
      extractionStatus: this.extractionStatus,
      sessionOutcome: this.sessionManager.getOutcome(),
      raidSummary: this.formatRaidSummary(),
      equipmentStatus: this.formatEquipmentStatus(),
      craftingStatus: this.craftingStatus,
      activeExtractionZoneId: this.extractionSystem.getState().activeZoneId,
      interactionPrompt: this.buildInteractionPrompt(),
      raidSummaryDetails: this.sessionManager.getSummary().details,
      inMainMenu: this.sessionManager.isInMainMenu(),
      mainMenuStatus: this.buildMainMenuStatus(),
      equippedHelmetId: this.equipmentSystem.getState().helmetId,
      equippedVestId: this.equipmentSystem.getState().vestId,
      equippedPrimaryWeaponName:
        this.equipmentSystem.getState().primaryWeapon?.displayName ?? this.weapon.displayName,
      currentWeaponName: this.weapon.displayName,
      currentWeaponClass: this.weapon.weaponClass,
      currentAmmoCaliber: this.weapon.caliber,
      currentAmmoProfile: this.weapon.ammoProfile,
      currentPenetrationLevel: this.weapon.penetrationLevel,
      currentMagazine: this.isReloading
        ? `${this.ammoInMagazine}/${this.magazineCapacity} (reloading ${this.reloadRemainingSeconds.toFixed(1)}s)`
        : `${this.ammoInMagazine}/${this.magazineCapacity}`,
      isAds: this.isAds,
    };
  }

  moveInventoryItem(
    from: { container: InventoryContainerKey; slotIndex: number },
    to: { container: InventoryContainerKey; slotIndex: number },
  ): boolean {
    return this.inventory.moveItem(from, to);
  }

  toggleStashScreen(): void {
    if (!this.sessionManager.isInMainMenu()) {
      return;
    }

    this.inventoryOpen = !this.inventoryOpen;
  }

  startRaidFromMenu(): void {
    if (!this.sessionManager.isInMainMenu()) {
      return;
    }

    this.equipmentSystem.applyLoadoutFromMenu();
    this.sessionManager.startRaid();
    this.extractionSystem.reset();
    this.inventoryOpen = false;
    this.extractionStatus = "not in zone";
    this.craftingStatus = "idle";
    this.player = { x: 0, y: 0, speed: 4.25 };
    this.enemyX = 8;
    this.enemyDirection = 1;
    this.enemyFireCooldown = 0.75;
    this.timeToNextShot = 0;
    this.ammoInMagazine = this.magazineCapacity;
    this.isReloading = false;
    this.reloadRemainingSeconds = 0;
    this.recoilPitchOffset = 0;
    this.recoilYawOffset = 0;
    this.isAds = false;
    this.reloadPressedLastFrame = false;
    this.nearbyLootLabel = "none";
    this.previousOutcome = "active";
    this.damageTakenByBodyPart.head = 0;
    this.damageTakenByBodyPart.chest = 0;
    this.damageTakenByBodyPart.limb = 0;
    this.damageDealtToEnemy = 0;
    this.playerStats.health = 100;
    this.playerStats.helmet = this.createArmor(3);
    this.playerStats.vest = this.createArmor(3);
    this.enemyStats.health = 120;
    this.enemyStats.helmet = this.createArmor(3);
    this.enemyStats.vest = this.createArmor(3);
    this.input.requestPointerLock();
  }

  getPlayerPosition(): { x: number; y: number } {
    return { x: this.player.x, y: this.player.y };
  }

  getEnemyPosition(): { x: number; y: number } {
    return { x: this.enemyX, y: 0 };
  }

  getViewAngles(): ViewAngles {
    return {
      yaw: this.viewAngles.yaw + this.recoilYawOffset,
      pitch: this.viewAngles.pitch + this.recoilPitchOffset,
    };
  }

  getExtractionMarkers(): Array<{ id: string; x: number; y: number; active: boolean }> {
    const activeId = this.extractionSystem.getState().activeZoneId;
    return this.extractionSystem.getZones().map((zone) => ({
      id: zone.id,
      x: zone.x,
      y: zone.y,
      active: zone.id === activeId,
    }));
  }

  getShotTraces(): Array<{ id: string; from: { x: number; y: number; z: number }; to: { x: number; y: number; z: number } }> {
    return this.shotTraces.map((trace) => ({
      id: trace.id,
      from: trace.from,
      to: trace.to,
    }));
  }

  private stepMovement(deltaSeconds: number): void {
    let moveX = 0;
    let moveY = 0;

    if (this.input.isPressed("moveForward")) {
      moveY += 1;
    }
    if (this.input.isPressed("moveBackward")) {
      moveY -= 1;
    }
    if (this.input.isPressed("moveLeft")) {
      moveX -= 1;
    }
    if (this.input.isPressed("moveRight")) {
      moveX += 1;
    }

    const magnitude = Math.hypot(moveX, moveY);
    if (magnitude > 0) {
      moveX /= magnitude;
      moveY /= magnitude;
    }

    const forwardX = Math.sin(this.viewAngles.yaw);
    const forwardY = -Math.cos(this.viewAngles.yaw);
    const rightX = Math.cos(this.viewAngles.yaw);
    const rightY = Math.sin(this.viewAngles.yaw);

    const worldX = rightX * moveX + forwardX * moveY;
    const worldY = rightY * moveX + forwardY * moveY;

    this.player.x += worldX * this.player.speed * deltaSeconds;
    this.player.y += worldY * this.player.speed * deltaSeconds;
  }

  private stepShooting(deltaSeconds: number): void {
    this.timeToNextShot -= deltaSeconds;

    if (!this.input.isPressed("shoot") && !this.input.isPressed("shootMouse")) {
      return;
    }

    if (this.isReloading || this.timeToNextShot > 0 || this.ammoInMagazine <= 0) {
      return;
    }

    this.timeToNextShot = 1 / this.weapon.roundsPerSecond;
    this.ammoInMagazine -= 1;

    const hitLocation = this.pickHitLocation();
    const routedDamage = calculateDamage({
      // Hit-location routing determines whether the shot uses helmet, vest, or no armor.
      // Unprotected locations pass armorTier 0 and therefore take full damage.
      penetrationLevel: this.weapon.penetrationLevel,
      armorTier: this.getArmorTierForHit(this.enemyStats, hitLocation),
      baseDamage: this.weapon.baseDamage,
      ammoProfile: this.weapon.ammoProfile,
    });

    this.applyDamage(this.enemyStats, routedDamage.healthDamage, routedDamage.armorDamage, hitLocation);
    this.damageDealtToEnemy += routedDamage.healthDamage + routedDamage.armorDamage;
    this.createShotTrace();

    // Recoil kick: lower while ADS for better control.
    const pitchKick = this.isAds ? 0.006 : 0.012;
    const yawKick = (Math.random() - 0.5) * (this.isAds ? 0.003 : 0.008);
    this.recoilPitchOffset += pitchKick;
    this.recoilYawOffset += yawKick;
  }

  private stepMouseLook(): void {
    const look = this.input.consumeLookDelta();
    const sensitivity = this.isAds ? 0.0014 : 0.0025;
    const invertY = true;
    this.viewAngles.yaw += look.x * sensitivity;
    this.viewAngles.pitch += look.y * sensitivity * (invertY ? -1 : 1);

    const minPitch = -Math.PI / 3;
    const maxPitch = Math.PI / 3;
    this.viewAngles.pitch = Math.max(minPitch, Math.min(maxPitch, this.viewAngles.pitch));
  }

  private stepAimState(): void {
    this.isAds = this.input.isPressed("aimMouse") && this.input.isPointerLocked() && !this.isReloading;
  }

  private stepReload(deltaSeconds: number): void {
    if (this.isReloading) {
      this.reloadRemainingSeconds = Math.max(0, this.reloadRemainingSeconds - deltaSeconds);
      if (this.reloadRemainingSeconds <= 0) {
        this.isReloading = false;
        this.ammoInMagazine = this.magazineCapacity;
      }
      return;
    }

    const reloadPressed = this.input.isPressed("reload");
    if (reloadPressed && !this.reloadPressedLastFrame && this.ammoInMagazine < this.magazineCapacity) {
      this.isReloading = true;
      this.reloadRemainingSeconds = 1.5;
    }
    this.reloadPressedLastFrame = reloadPressed;
  }

  private stepRecoilRecovery(deltaSeconds: number): void {
    const recovery = this.isAds ? 18 : 12;
    const damp = Math.exp(-recovery * deltaSeconds);
    this.recoilPitchOffset *= damp;
    this.recoilYawOffset *= damp;
  }

  private stepShotTraces(deltaSeconds: number): void {
    this.shotTraces = this.shotTraces
      .map((trace) => ({ ...trace, ttlSeconds: trace.ttlSeconds - deltaSeconds }))
      .filter((trace) => trace.ttlSeconds > 0);
  }

  private createShotTrace(): void {
    this.shotTraceCounter += 1;
    const forward = this.getForwardVector();
    const right = this.getRightVector();
    const cameraOrigin = { x: this.player.x, y: 1.65, z: this.player.y };
    const muzzle = {
      x: cameraOrigin.x + right.x * 0.16,
      y: cameraOrigin.y - 0.08,
      z: cameraOrigin.z + right.z * 0.16,
    };
    const maxDistance = 40;
    const hitDistance = this.resolveAimHitDistance(cameraOrigin, forward, maxDistance);
    this.shotTraces.push({
      id: `trace-${this.shotTraceCounter}`,
      from: muzzle,
      to: {
        x: cameraOrigin.x + forward.x * hitDistance,
        y: cameraOrigin.y + forward.y * hitDistance,
        z: cameraOrigin.z + forward.z * hitDistance,
      },
      ttlSeconds: 0.08,
    });
  }

  private getForwardVector(): { x: number; y: number; z: number } {
    const yaw = this.viewAngles.yaw + this.recoilYawOffset;
    const pitch = this.viewAngles.pitch + this.recoilPitchOffset;
    const cosPitch = Math.cos(pitch);
    return {
      x: Math.sin(yaw) * cosPitch,
      y: Math.sin(pitch),
      z: -Math.cos(yaw) * cosPitch,
    };
  }

  private getRightVector(): { x: number; y: number; z: number } {
    const yaw = this.viewAngles.yaw + this.recoilYawOffset;
    return {
      x: Math.cos(yaw),
      y: 0,
      z: Math.sin(yaw),
    };
  }

  private resolveAimHitDistance(
    origin: { x: number; y: number; z: number },
    direction: { x: number; y: number; z: number },
    maxDistance: number,
  ): number {
    let best = maxDistance;

    // Intersect with enemy proxy sphere first (closest positive hit wins).
    const enemyCenter = { x: this.enemyX, y: 1.0, z: 0 };
    const enemyRadius = 0.72;
    const ox = origin.x - enemyCenter.x;
    const oy = origin.y - enemyCenter.y;
    const oz = origin.z - enemyCenter.z;
    const b = ox * direction.x + oy * direction.y + oz * direction.z;
    const c = ox * ox + oy * oy + oz * oz - enemyRadius * enemyRadius;
    const disc = b * b - c;
    if (disc >= 0) {
      const sqrtDisc = Math.sqrt(disc);
      const t1 = -b - sqrtDisc;
      const t2 = -b + sqrtDisc;
      if (t1 > 0 && t1 < best) best = t1;
      else if (t2 > 0 && t2 < best) best = t2;
    }

    // Intersect with ground plane y=0.
    if (Math.abs(direction.y) > 0.0001) {
      const tGround = -origin.y / direction.y;
      if (tGround > 0 && tGround < best) {
        best = tGround;
      }
    }

    return Math.max(0.5, Math.min(best, maxDistance));
  }

  private stepEnemyBehavior(deltaSeconds: number): void {
    if (this.enemyStats.health <= 0) {
      return;
    }

    // Tiny patrol movement around its spawn point to represent basic AI state updates.
    this.enemyX += this.enemyDirection * deltaSeconds * 1.25;
    if (this.enemyX >= 10) {
      this.enemyDirection = -1;
    } else if (this.enemyX <= 6) {
      this.enemyDirection = 1;
    }

    const distanceToPlayer = Math.abs(this.enemyX - this.player.x);
    if (distanceToPlayer > 9) {
      return;
    }

    this.enemyFireCooldown -= deltaSeconds;
    if (this.enemyFireCooldown > 0) {
      return;
    }

    this.enemyFireCooldown = 0.9;
    const hitLocation = this.pickHitLocation();
    const incomingDamage = calculateDamage({
      penetrationLevel: 2,
      armorTier: this.getArmorTierForHit(this.playerStats, hitLocation),
      baseDamage: 8,
      ammoProfile: "standard",
    });
    this.applyDamage(this.playerStats, incomingDamage.healthDamage, incomingDamage.armorDamage, hitLocation);
    this.damageTakenByBodyPart[hitLocation] += incomingDamage.healthDamage + incomingDamage.armorDamage;
  }

  private stepQuickUseWheel(): void {
    const nextPressed = this.input.isPressed("quickUseNext");
    const prevPressed = this.input.isPressed("quickUsePrev");

    if (nextPressed && !this.quickUseNextWasPressed) {
      this.inventory.cycleQuickUse(1);
    }

    if (prevPressed && !this.quickUsePrevWasPressed) {
      this.inventory.cycleQuickUse(-1);
    }

    this.quickUseNextWasPressed = nextPressed;
    this.quickUsePrevWasPressed = prevPressed;
  }

  private stepInventoryToggle(): void {
    if (this.sessionManager.isInMainMenu()) {
      this.inventoryToggleWasPressed = this.input.isPressed("toggleInventory");
      return;
    }

    const inventoryPressed = this.input.isPressed("toggleInventory");
    if (inventoryPressed && !this.inventoryToggleWasPressed) {
      this.inventoryOpen = !this.inventoryOpen;
    }

    this.inventoryToggleWasPressed = inventoryPressed;
  }

  private stepLootInteraction(deltaSeconds: number): void {
    if (this.sessionManager.isInMainMenu()) {
      this.nearbyLootLabel = "none";
      this.pickupWasPressed = this.input.isPressed("pickupLoot");
      return;
    }

    const nearby = this.lootSystem.findNearbyContainer(this.player);
    const isSearching = this.input.isPressed("searchLoot");
    const searchStatus = this.lootSystem.updateSearch(this.player, isSearching, deltaSeconds);

    if (!nearby) {
      this.nearbyLootLabel = "none";
    } else if (!nearby.revealed) {
      const progress = searchStatus.requiredSeconds > 0
        ? `${searchStatus.progressSeconds.toFixed(1)}/${searchStatus.requiredSeconds.toFixed(1)}s`
        : "0.0/0.0s";
      this.nearbyLootLabel = `${nearby.type} [${nearby.tier}] searching ${progress}`;
    } else {
      this.nearbyLootLabel = `${nearby.item?.label ?? "empty"} [${nearby.tier}]`;
    }

    const pickupPressed = this.input.isPressed("pickupLoot");
    if (pickupPressed && !this.pickupWasPressed && nearby) {
      const item = this.lootSystem.pickupFromContainer(nearby.id);
      if (item) {
        const moved = this.inventory.addToBackpack(item);
        if (!moved) {
          // If the backpack is full, keep visibility of what would have been looted.
          this.nearbyLootLabel = `${item.label} (backpack full)`;
        }
      }
    }

    this.pickupWasPressed = pickupPressed;
  }

  private stepExtractionAndSession(deltaSeconds: number): void {
    if (this.sessionManager.isInMainMenu()) {
      this.extractionStatus = "returned to main menu";
      return;
    }

    if (this.sessionManager.getOutcome() !== "active") {
      this.extractionStatus = "raid ended";
      return;
    }

    this.sessionManager.update(deltaSeconds);
    if (this.sessionManager.getOutcome() === "timeout" && this.previousOutcome === "active") {
      this.sessionManager.setFailureDetails(this.buildFailureRaidDetails("timeout"));
      this.extractionStatus = "raid timed out";
      this.previousOutcome = "timeout";
      return;
    }

    if (this.playerStats.health <= 0) {
      const lost = this.inventory.clearBackpackOnDeath();
      this.sessionManager.endAsDeath(lost, this.buildFailureRaidDetails("died"));
      this.extractionStatus = "killed in raid";
      this.previousOutcome = "died";
      return;
    }

    const extraction = this.extractionSystem.update(this.player, deltaSeconds);
    if (!extraction.activeZoneId) {
      this.extractionStatus = "not in zone";
      return;
    }

    this.extractionStatus =
      `extracting ${extraction.progressSeconds.toFixed(1)}/${extraction.requiredSeconds.toFixed(1)}s`;

    if (extraction.completed) {
      const moved = this.inventory.commitExtractionToStash();
      this.sessionManager.endAsExtracted(moved);
      this.extractionStatus = "extracted";
      this.previousOutcome = "extracted";
    }
  }

  private stepCrafting(): void {
    if (this.sessionManager.isInMainMenu()) {
      this.craftWasPressed = this.input.isPressed("craftItem");
      return;
    }

    const craftPressed = this.input.isPressed("craftItem");
    if (craftPressed && !this.craftWasPressed) {
      const result = this.craftingSystem.craft("recipe-bandage", this.inventory);
      this.craftingStatus = result.message;
    }

    this.craftWasPressed = craftPressed;
  }

  private applyDamage(
    target: Combatant,
    healthDamage: number,
    armorDamage: number,
    hitLocation: HitLocation,
  ): void {
    const armor = this.getArmorForHit(target, hitLocation);
    if (armor) {
      armor.durability = Math.max(0, armor.durability - armorDamage);
      if (armor.durability <= 0) {
        armor.tier = 0;
      }
    }

    target.health = Math.max(0, target.health - healthDamage);
  }

  private createArmor(tier: number): ArmorPiece {
    return {
      tier,
      durability: tier * 30,
    };
  }

  private formatBackpackUsage(): string {
    const usage = this.inventory.getBackpackUsage();
    return `${usage.used}/${usage.total}`;
  }

  private formatRaidTimer(): string {
    const remaining = this.sessionManager.getRemainingSeconds();
    const minutes = Math.floor(remaining / 60);
    const seconds = Math.floor(remaining % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  private formatRaidSummary(): string {
    const summary = this.sessionManager.getSummary();
    if (summary.outcome === "active") {
      return "Raid in progress";
    }

    if (summary.outcome === "extracted") {
      return `Extraction complete: ${summary.lootMovedToStash} backpack stacks moved to stash`;
    }

    if (summary.outcome === "died") {
      return `Death in raid: ${summary.lootLostOnDeath} backpack stacks lost`;
    }

    return "Raid timed out";
  }

  private buildFailureRaidDetails(reason: "died" | "timeout"): string[] {
    return [
      `Raid failure reason: ${reason}`,
      `Damage sustained - head: ${this.damageTakenByBodyPart.head.toFixed(1)}`,
      `Damage sustained - chest: ${this.damageTakenByBodyPart.chest.toFixed(1)}`,
      `Damage sustained - limbs: ${this.damageTakenByBodyPart.limb.toFixed(1)}`,
      `Damage dealt to enemy before failure: ${this.damageDealtToEnemy.toFixed(1)}`,
    ];
  }

  private buildInteractionPrompt(): string {
    if (this.sessionManager.isInMainMenu()) {
      return "In main menu - prepare next loadout";
    }

    const nearby = this.lootSystem.findNearbyContainer(this.player);
    if (nearby && !nearby.revealed) {
      return "Hold R to search container";
    }
    if (nearby?.revealed && nearby.item) {
      return "Press F to pick up loot";
    }

    if (this.extractionSystem.getState().activeZoneId) {
      return "Stay in extraction zone";
    }

    return "No interaction";
  }

  private buildMainMenuStatus(): string {
    if (this.sessionManager.isInMainMenu()) {
      return "Main Menu: ready for next deployment";
    }

    return "In Raid";
  }

  private formatEquipmentStatus(): string {
    const state = this.equipmentSystem.getState();
    return `Primary: ${state.primaryWeapon?.displayName ?? this.weapon.displayName}, Helmet: ${state.helmetId ?? "none"}, Vest: ${state.vestId ?? "none"}`;
  }

  private pickHitLocation(): HitLocation {
    this.shotCounter += 1;
    const roll = this.shotCounter % 10;
    if (roll < 2) {
      return "head";
    }
    if (roll < 7) {
      return "chest";
    }

    return "limb";
  }

  private getArmorTierForHit(target: Combatant, hitLocation: HitLocation): number {
    if (hitLocation === "head") {
      return target.helmet.tier;
    }
    if (hitLocation === "chest") {
      return target.vest.tier;
    }

    // Limbs are intentionally unprotected in this prototype and always take full health damage.
    return 0;
  }

  private getArmorForHit(target: Combatant, hitLocation: HitLocation): ArmorPiece | null {
    if (hitLocation === "head") {
      return target.helmet;
    }
    if (hitLocation === "chest") {
      return target.vest;
    }

    return null;
  }
}
