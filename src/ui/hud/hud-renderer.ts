import type {
  HudState,
  InventoryBridge,
  InventoryContainerKey,
  IUiRenderer,
} from "../../core/app/services";

export class HudRenderer implements IUiRenderer {
  private root: HTMLDivElement | null = null;
  private inventoryPanel: HTMLDivElement | null = null;
  private fpsEl: HTMLSpanElement | null = null;
  private fixedStepEl: HTMLSpanElement | null = null;
  private playerEl: HTMLSpanElement | null = null;
  private enemyEl: HTMLSpanElement | null = null;
  private ammoEl: HTMLSpanElement | null = null;
  private inventoryEl: HTMLSpanElement | null = null;
  private lootEl: HTMLSpanElement | null = null;
  private raidEl: HTMLSpanElement | null = null;
  private progressionEl: HTMLSpanElement | null = null;
  private promptEl: HTMLSpanElement | null = null;
  private staminaBarFill: HTMLDivElement | null = null;
  private staminaBarLabel: HTMLSpanElement | null = null;
  private weaponPanel: HTMLDivElement | null = null;
  private summaryModal: HTMLDivElement | null = null;
  private mainMenuOverlay: HTMLDivElement | null = null;
  private stashButton: HTMLButtonElement | null = null;
  private startButton: HTMLButtonElement | null = null;
  private crosshair: HTMLDivElement | null = null;
  private crosshairVertical: HTMLDivElement | null = null;
  private crosshairHorizontal: HTMLDivElement | null = null;
  private crosshairHitMarker: HTMLDivElement | null = null;
  private crosshairHitMarkerTop: HTMLDivElement | null = null;
  private crosshairHitMarkerRight: HTMLDivElement | null = null;
  private crosshairHitMarkerBottom: HTMLDivElement | null = null;
  private crosshairHitMarkerLeft: HTMLDivElement | null = null;
  private playerHitOverlay: HTMLDivElement | null = null;
  private playerHitArrow: HTMLDivElement | null = null;
  private armorCrackOverlay: HTMLDivElement | null = null;
  private deathBlackoutOverlay: HTMLDivElement | null = null;
  private raidEndScene: HTMLDivElement | null = null;
  private inventoryBridge: InventoryBridge | null = null;

