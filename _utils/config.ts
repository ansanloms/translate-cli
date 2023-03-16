import xdg from "xdg_portable/src/mod.deno.ts";
import * as path from "std/path/mod.ts";
import * as fs from "std/fs/mod.ts";

import { providers } from "./provider.ts";
import { Codic, Config as CodicConfig } from "../providers/Codic.ts";
import { ChatGpt, Config as ChatGptConfig } from "../providers/ChatGpt.ts";

export const filePath = path.join(
  xdg.config(),
  "translate",
  "config.json",
);

type Config = {
  defaultProvider?: typeof providers[number];
  [Codic.provider]?: CodicConfig;
  [ChatGpt.provider]?: ChatGptConfig;
};

export const getConfig = async () => {
  try {
    await Deno.stat(filePath);
  } catch (e) {
    fs.ensureDir(path.dirname(filePath));
    await Deno.writeTextFile(filePath, "{}");
  }

  return JSON.parse(await Deno.readTextFile(filePath)) as Config;
};
