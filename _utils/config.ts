import { join } from "std/path/mod.ts";
import { RequestGetEngineTranslate } from "./codic.ts";

const ConfigFileName = "codic.json";

type ConfigType = {
  token: string;
  casing?: RequestGetEngineTranslate["casing"];
};

const configDir = () => {
  const xdg = Deno.env.get("XDG_CONFIG_HOME");
  if (xdg) {
    return xdg;
  }

  const home =
    Deno.env.get(Deno.build.os === "windows" ? "HOMEPATH" : "HOME") || "";

  return join(home, ".config");
};

export const config = JSON.parse(
  await Deno.readTextFile(join(configDir(), ConfigFileName)),
) as ConfigType;
