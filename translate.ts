import { Command, EnumType } from "cliffy/command/mod.ts";
import { ensureString } from "unknownutil/mod.ts";
import { filePath as configFilePath, getConfig } from "./_utils/config.ts";
import { assertProvider, getProvider, providers } from "./_utils/provider.ts";

const { options, args } = await new Command()
  .name("translate")
  .version("0.0.3")
  .description("translate")
  .type("provider", new EnumType(providers))
  .arguments("<text:string>")
  .helpOption(false)
  .option(
    "-p --provider <provider:provider>",
    "Translate provider.",
  )
  .option(
    "-* --* [...options:string]",
    "Translate options.",
    { hidden: true },
  )
  .command(
    "config",
    new Command()
      .description("Show config file path.")
      .action(() => {
        console.log(configFilePath);
        Deno.exit();
      }),
  )
  .parse(Deno.args);

const config = await getConfig();

const providerName = options.provider || config.defaultProvider;
assertProvider(providerName);

const text = args[0];
ensureString(text);

const provider = getProvider(providerName);
const providerConfig = Object.assign(
  config[providerName] || {},
  Object.fromEntries(
    Object.entries(await provider.parseOptions(Deno.args)).filter(([, v]) =>
      typeof v !== "undefined"
    ),
  ),
);

const translateResult = await provider.translate(text, providerConfig);
console.log(translateResult);
