import "server-only";
import type { ToggleResult } from "../../../components/portal/TickList";
import type { ClientPrincipal } from "../data/dto";
import type { forClient } from "../data/client";

export type ClientActionDeps = {
  requireClient: () => Promise<ClientPrincipal>;
  dal: (p: ClientPrincipal) => ReturnType<typeof forClient>;
};

/** Thin: prove who is calling, then call the data layer, then turn refusals into messages. */
export function createClientActions(deps: ClientActionDeps) {
  return {
    async toggleItem(itemId: unknown, done: unknown): Promise<ToggleResult> {
      const principal = await deps.requireClient();
      if (typeof itemId !== "string" || typeof done !== "boolean") {
        return { ok: false, message: "That request was not understood. Refresh the page." };
      }
      const item = await deps.dal(principal).setItemDone(itemId, done);
      if (item === null) {
        return { ok: false, message: "That item is not available any more. Refresh the page." };
      }
      return { ok: true };
    },
  };
}
