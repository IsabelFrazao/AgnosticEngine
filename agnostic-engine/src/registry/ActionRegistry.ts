export type ActionHandler = () => void;

export type RegisteredAction = {
  id:      string;
  label:   string; // human-readable description for auditing
  handler: ActionHandler;
};

class ActionRegistryClass {
  private readonly actions = new Map<string, RegisteredAction>();

  register(action: RegisteredAction): void {
    if (this.actions.has(action.id)) {
      throw new Error(`ActionRegistry: action "${action.id}" is already registered.`);
    }
    this.actions.set(action.id, action);
  }

  resolve(actionId: string): ActionHandler | null {
    return this.actions.get(actionId)?.handler ?? null;
  }

  has(actionId: string): boolean {
    return this.actions.has(actionId);
  }
}

// Singleton — one registry per application process.
export const ActionRegistry = new ActionRegistryClass();
