type ResponseError = {
  errors: {
    code: number;
    message: string;
    context: string | null;
  }[];
};

export type RequestGetEngineTranslate = {
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
  casing?:
    | "camel"
    | "pascal"
    | "lower underscore"
    | "upper underscore"
    | "hyphen";

  /**
   * パラメータ casing に、 camel, pascal のいずれかを指定した場合の頭字語(例: SOA)の処理方法を指定します。
   * MS naming guidelines, camel strict, literal のいずれかを指定します。
   * それぞれの違いについては、ヘルプの頭字語オプションを参照してください。
   */
  acronym_style?: "MS naming guidelines" | "camel strict" | "literal";
};

export type ResponseGetEngineTranslate = {
  successful: boolean;
  text: string;
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

export class CodicError extends Error {
  constructor(response: ResponseError, e?: string) {
    super(
      e || response.errors.map((v) => `${v.code}: ${v.message}`).join(" / "),
    );
  }
}

export default class Codic {
  /**
   * url
   */
  static readonly url: string = "https://api.codic.jp";

  /**
   * access token
   */
  token: string;

  /**
   * @param {string} token
   */
  public constructor(token: string) {
    this.token = token;
  }

  private async request<
    Req extends RequestGetEngineTranslate,
    Res extends ResponseGetEngineTranslate,
  >(
    endpoint: string,
    method: "get",
    request: Req,
  ): Promise<Res> {
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
        Authorization: `Bearer ${this.token}`,
      },
    });

    const json = await response.json();

    if (!response.ok) {
      throw new CodicError(json as ResponseError);
    }

    return json as Res;
  }

  public async translate(
    request: RequestGetEngineTranslate,
  ): Promise<ResponseGetEngineTranslate> {
    return await this.request<
      RequestGetEngineTranslate,
      ResponseGetEngineTranslate
    >(
      "/v1/engine/translate.json",
      "get",
      request,
    );
  }
}
