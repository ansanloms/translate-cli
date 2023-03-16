import { Provider, TranslateError } from "./Provider.ts";
import { Command, EnumType } from "cliffy/command/mod.ts";

const casingList = [
  "camel",
  "pascal",
  "lower underscore",
  "upper underscore",
  "hyphen",
] as const;

const acronymStyleList = [
  "MS naming guidelines",
  "camel strict",
  "literal",
] as const;

/**
 * @see https://codic.jp/docs/api/engine/translate
 */
type RequestGetEngineTranslate = {
  /**
   * 変換する文字列(日本語)を設定します。
   * 文字列を改行(LF)で区切ることで、一度にまとめて変換することもできます(最大 3 件まで)。
   */
  text: string;

  /**
   * 変換で使用するプロジェクト(辞書)の id を指定します。
   * これは、自分がアクセス可能なプロジェクトである必要があります。
   * アクセス可能なプロジェクトの id を取得するには、プロジェクト一覧を使用します。指定がない場合は、システム辞書が使われます。
   */
  project_id?: string;

  /**
   * camel, pascal, lower underscore, upper underscore, hyphen のいずれかを指定します。
   * デフォルトは、ケースの変換は行いません(登録された単語のスペース区切りになります)。
   */
  casing?: typeof casingList[number];

  /**
   * パラメータ casing に、 camel, pascal のいずれかを指定した場合の頭字語(例: SOA)の処理方法を指定します。
   * MS naming guidelines, camel strict, literal のいずれかを指定します。
   * それぞれの違いについては、ヘルプの頭字語オプションを参照してください。
   */
  acronym_style?: typeof acronymStyleList[number];
};

/**
 * @see https://codic.jp/docs/api/engine/translate
 */
type ResponseGetEngineTranslate = {
  /**
   * 翻訳が成功したかどうか。
   */
  successful: boolean;

  /**
   * 翻訳基のテキスト。
   */
  text: string;

  /**
   * 翻訳したテキスト。
   */
  translated_text: string;

  words: {
    successful: boolean;
    text: string;
    translated_text: string;
    candidates: {
      text: string;
    }[];
  }[];
}[];

/**
 * @see https://codic.jp/docs/api#response-code
 */
type ResponseError = {
  errors: {
    code: number;
    message: string;
    context: string | null;
  }[];
};

export type Config = {
  token: string;
  projectId?: RequestGetEngineTranslate["project_id"];
  casing?: RequestGetEngineTranslate["casing"];
  acronymStyle?: RequestGetEngineTranslate["acronym_style"];
};

export class Codic extends Provider {
  public static readonly provider = "codic";

  private static readonly url = "https://api.codic.jp";

  private async request<
    Req extends RequestGetEngineTranslate,
    Res extends ResponseGetEngineTranslate,
  >(
    token: string,
    endpoint: string,
    method: "get",
    request: Req,
  ): Promise<Res | ResponseError> {
    const url = new URL(Codic.url);
    url.pathname = endpoint;

    if (method === "get") {
      const setParams = (o: object) => {
        Object.entries(o).forEach(([k, v]) => {
          if (v !== null && typeof v === "object") {
            setParams(v);
          } else {
            url.searchParams.append(k, v);
          }
        });
      };

      setParams(request);
    }

    const response = await fetch(url.toString(), {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await response.json();

    if (response.ok) {
      return json as Res;
    } else {
      return json as ResponseError;
    }
  }

  private isResponseError(x: unknown): x is ResponseError {
    return typeof x === "object" && x !== null && "errors" in x;
  }

  public async translate(
    text: string,
    config: Config,
  ) {
    const request: RequestGetEngineTranslate = { text };
    if (config.projectId) {
      request.project_id = config.projectId;
    }
    if (config.casing) {
      request.casing = config.casing;
    }
    if (config.acronymStyle) {
      request.acronym_style = config.acronymStyle;
    }

    const response = await this.request<
      RequestGetEngineTranslate,
      ResponseGetEngineTranslate
    >(
      config.token,
      "/v1/engine/translate.json",
      "get",
      request,
    );

    if (this.isResponseError(response)) {
      throw new TranslateError(
        response.errors.map((v) => `${v.code}: ${v.message}`).join(" / "),
      );
    }

    return response.map((v) => v.translated_text).join("\n");
  }

  public async parseOptions(args: string[]): Promise<Partial<Config>> {
    const { options } = await new Command()
      .type("casing", new EnumType(casingList))
      .type("acronymStyle", new EnumType(acronymStyleList))
      .arguments("[arg:string]")
      .option(
        "-* --* [...options:string]",
        "Translate options.",
        { hidden: true },
      )
      .option("--token <token:string>", "Codic API token.")
      .option(
        "--project-id <projectId:string>",
        "Codic Project(Dictionary) ID.",
      )
      .option(
        "--casing <casing:casing>",
        "Casing.",
      )
      .option(
        "--acronym-style <acronymStyle:acronymStyle>",
        "Acronym style.",
      )
      .parse(args);

    return {
      token: options.token,
      projectId: options.projectId,
      casing: options.casing,
      acronymStyle: options.acronymStyle,
    };
  }
}