  mount(container: HTMLElement): void {
    const root = document.createElement("div");
    root.style.position = "absolute";
    root.style.left = "0";
    root.style.top = "0";
    root.style.zIndex = "50";
    root.style.padding = "8px 12px";
    root.style.background = "rgba(0, 0, 0, 0.5)";
    root.style.color = "#f8fafc";
    root.style.fontFamily = "monospace";
    root.style.fontSize = "12px";
    root.style.display = "grid";
    root.style.gap = "4px";
    root.style.pointerEvents = "none";

    const fpsEl = document.createElement("span");
    const fixedStepEl = document.createElement("span");
    const playerEl = document.createElement("span");
    const enemyEl = document.createElement("span");
    const ammoEl = document.createElement("span");
    const inventoryEl = document.createElement("span");
    const lootEl = document.createElement("span");
    const raidEl = document.createElement("span");
    const progressionEl = document.createElement("span");
    const promptEl = document.createElement("span");
    root.append(fpsEl, fixedStepEl, playerEl, enemyEl, ammoEl, inventoryEl, lootEl, raidEl, progressionEl, promptEl);

    const staminaWrap = document.createElement("div");
    staminaWrap.style.display = "grid";
    staminaWrap.style.gap = "3px";
    staminaWrap.style.width = "220px";
    const staminaBar = document.createElement("div");
    staminaBar.style.height = "8px";
    staminaBar.style.border = "1px solid rgba(148, 163, 184, 0.6)";
    staminaBar.style.background = "rgba(15, 23, 42, 0.85)";
    const staminaBarFill = document.createElement("div");
    staminaBarFill.style.height = "100%";
    staminaBarFill.style.width = "100%";
    staminaBarFill.style.background = "#22c55e";
    staminaBar.appendChild(staminaBarFill);
    const staminaBarLabel = document.createElement("span");
    staminaBarLabel.style.color = "#cbd5e1";
    staminaWrap.append(staminaBarLabel, staminaBar);
    root.appendChild(staminaWrap);
    container.appendChild(root);

    const inventoryPanel = document.createElement("div");
    inventoryPanel.style.position = "absolute";
    inventoryPanel.style.right = "16px";
    inventoryPanel.style.top = "16px";
    inventoryPanel.style.width = "460px";
    inventoryPanel.style.maxHeight = "70vh";
    inventoryPanel.style.overflowY = "auto";
    inventoryPanel.style.padding = "12px";
    inventoryPanel.style.border = "1px solid rgba(148, 163, 184, 0.4)";
    inventoryPanel.style.background = "rgba(2, 6, 23, 0.95)";
    inventoryPanel.style.fontFamily = "monospace";
    inventoryPanel.style.fontSize = "12px";
    inventoryPanel.style.display = "none";
    inventoryPanel.style.zIndex = "60";
    container.appendChild(inventoryPanel);

    const summaryModal = document.createElement("div");
    summaryModal.style.position = "absolute";
    summaryModal.style.inset = "0";
    summaryModal.style.display = "none";
    summaryModal.style.alignItems = "center";
    summaryModal.style.justifyContent = "center";
    summaryModal.style.background = "rgba(2, 6, 23, 0.72)";
    summaryModal.style.zIndex = "80";
    container.appendChild(summaryModal);

    const weaponPanel = document.createElement("div");
    weaponPanel.style.position = "absolute";
    weaponPanel.style.right = "20px";
    weaponPanel.style.bottom = "20px";
    weaponPanel.style.padding = "10px 12px";
    weaponPanel.style.border = "1px solid rgba(148, 163, 184, 0.45)";
    weaponPanel.style.background = "rgba(2, 6, 23, 0.9)";
    weaponPanel.style.color = "#e2e8f0";
    weaponPanel.style.fontFamily = "monospace";
    weaponPanel.style.fontSize = "12px";
    weaponPanel.style.zIndex = "75";
    weaponPanel.style.pointerEvents = "none";
    container.appendChild(weaponPanel);

    const mainMenuOverlay = document.createElement("div");
    mainMenuOverlay.style.position = "absolute";
    mainMenuOverlay.style.inset = "0";
    mainMenuOverlay.style.display = "none";
    mainMenuOverlay.style.pointerEvents = "none";
    mainMenuOverlay.style.zIndex = "70";
    container.appendChild(mainMenuOverlay);

    const stashButton = document.createElement("button");
    stashButton.textContent = "Stash";
    stashButton.style.position = "absolute";
    stashButton.style.left = "20px";
    stashButton.style.bottom = "20px";
    stashButton.style.padding = "10px 18px";
    stashButton.style.border = "1px solid rgba(148,163,184,0.55)";
    stashButton.style.background = "rgba(15,23,42,0.95)";
    stashButton.style.color = "#e2e8f0";
    stashButton.style.cursor = "pointer";
    stashButton.style.pointerEvents = "auto";
    stashButton.onclick = () => this.inventoryBridge?.toggleStash();
    mainMenuOverlay.appendChild(stashButton);

    const startButton = document.createElement("button");
    startButton.textContent = "Start";
    startButton.style.position = "absolute";
    startButton.style.right = "20px";
    startButton.style.bottom = "20px";
    startButton.style.padding = "10px 18px";
    startButton.style.border = "1px solid rgba(34,197,94,0.65)";
    startButton.style.background = "rgba(20,83,45,0.95)";
    startButton.style.color = "#dcfce7";
    startButton.style.cursor = "pointer";
    startButton.style.pointerEvents = "auto";
    startButton.onclick = () => this.inventoryBridge?.startRaid();
    mainMenuOverlay.appendChild(startButton);

    const crosshair = document.createElement("div");
    crosshair.style.position = "absolute";
    crosshair.style.left = "50%";
    crosshair.style.top = "50%";
    crosshair.style.transform = "translate(-50%, -50%)";
    crosshair.style.width = "18px";
    crosshair.style.height = "18px";
    crosshair.style.zIndex = "76";
    crosshair.style.pointerEvents = "none";
    crosshair.style.display = "none";
    const crosshairVertical = document.createElement("div");
    crosshairVertical.style.position = "absolute";
    crosshairVertical.style.left = "8px";
    crosshairVertical.style.top = "0";
    crosshairVertical.style.width = "2px";
    crosshairVertical.style.height = "18px";
    crosshairVertical.style.background = "#f8fafc";
    const crosshairHorizontal = document.createElement("div");
    crosshairHorizontal.style.position = "absolute";
    crosshairHorizontal.style.left = "0";
    crosshairHorizontal.style.top = "8px";
    crosshairHorizontal.style.width = "18px";
    crosshairHorizontal.style.height = "2px";
    crosshairHorizontal.style.background = "#f8fafc";
    crosshair.append(crosshairVertical, crosshairHorizontal);
    container.appendChild(crosshair);

    const crosshairHitMarker = document.createElement("div");
    crosshairHitMarker.style.position = "absolute";
    crosshairHitMarker.style.left = "50%";
    crosshairHitMarker.style.top = "50%";
    crosshairHitMarker.style.width = "28px";
    crosshairHitMarker.style.height = "28px";
    crosshairHitMarker.style.pointerEvents = "none";
    crosshairHitMarker.style.zIndex = "76";
    crosshairHitMarker.style.opacity = "0";
    crosshairHitMarker.style.transform = "translate(-50%, -50%)";
    const crosshairHitMarkerTop = document.createElement("div");
    crosshairHitMarkerTop.style.position = "absolute";
    crosshairHitMarkerTop.style.left = "17px";
    crosshairHitMarkerTop.style.top = "7px";
    crosshairHitMarkerTop.style.width = "8px";
    crosshairHitMarkerTop.style.height = "2px";
    crosshairHitMarkerTop.style.background = "#f8fafc";
    crosshairHitMarkerTop.style.transform = "rotate(45deg)";
    const crosshairHitMarkerRight = document.createElement("div");
    crosshairHitMarkerRight.style.position = "absolute";
    crosshairHitMarkerRight.style.left = "17px";
    crosshairHitMarkerRight.style.top = "17px";
    crosshairHitMarkerRight.style.width = "8px";
    crosshairHitMarkerRight.style.height = "2px";
    crosshairHitMarkerRight.style.background = "#f8fafc";
    crosshairHitMarkerRight.style.transform = "rotate(-45deg)";
    const crosshairHitMarkerBottom = document.createElement("div");
    crosshairHitMarkerBottom.style.position = "absolute";
    crosshairHitMarkerBottom.style.left = "3px";
    crosshairHitMarkerBottom.style.top = "17px";
    crosshairHitMarkerBottom.style.width = "8px";
    crosshairHitMarkerBottom.style.height = "2px";
    crosshairHitMarkerBottom.style.background = "#f8fafc";
    crosshairHitMarkerBottom.style.transform = "rotate(45deg)";
    const crosshairHitMarkerLeft = document.createElement("div");
    crosshairHitMarkerLeft.style.position = "absolute";
    crosshairHitMarkerLeft.style.left = "3px";
    crosshairHitMarkerLeft.style.top = "7px";
    crosshairHitMarkerLeft.style.width = "8px";
    crosshairHitMarkerLeft.style.height = "2px";
    crosshairHitMarkerLeft.style.background = "#f8fafc";
    crosshairHitMarkerLeft.style.transform = "rotate(-45deg)";
    crosshairHitMarker.append(
      crosshairHitMarkerTop,
      crosshairHitMarkerRight,
      crosshairHitMarkerBottom,
      crosshairHitMarkerLeft,
    );
    container.appendChild(crosshairHitMarker);

    const playerHitOverlay = document.createElement("div");
    playerHitOverlay.style.position = "absolute";
    playerHitOverlay.style.inset = "0";
    playerHitOverlay.style.background = "rgba(239,68,68,0)";
    playerHitOverlay.style.pointerEvents = "none";
    playerHitOverlay.style.zIndex = "77";
    container.appendChild(playerHitOverlay);

    const playerHitArrow = document.createElement("div");
    playerHitArrow.style.position = "absolute";
    playerHitArrow.style.left = "50%";
    playerHitArrow.style.top = "50%";
    playerHitArrow.style.transformOrigin = "50% 50%";
    playerHitArrow.style.color = "#f8fafc";
    playerHitArrow.style.fontSize = "22px";
    playerHitArrow.style.fontWeight = "700";
    playerHitArrow.style.opacity = "0";
    playerHitArrow.style.pointerEvents = "none";
    playerHitArrow.style.zIndex = "78";
    playerHitArrow.textContent = "▲";
    container.appendChild(playerHitArrow);

    const armorCrackOverlay = document.createElement("div");
    armorCrackOverlay.style.position = "absolute";
    armorCrackOverlay.style.inset = "0";
    armorCrackOverlay.style.pointerEvents = "none";
    armorCrackOverlay.style.backgroundImage =
      "linear-gradient(130deg, transparent 35%, rgba(248,250,252,0.5) 36%, transparent 38%)," +
      "linear-gradient(50deg, transparent 48%, rgba(248,250,252,0.45) 49%, transparent 51%)," +
      "linear-gradient(200deg, transparent 54%, rgba(248,250,252,0.4) 55%, transparent 57%)";
    armorCrackOverlay.style.opacity = "0";
    armorCrackOverlay.style.zIndex = "79";
    container.appendChild(armorCrackOverlay);

    const deathBlackoutOverlay = document.createElement("div");
    deathBlackoutOverlay.style.position = "absolute";
    deathBlackoutOverlay.style.inset = "0";
    deathBlackoutOverlay.style.pointerEvents = "none";
    deathBlackoutOverlay.style.background = "rgba(0, 0, 0, 0)";
    deathBlackoutOverlay.style.zIndex = "81";
    container.appendChild(deathBlackoutOverlay);

    const raidEndScene = document.createElement("div");
    raidEndScene.style.position = "absolute";
    raidEndScene.style.inset = "0";
    raidEndScene.style.display = "none";
    raidEndScene.style.padding = "32px";
    raidEndScene.style.zIndex = "82";
    raidEndScene.style.background =
      "radial-gradient(circle at 15% 20%, rgba(14,116,144,0.2), transparent 45%), rgba(1,4,9,0.97)";
    raidEndScene.style.color = "#e2e8f0";
    raidEndScene.style.fontFamily = "monospace";
    container.appendChild(raidEndScene);

    this.root = root;
    this.inventoryPanel = inventoryPanel;
    this.fpsEl = fpsEl;
    this.fixedStepEl = fixedStepEl;
    this.playerEl = playerEl;
    this.enemyEl = enemyEl;
    this.ammoEl = ammoEl;
    this.inventoryEl = inventoryEl;
    this.lootEl = lootEl;
    this.raidEl = raidEl;
    this.progressionEl = progressionEl;
    this.promptEl = promptEl;
    this.staminaBarFill = staminaBarFill;
    this.staminaBarLabel = staminaBarLabel;
    this.summaryModal = summaryModal;
    this.weaponPanel = weaponPanel;
    this.mainMenuOverlay = mainMenuOverlay;
    this.stashButton = stashButton;
    this.startButton = startButton;
    this.crosshair = crosshair;
    this.crosshairVertical = crosshairVertical;
    this.crosshairHorizontal = crosshairHorizontal;
    this.crosshairHitMarker = crosshairHitMarker;
    this.crosshairHitMarkerTop = crosshairHitMarkerTop;
    this.crosshairHitMarkerRight = crosshairHitMarkerRight;
    this.crosshairHitMarkerBottom = crosshairHitMarkerBottom;
    this.crosshairHitMarkerLeft = crosshairHitMarkerLeft;
    this.playerHitOverlay = playerHitOverlay;
    this.playerHitArrow = playerHitArrow;
    this.armorCrackOverlay = armorCrackOverlay;
    this.deathBlackoutOverlay = deathBlackoutOverlay;
    this.raidEndScene = raidEndScene;
    this.updateHud({
      fps: 0,
      accumulatorMs: 0,
      playerHealth: 0,
      playerHelmetTier: 0,
      playerHelmetDurability: 0,
      playerVestTier: 0,
      playerVestDurability: 0,
      enemyHealth: 0,
      enemyHelmetTier: 0,
      enemyHelmetDurability: 0,
      enemyVestTier: 0,
      enemyVestDurability: 0,
      ammoProfile: "rip",
      ammoCaliber: "",
      penetrationLevel: 0,
      ammoInMagazine: 0,
      quickUseSelected: "none",
      quickUseCount: 0,
      inventoryOpen: false,
      backpackUsage: "0/0",
      stashItemCount: 0,
      nearbyLoot: "none",
      inventoryState: { containers: [], hint: "" },
      raidTimer: "20:00",
      extractionStatus: "not in zone",
      sessionOutcome: "active",
      raidSummary: "Raid in progress",
      equipmentStatus: "Primary: none",
      craftingStatus: "idle",
      activeExtractionZoneId: null,
      interactionPrompt: "No interaction",
      raidSummaryDetails: [],
      inMainMenu: true,
      mainMenuStatus: "Main Menu: ready for next deployment",
      equippedHelmetId: "helmet-t3",
      equippedVestId: "vest-t3",
      equippedPrimaryWeaponName: "Viper-9 SMG",
      currentWeaponName: "Viper-9 SMG",
      currentWeaponClass: "smg",
      currentAmmoCaliber: "9x19",
      currentAmmoProfile: "rip",
      currentPenetrationLevel: 2,
      currentMagazine: "24/24",
      isAds: false,
      stamina: 100,
      maxStamina: 100,
      isCrouching: false,
      isSprinting: false,
      playerHitIndicatorAngleDeg: 0,
      playerHitFeedbackStrength: 0,
      playerHitFeedbackType: "none",
      playerArmorCrackFlash: 0,
      enemyHitCrosshairAngleDeg: 0,
      enemyHitFeedbackStrength: 0,
      enemyHitHeadshot: false,
      enemyHitBlockedArmor: "none",
      deathAnimationActive: false,
      deathAnimationProgress: 0,
      deathBlackout: 0,
      raidEndSceneActive: false,
      raidEndScreenTitle: "",
      raidEndScreenSubtitle: "",
      raidEndScreenIndex: 1,
      raidEndScreenTotal: 1,
      raidEndShowDamageReport: false,
      raidEndDamageLines: [],
      raidEndBackpackItems: [],
      raidEndStashItems: [],
      raidEndOverviewLines: [],
    });
  }

