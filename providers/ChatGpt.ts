import { Provider, TranslateError } from "./Provider.ts";
import { Command, EnumType } from "cliffy/command/mod.ts";
import { Configuration, OpenAIApi } from "openai";

const modelList = [
  "gpt-3.5-turbo",
  "gpt-4",
] as const;

export type Config = {
  token: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  model?: typeof modelList[number];
  systemMessage?: string;
};

export class ChatGpt extends Provider {
  public static readonly provider = "chatgpt";

  private getDefaultSystemMessage(
    source: string | undefined,
    target: string | undefined,
  ) {
    const setSource = typeof source !== "undefined" && source.length > 0;
    const setTarget = typeof target !== "undefined" && target.length > 0;
    if (setSource && setTarget) {
      return `Translate from ${source} to ${target}.`;
    }

    if (setSource && !setTarget) {
      return `Translate from ${source}`;
    }

    if (!setSource && setTarget) {
      return `Translate into ${target}`;
    }

    return "Translate.";
  }

  public async translate(
    text: string,
    config: Config,
  ) {
    const source = config.sourceLanguage;
    const target = config.targetLanguage;
    const system = config.systemMessage ||
      this.getDefaultSystemMessage(source, target);

    const model = config.model || "gpt-3.5-turbo";

    const openai = new OpenAIApi(new Configuration({ apiKey: config.token }));
    const completion = await openai.createChatCompletion({
      model,
      messages: [{
        role: "system",
        content: system,
      }, {
        role: "user",
        content: text,
      }],
    });

    return completion.data.choices.at(-1).message.content || "";
  }

  public async parseOptions(args: string[]): Promise<Partial<Config>> {
    const { options } = await new Command()
      .type("model", new EnumType(modelList))
      .arguments("[arg:string]")
      .option(
        "-* --* [...options:string]",
        "Translate options.",
        { hidden: true },
      )
      .option("--token <token:string>", "OpenAI API token.")
      .option(
        "--source-language <sourceLanguage:string>",
        "Source language.",
      )
      .option(
        "--target-language <targetLanguage:string>",
        "Target language.",
      )
      .option(
        "--system-message <systemMessage:string>",
        "System message.",
      )
      .option(
        "--model <model:model>",
        "Model.",
      )
      .parse(args);

    return {
      token: options.token,
      sourceLanguage: options.sourceLanguage,
      targetLanguage: options.targetLanguage,
      systemMessage: options.systemMessage,
      model: options.model,
    };
  }
}
