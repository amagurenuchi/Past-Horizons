export type SessionOutcome = "active" | "extracted" | "died" | "timeout";

export interface RaidSummary {
  outcome: SessionOutcome;
  lootMovedToStash: number;
  lootLostOnDeath: number;
  details: string[];
}

export class SessionManager {
  private readonly raidDurationSeconds = 20 * 60;
  private remainingSeconds = this.raidDurationSeconds;
  private outcome: SessionOutcome = "active";
  private summary: RaidSummary = { outcome: "active", lootMovedToStash: 0, lootLostOnDeath: 0, details: [] };
  private inMainMenu = true;

  update(deltaSeconds: number): void {
    if (this.outcome !== "active") {
      return;
    }

    this.remainingSeconds = Math.max(0, this.remainingSeconds - deltaSeconds);
    if (this.remainingSeconds <= 0) {
      this.endAsTimeout();
    }
  }

  getRemainingSeconds(): number {
    return this.remainingSeconds;
  }

  getOutcome(): SessionOutcome {
    return this.outcome;
  }

  getSummary(): RaidSummary {
    return this.summary;
  }

  isInMainMenu(): boolean {
    return this.inMainMenu;
  }

  startRaid(): void {
    this.inMainMenu = false;
    this.outcome = "active";
    this.remainingSeconds = this.raidDurationSeconds;
    this.summary = { outcome: "active", lootMovedToStash: 0, lootLostOnDeath: 0, details: [] };
  }

  endAsExtracted(lootMovedToStash: number): void {
    if (this.outcome !== "active") {
      return;
    }

    this.outcome = "extracted";
    this.summary = { outcome: "extracted", lootMovedToStash, lootLostOnDeath: 0, details: [] };
    this.inMainMenu = true;
  }

  endAsDeath(lootLostOnDeath: number, details: string[]): void {
    if (this.outcome !== "active") {
      return;
    }

    this.outcome = "died";
    this.summary = { outcome: "died", lootMovedToStash: 0, lootLostOnDeath, details };
    this.inMainMenu = true;
  }

  setFailureDetails(details: string[]): void {
    if (this.outcome !== "died" && this.outcome !== "timeout") {
      return;
    }

    this.summary = { ...this.summary, details };
  }

  private endAsTimeout(): void {
    this.outcome = "timeout";
    this.summary = { outcome: "timeout", lootMovedToStash: 0, lootLostOnDeath: 0, details: [] };
    this.inMainMenu = true;
  }
}