  setInventoryBridge(bridge: InventoryBridge): void {
    this.inventoryBridge = bridge;
  }

  updateHud(state: HudState): void {
    if (
      !this.fpsEl ||
      !this.fixedStepEl ||
      !this.playerEl ||
      !this.enemyEl ||
      !this.ammoEl ||
      !this.inventoryEl ||
      !this.lootEl ||
      !this.raidEl ||
      !this.progressionEl ||
      !this.promptEl ||
      !this.staminaBarFill ||
      !this.staminaBarLabel
    ) {
      return;
    }

    if (this.root) {
      this.root.style.display = state.raidEndSceneActive ? "none" : "grid";
    }
    if (this.inventoryPanel && state.raidEndSceneActive) {
      this.inventoryPanel.style.display = "none";
    }

    this.fpsEl.textContent = `FPS: ${state.fps.toFixed(1)}`;
    this.fixedStepEl.textContent = `Accumulator: ${state.accumulatorMs.toFixed(2)}ms`;
    this.playerEl.textContent =
      `Player HP: ${state.playerHealth.toFixed(0)} | Helmet T${state.playerHelmetTier} ` +
      `(${state.playerHelmetDurability.toFixed(0)}) | Vest T${state.playerVestTier} ` +
      `(${state.playerVestDurability.toFixed(0)})`;
    this.enemyEl.textContent =
      `Enemy HP: ${state.enemyHealth.toFixed(0)} | Helmet T${state.enemyHelmetTier} ` +
      `(${state.enemyHelmetDurability.toFixed(0)}) | Vest T${state.enemyVestTier} ` +
      `(${state.enemyVestDurability.toFixed(0)})`;
    this.ammoEl.textContent =
      `Ammo: ${state.ammoCaliber} ${state.ammoProfile} Lv.${state.penetrationLevel} ` +
      `(${state.ammoInMagazine}) | QuickUse: ${state.quickUseSelected} (${state.quickUseCount})`;
    this.inventoryEl.textContent =
      `Inventory: ${state.inventoryOpen ? "OPEN" : "CLOSED"} | Backpack: ${state.backpackUsage} | Stash: ${state.stashItemCount} items`;
    this.lootEl.textContent = `Nearby Loot: ${state.nearbyLoot}`;
    this.raidEl.textContent =
      `Raid: ${state.raidTimer} | Exfil: ${state.extractionStatus} | Outcome: ${state.sessionOutcome} | ${state.raidSummary} | ${state.mainMenuStatus}`;
    this.progressionEl.textContent =
      `Equipment: ${state.equipmentStatus} | Crafting: ${state.craftingStatus}`;
    this.promptEl.textContent =
      `Prompt: ${state.interactionPrompt}${state.activeExtractionZoneId ? ` | Active Exfil: ${state.activeExtractionZoneId}` : ""}`;
    const staminaPct = state.maxStamina > 0 ? Math.max(0, Math.min(1, state.stamina / state.maxStamina)) : 0;
    this.staminaBarFill.style.width = `${(staminaPct * 100).toFixed(1)}%`;
    this.staminaBarFill.style.background = staminaPct > 0.5 ? "#22c55e" : staminaPct > 0.25 ? "#eab308" : "#ef4444";
    const movementState = state.isSprinting ? "SPRINT" : state.isCrouching ? "CROUCH" : "WALK";
    this.staminaBarLabel.textContent = `Stamina: ${state.stamina.toFixed(0)}/${state.maxStamina.toFixed(0)} | ${movementState}`;
    if (this.weaponPanel) {
      this.weaponPanel.style.display = state.inMainMenu ? "none" : "block";
      this.weaponPanel.textContent =
        `Weapon: ${state.currentWeaponName} (${state.currentWeaponClass}) | ` +
        `Ammo: ${state.currentAmmoCaliber} ${state.currentAmmoProfile} Lv.${state.currentPenetrationLevel} | ` +
        `Mag: ${state.currentMagazine} | ${state.isAds ? "ADS" : "HIP"}`;
    }
    this.renderInventoryPanel(state);
    this.renderSummaryModal(state);
    this.renderMainMenu(state);
    if (this.crosshair) {
      this.crosshair.style.display = state.inMainMenu || state.raidEndSceneActive ? "none" : "block";
    }
    this.renderHitFeedback(state);
    this.renderDeathOverlay(state);
    this.renderRaidEndScene(state);
  }

