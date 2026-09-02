import { AttemptState } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

/**
 * Valid state transitions:
 * NOT_STARTED -> READY -> IN_PROGRESS -> SUBMITTED -> EVALUATED
 * IN_PROGRESS <-> PAUSED
 * Direct submission from IN_PROGRESS or PAUSED
 */
const VALID_TRANSITIONS: Record<AttemptState, AttemptState[]> = {
  NOT_STARTED: [AttemptState.READY, AttemptState.IN_PROGRESS],
  READY: [AttemptState.IN_PROGRESS],
  IN_PROGRESS: [AttemptState.PAUSED, AttemptState.SUBMITTED],
  PAUSED: [AttemptState.IN_PROGRESS, AttemptState.SUBMITTED],
  SUBMITTED: [AttemptState.EVALUATED],
  EVALUATED: [], // Terminal state
};

export class ExamStateMachine {
  static canTransition(from: AttemptState, to: AttemptState): boolean {
    const allowed = VALID_TRANSITIONS[from];
    return allowed ? allowed.includes(to) : false;
  }

  static validateTransition(from: AttemptState, to: AttemptState): void {
    if (!this.canTransition(from, to)) {
      throw new AppError(
        400,
        `Invalid attempt state transition from ${from} to ${to}`
      );
    }
  }

  static isTerminal(state: AttemptState): boolean {
    return state === AttemptState.SUBMITTED || state === AttemptState.EVALUATED;
  }

  static isActionable(state: AttemptState): boolean {
    return state === AttemptState.IN_PROGRESS;
  }
}
