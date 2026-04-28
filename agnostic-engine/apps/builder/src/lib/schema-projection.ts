import type { BuilderState, DraftSiteVersion } from './builder-state';
import {
  createBuilderStateFromDraft,
  createDraftPayloadFromBuilderState,
} from './builder-state';

export function projectDraftToBuilderState(draft: DraftSiteVersion): BuilderState {
  return createBuilderStateFromDraft(draft);
}

export function projectBuilderStateToDraftPayload(state: BuilderState): {
  schemaVersion: string;
  layout: Record<string, unknown>;
  pages: Record<string, unknown>;
} {
  return createDraftPayloadFromBuilderState(state);
}

