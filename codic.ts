import { Command } from "cliffy/command/mod.ts";
import Codic, { RequestGetEngineTranslate } from "./_utils/codic.ts";
import { config } from "./_utils/config.ts";

const translate = async (req: RequestGetEngineTranslate) => {
  try {
    if (!req.casing) {
      req.casing = config.casing || "camel";
    }
    const codic = new Codic(config.token);
    const result = await codic.translate(req);
    console.log(result[0]?.translated_text || "");
  } catch (e) {
    console.error(e);
  }
};

await new Command()
  .name("codic")
  .version("0.0.1")
  .description("codic")
  .command(
    "translate",
    new Command()
      .description("translate.")
      .arguments("<text:string>")
      .option(
        "-c --casing <'camel'|'pascal'|'lower_underscore'|'upper_underscore'|'hyphen'>",
        "Casing.",
      )
      .action((
        options: {
          casing?: string;
        },
        text: string,
      ) => {
        translate({
          text,
          casing: options.casing?.replace(
            /\_/g,
            " ",
          ) as RequestGetEngineTranslate["casing"],
        });
      }),
  )
  .parse(Deno.args);