  dispose(): void {
    this.root?.remove();
    this.inventoryPanel?.remove();
    this.root = null;
    this.inventoryPanel = null;
    this.fpsEl = null;
    this.fixedStepEl = null;
    this.playerEl = null;
    this.enemyEl = null;
    this.ammoEl = null;
    this.inventoryEl = null;
    this.lootEl = null;
    this.raidEl = null;
    this.progressionEl = null;
    this.promptEl = null;
    this.staminaBarFill = null;
    this.staminaBarLabel = null;
    this.summaryModal = null;
    this.weaponPanel = null;
    this.mainMenuOverlay = null;
    this.stashButton = null;
    this.startButton = null;
    this.crosshair = null;
    this.crosshairVertical = null;
    this.crosshairHorizontal = null;
    this.crosshairHitMarker = null;
    this.crosshairHitMarkerTop = null;
    this.crosshairHitMarkerRight = null;
    this.crosshairHitMarkerBottom = null;
    this.crosshairHitMarkerLeft = null;
    this.playerHitOverlay = null;
    this.playerHitArrow = null;
    this.armorCrackOverlay = null;
    this.deathBlackoutOverlay = null;
    this.raidEndScene = null;
  }

  private renderInventoryPanel(state: HudState): void {
    if (!this.inventoryPanel) {
      return;
    }

    this.inventoryPanel.style.display = state.inventoryOpen ? "block" : "none";
    if (!state.inventoryOpen) {
      return;
    }

    this.inventoryPanel.innerHTML = "";
    for (const container of state.inventoryState.containers) {
      const section = document.createElement("div");
      section.style.marginBottom = "12px";

      const title = document.createElement("div");
      title.textContent = container.label;
      title.style.marginBottom = "6px";
      title.style.fontWeight = "700";
      section.appendChild(title);

      const grid = document.createElement("div");
      grid.style.display = "grid";
      grid.style.gridTemplateColumns = "repeat(4, minmax(0, 1fr))";
      grid.style.gap = "6px";

      container.slots.forEach((slot, index) => {
        const slotEl = document.createElement("div");
        slotEl.style.minHeight = "42px";
        slotEl.style.padding = "6px";
        slotEl.style.border = "1px solid rgba(148, 163, 184, 0.35)";
        slotEl.style.background = slot.label ? "rgba(30, 41, 59, 0.9)" : "rgba(15, 23, 42, 0.5)";
        slotEl.style.cursor = "pointer";
        slotEl.dataset.container = container.key;
        slotEl.dataset.index = String(index);
        slotEl.textContent = slot.label ? `${slot.label} x${slot.quantity}` : "(empty)";

        if (slot.label) {
          slotEl.draggable = true;
          slotEl.addEventListener("dragstart", (event) => {
            if (!event.dataTransfer) {
              return;
            }

            event.dataTransfer.setData(
              "application/x-past-horizons-slot",
              JSON.stringify({ container: container.key, slotIndex: index }),
            );
          });
        }

        slotEl.addEventListener("dragover", (event) => {
          event.preventDefault();
        });

        slotEl.addEventListener("drop", (event) => {
          event.preventDefault();
          const data = event.dataTransfer?.getData("application/x-past-horizons-slot");
          if (!data || !this.inventoryBridge) {
            return;
          }

          const from = JSON.parse(data) as { container: InventoryContainerKey; slotIndex: number };
          this.inventoryBridge.moveItem(from, { container: container.key, slotIndex: index });
        });

        grid.appendChild(slotEl);
      });

      section.appendChild(grid);
      this.inventoryPanel?.appendChild(section);
    }

    const hint = document.createElement("div");
    hint.style.marginTop = "6px";
    hint.style.color = "rgba(148, 163, 184, 0.95)";
    hint.textContent = state.inventoryState.hint;
    this.inventoryPanel.appendChild(hint);
  }

