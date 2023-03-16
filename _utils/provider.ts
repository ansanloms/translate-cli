import { Provider } from "../providers/Provider.ts";
import { Codic } from "../providers/Codic.ts";
import { ChatGpt } from "../providers/ChatGpt.ts";

export const providers = [Codic.provider, ChatGpt.provider] as const;

export function assertProvider(
  x: unknown,
): asserts x is typeof providers[number] {
  if (typeof x !== "string") {
    throw new Error("Invalid provider.");
  }

  if (!providers.includes(x as typeof providers[number])) {
    throw new Error("Invalid provider.");
  }
}

export const getProvider = (
  providerName: typeof providers[number],
): Provider => {
  switch (providerName) {
    case Codic.provider: {
      return new Codic();
    }

    case ChatGpt.provider: {
      return new ChatGpt();
    }
  }

  throw new Error("Invalid provider.");
};
