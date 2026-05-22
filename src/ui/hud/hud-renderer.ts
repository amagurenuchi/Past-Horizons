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
  private weaponPanel: HTMLDivElement | null = null;
  private summaryModal: HTMLDivElement | null = null;
  private mainMenuOverlay: HTMLDivElement | null = null;
  private stashButton: HTMLButtonElement | null = null;
  private startButton: HTMLButtonElement | null = null;
  private crosshair: HTMLDivElement | null = null;
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
    crosshair.innerHTML =
      '<div style="position:absolute;left:8px;top:0;width:2px;height:18px;background:#f8fafc;"></div>' +
      '<div style="position:absolute;left:0;top:8px;width:18px;height:2px;background:#f8fafc;"></div>';
    container.appendChild(crosshair);

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
    this.summaryModal = summaryModal;
    this.weaponPanel = weaponPanel;
    this.mainMenuOverlay = mainMenuOverlay;
    this.stashButton = stashButton;
    this.startButton = startButton;
    this.crosshair = crosshair;
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
      !this.promptEl
    ) {
      return;
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
      this.crosshair.style.display = state.inMainMenu ? "none" : "block";
    }
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
    this.summaryModal = null;
    this.weaponPanel = null;
    this.mainMenuOverlay = null;
    this.stashButton = null;
    this.startButton = null;
    this.crosshair = null;
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

    const showFailureSummary = state.sessionOutcome === "died" || state.sessionOutcome === "timeout";
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

    this.mainMenuOverlay.style.display = state.inMainMenu ? "block" : "none";
  }
}