  private renderSummaryModal(state: HudState): void {
    if (!this.summaryModal) {
      return;
    }

    if (state.raidEndSceneActive) {
      this.summaryModal.style.display = "none";
      this.summaryModal.innerHTML = "";
      return;
    }

    const showFailureSummary = !state.inMainMenu && (state.sessionOutcome === "died" || state.sessionOutcome === "timeout");
    if (!showFailureSummary) {
      this.summaryModal.style.display = "none";
      this.summaryModal.innerHTML = "";
      return;
    }

    this.summaryModal.style.display = "flex";
    this.summaryModal.innerHTML = "";

    const card = document.createElement("div");
    card.style.width = "min(640px, 92vw)";
    card.style.maxHeight = "80vh";
    card.style.overflowY = "auto";
    card.style.padding = "18px";
    card.style.border = "1px solid rgba(239, 68, 68, 0.55)";
    card.style.background = "rgba(15, 23, 42, 0.98)";
    card.style.color = "#f8fafc";
    card.style.fontFamily = "monospace";

    const title = document.createElement("h2");
    title.textContent = "Raid Failed";
    title.style.margin = "0 0 12px 0";
    title.style.fontSize = "18px";

    const subtitle = document.createElement("p");
    subtitle.textContent = state.raidSummary;
    subtitle.style.margin = "0 0 10px 0";

    const list = document.createElement("ul");
    list.style.margin = "0";
    list.style.paddingLeft = "20px";
    for (const line of state.raidSummaryDetails) {
      const item = document.createElement("li");
      item.textContent = line;
      item.style.marginBottom = "4px";
      list.appendChild(item);
    }

    card.append(title, subtitle, list);
    this.summaryModal.appendChild(card);
  }

