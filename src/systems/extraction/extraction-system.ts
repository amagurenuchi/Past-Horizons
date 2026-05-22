export interface ExtractionZone {
  id: string;
  x: number;
  y: number;
  radius: number;
}

export interface ExtractionState {
  activeZoneId: string | null;
  progressSeconds: number;
  requiredSeconds: number;
  completed: boolean;
}

export class ExtractionSystem {
  private readonly zones: ExtractionZone[] = [
    { id: "exfil-east", x: 10, y: 0, radius: 1.5 },
    { id: "exfil-west", x: -10, y: 0, radius: 1.5 },
    { id: "exfil-north", x: 0, y: 10, radius: 1.5 },
  ];
  private readonly requiredSeconds = 10;
  private state: ExtractionState = {
    activeZoneId: null,
    progressSeconds: 0,
    requiredSeconds: this.requiredSeconds,
    completed: false,
  };

  update(player: { x: number; y: number }, deltaSeconds: number): ExtractionState {
    if (this.state.completed) {
      return this.state;
    }

    const activeZone = this.findZone(player);
    if (!activeZone) {
      this.state = {
        activeZoneId: null,
        progressSeconds: 0,
        requiredSeconds: this.requiredSeconds,
        completed: false,
      };
      return this.state;
    }

    this.state = {
      activeZoneId: activeZone.id,
      progressSeconds: Math.min(this.state.progressSeconds + deltaSeconds, this.requiredSeconds),
      requiredSeconds: this.requiredSeconds,
      completed: this.state.progressSeconds + deltaSeconds >= this.requiredSeconds,
    };

    return this.state;
  }

  getZones(): ExtractionZone[] {
    return this.zones;
  }

  getState(): ExtractionState {
    return this.state;
  }

  reset(): void {
    this.state = {
      activeZoneId: null,
      progressSeconds: 0,
      requiredSeconds: this.requiredSeconds,
      completed: false,
    };
  }

  private findZone(player: { x: number; y: number }): ExtractionZone | null {
    for (const zone of this.zones) {
      const distance = Math.hypot(player.x - zone.x, player.y - zone.y);
      if (distance <= zone.radius) {
        return zone;
      }
    }

    return null;
  }
}
