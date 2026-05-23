export interface IInputService {
  isPressed(action: string): boolean;
  bind(action: string, code: string): void;
  consumeLookDelta(): { x: number; y: number };
  requestPointerLock(): void;
  releasePointerLock(): void;
  isPointerLocked(): boolean;
  dispose(): void;
}

export interface ITimerService {
  now(): number;
}

export interface IUiRenderer {
  mount(root: HTMLElement): void;
  updateHud(state: HudState): void;
  setInventoryBridge(bridge: InventoryBridge): void;
  dispose(): void;
}

export type InventoryContainerKey = "chestRig" | "pockets" | "backpack" | "stash" | "materials";

export interface InventorySlotView {
  id: string;
  label: string | null;
  quantity: number;
  kind: string | null;
}

export interface InventoryContainerView {
  key: InventoryContainerKey;
  label: string;
  slots: InventorySlotView[];
}

export interface InventoryUiState {
  containers: InventoryContainerView[];
  hint: string;
}

export interface InventoryBridge {
  moveItem(
    from: { container: InventoryContainerKey; slotIndex: number },
    to: { container: InventoryContainerKey; slotIndex: number },
  ): boolean;
  toggleStash(): void;
  startRaid(): void;
}

export interface HudState {
  fps: number;
  accumulatorMs: number;
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
  stamina: number;
  maxStamina: number;
  isCrouching: boolean;
  isSprinting: boolean;
  playerHitIndicatorAngleDeg: number;
  playerHitFeedbackStrength: number;
  playerHitFeedbackType: "none" | "health" | "blocked";
  playerArmorCrackFlash: number;
  enemyHitCrosshairAngleDeg: number;
  enemyHitFeedbackStrength: number;
  enemyHitHeadshot: boolean;
  enemyHitBlockedArmor: "none" | "helmet" | "vest";
  deathAnimationActive: boolean;
  deathAnimationProgress: number;
  deathBlackout: number;
  raidEndSceneActive: boolean;
  raidEndScreenTitle: string;
  raidEndScreenSubtitle: string;
  raidEndScreenIndex: number;
  raidEndScreenTotal: number;
  raidEndShowDamageReport: boolean;
  raidEndDamageLines: string[];
  raidEndBackpackItems: string[];
  raidEndStashItems: string[];
  raidEndOverviewLines: string[];
}

export interface ISceneLifecycle {
  onBoot(callback: () => void): void;
  onShutdown(callback: () => void): void;
  triggerBoot(): void;
  triggerShutdown(): void;
}