  private renderMainMenu(state: HudState): void {
    if (!this.mainMenuOverlay) {
      return;
    }

    this.mainMenuOverlay.style.display = state.inMainMenu && !state.raidEndSceneActive ? "block" : "none";
  }

  private renderHitFeedback(state: HudState): void {
    if (!this.playerHitOverlay || !this.playerHitArrow || !this.armorCrackOverlay || !this.crosshair) {
      return;
    }

    const hitColor = state.playerHitFeedbackType === "blocked"
      ? `rgba(248,250,252,${(state.playerHitFeedbackStrength * 0.2).toFixed(3)})`
      : `rgba(239,68,68,${(state.playerHitFeedbackStrength * 0.24).toFixed(3)})`;
    this.playerHitOverlay.style.background = hitColor;

    this.playerHitArrow.style.opacity = state.playerHitFeedbackStrength.toFixed(3);
    this.playerHitArrow.style.transform =
      `translate(-50%, -130px) rotate(${state.playerHitIndicatorAngleDeg.toFixed(1)}deg) scale(${(1 + state.playerHitFeedbackStrength * 0.2).toFixed(3)})`;

    this.armorCrackOverlay.style.opacity = (state.playerArmorCrackFlash * 0.6).toFixed(3);

    if (this.crosshairVertical && this.crosshairHorizontal) {
      const alpha = 0.55 + state.enemyHitFeedbackStrength * 0.45;
      const blockedColor = state.enemyHitBlockedArmor === "helmet"
        ? "#22d3ee"
        : state.enemyHitBlockedArmor === "vest"
          ? "#38bdf8"
          : "#f8fafc";
      this.crosshairVertical.style.background = blockedColor;
      this.crosshairHorizontal.style.background = blockedColor;
      this.crosshairVertical.style.opacity = alpha.toFixed(3);
      this.crosshairHorizontal.style.opacity = alpha.toFixed(3);
      const base = state.enemyHitHeadshot ? 3 : 2;
      this.crosshairVertical.style.width = `${base}px`;
      this.crosshairHorizontal.style.height = `${base}px`;
      this.crosshair.style.transform = "translate(-50%, -50%)";
    }

    if (
      this.crosshairHitMarker &&
      this.crosshairHitMarkerTop &&
      this.crosshairHitMarkerRight &&
      this.crosshairHitMarkerBottom &&
      this.crosshairHitMarkerLeft
    ) {
      const angleRadians = (state.enemyHitCrosshairAngleDeg * Math.PI) / 180;
      const offsetX = Math.sin(angleRadians) * 13;
      const offsetY = -Math.cos(angleRadians) * 13;
      const alpha = state.enemyHitFeedbackStrength;
      const blockedColor = state.enemyHitBlockedArmor === "helmet"
        ? "#22d3ee"
        : state.enemyHitBlockedArmor === "vest"
          ? "#38bdf8"
          : "#f8fafc";
      const thickness = state.enemyHitHeadshot ? 3 : 2;
      this.crosshairHitMarkerTop.style.background = blockedColor;
      this.crosshairHitMarkerRight.style.background = blockedColor;
      this.crosshairHitMarkerBottom.style.background = blockedColor;
      this.crosshairHitMarkerLeft.style.background = blockedColor;
      this.crosshairHitMarkerTop.style.height = `${thickness}px`;
      this.crosshairHitMarkerRight.style.height = `${thickness}px`;
      this.crosshairHitMarkerBottom.style.height = `${thickness}px`;
      this.crosshairHitMarkerLeft.style.height = `${thickness}px`;
      this.crosshairHitMarker.style.opacity = alpha.toFixed(3);
      this.crosshairHitMarker.style.transform = `translate(-50%, -50%) translate(${offsetX.toFixed(1)}px, ${offsetY.toFixed(1)}px)`;
    }
  }

