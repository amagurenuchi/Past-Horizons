import type { ITimerService } from "./services";

export class HighResolutionTimer implements ITimerService {
  now(): number {
    return performance.now();
  }
}