  private renderDeathOverlay(state: HudState): void {
    if (!this.deathBlackoutOverlay) {
      return;
    }

    this.deathBlackoutOverlay.style.background = `rgba(0, 0, 0, ${state.deathBlackout.toFixed(3)})`;
  }

  private renderRaidEndScene(state: HudState): void {
    if (!this.raidEndScene) {
      return;
    }

    this.raidEndScene.style.display = state.raidEndSceneActive ? "grid" : "none";
    if (!state.raidEndSceneActive) {
      this.raidEndScene.innerHTML = "";
      return;
    }

    const title = state.raidEndScreenTitle || "Raid End";
    const subtitle = state.raidEndScreenSubtitle || "";
    const page = `${Math.max(1, state.raidEndScreenIndex)}/${Math.max(1, state.raidEndScreenTotal)}`;

    this.raidEndScene.innerHTML = "";
    const card = document.createElement("div");
    card.style.margin = "auto";
    card.style.width = "min(900px, 95vw)";
    card.style.border = "1px solid rgba(100,116,139,0.45)";
    card.style.background = "rgba(2,6,23,0.94)";
    card.style.padding = "24px";
    const h1 = document.createElement("h2");
    h1.textContent = `${title}  [${page}]`;
    h1.style.margin = "0 0 8px 0";
    const sub = document.createElement("p");
    sub.textContent = `${subtitle} — Press Enter or Left Click to continue (auto-advances).`;
    sub.style.margin = "0 0 16px 0";
    sub.style.color = "#94a3b8";
    card.append(h1, sub);

    if (title === "Loot and Stash") {
      const split = document.createElement("div");
      split.style.display = "grid";
      split.style.gridTemplateColumns = "1fr 1fr";
      split.style.gap = "16px";
      split.append(
        this.createLootGrid("Backpack", state.raidEndBackpackItems),
        this.createLootGrid("Stash", state.raidEndStashItems),
      );
      card.appendChild(split);
    } else {
      const bodyLines = title === "Damage Report"
        ? state.raidEndDamageLines
        : title === "Raid Overview"
          ? state.raidEndOverviewLines
          : [subtitle];
      const pre = document.createElement("pre");
      pre.textContent = bodyLines.join("\n");
      pre.style.margin = "0";
      pre.style.whiteSpace = "pre-wrap";
      pre.style.lineHeight = "1.5";
      card.appendChild(pre);
    }

    this.raidEndScene.appendChild(card);
  }

  private createLootGrid(title: string, items: string[]): HTMLDivElement {
    const section = document.createElement("div");
    const heading = document.createElement("h3");
    heading.textContent = title;
    heading.style.margin = "0 0 8px 0";
    heading.style.fontSize = "14px";
    section.appendChild(heading);
    const grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(2, minmax(0, 1fr))";
    grid.style.gap = "8px";
    const itemList = items.length > 0 ? items : ["(empty)"];
    for (const item of itemList) {
      const cell = document.createElement("div");
      cell.textContent = item;
      cell.style.minHeight = "40px";
      cell.style.padding = "8px";
      cell.style.border = "1px solid rgba(148, 163, 184, 0.35)";
      cell.style.background = "rgba(15, 23, 42, 0.75)";
      grid.appendChild(cell);
    }
    section.appendChild(grid);
    return section;
  }
}
