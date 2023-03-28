import { Provider, TranslateError } from "./Provider.ts";
import { Command, EnumType } from "cliffy/command/mod.ts";

const sourceLangList = [
  "BG",
  "CS",
  "DA",
  "DE",
  "EL",
  "EN",
  "ES",
  "ET",
  "FI",
  "FR",
  "HU",
  "ID",
  "IT",
  "JA",
  "KO",
  "LT",
  "LV",
  "NB",
  "NL",
  "PL",
  "PT",
  "RO",
  "RU",
  "SK",
  "SL",
  "SV",
  "TR",
  "UK",
  "ZH",
] as const;

const targetLangList = [
  "BG",
  "CS",
  "DA",
  "DE",
  "EL",
  "EN",
  "EN-GB",
  "EN-US",
  "ES",
  "ET",
  "FI",
  "FR",
  "HU",
  "ID",
  "IT",
  "JA",
  "KO",
  "LT",
  "LV",
  "NB",
  "NL",
  "PL",
  "PT",
  "PT-BR",
  "PT-PT",
  "RO",
  "RU",
  "SK",
  "SL",
  "SV",
  "TR",
  "UK",
  "ZH",
] as const;

/**
 * 翻訳するテキストの言語。
 *
 * BG: ブルガリア語
 * CS: チェコ語
 * DA: デンマーク語
 * DE: ドイツ人
 * EL: ギリシャ語
 * EN: 英語
 * ES: スペイン語
 * ET: エストニア語
 * FI: フィンランド語
 * FR: フランス語
 * HU: ハンガリー語
 * ID: インドネシア語
 * IT: イタリアの
 * JA: 日本
 * KO: 韓国語
 * LT: リトアニア語
 * LV: ラトビア語
 * NB: ノルウェー語 (ブークモール)
 * NL: オランダの
 * PL: ポーランド語
 * PT: ポルトガル語 (すべてのポルトガル語の混合)
 * RO: ルーマニア語
 * RU: ロシア語
 * SK: スロバキア語
 * SL: スロベニア語
 * SV: スウェーデンの
 * TR: トルコ語
 * UK: ウクライナ語
 * ZH: 中国語
 */
type SourceLang = typeof sourceLangList[number];

/**
 * 翻訳する言語。
 *
 * BG: ブルガリア語
 * CS: チェコ語
 * DA: デンマーク語
 * DE: ドイツ人
 * EL: ギリシャ語
 * EN: 英語 (後方互換性の為に残してある)
 * EN-GB: 英語 (イギリス)
 * EN-US: 英語 (アメリカ)
 * ES: スペイン語
 * ET: エストニア語
 * FI: フィンランド語
 * FR: フランス語
 * HU: ハンガリー語
 * ID: インドネシア語
 * IT: イタリアの
 * JA: 日本
 * KO: 韓国語
 * LT: リトアニア語
 * LV: ラトビア語
 * NB: ノルウェー語 (ブークモール)
 * NL: オランダの
 * PL: ポーランド語
 * PT: ポルトガル語 (後方互換性の為に残してある)
 * PT-BR: ポルトガル語 (ブラジル)
 * PT-PT: ポルトガル語 (ブラジルのポルトガル語を除くすべてのポルトガル語の品種)
 * RO: ルーマニア語
 * RU: ロシア語
 * SK: スロバキア語
 * SL: スロベニア語
 * SV: スウェーデンの
 * TR: トルコ語
 * UK: ウクライナ語
 * ZH: 中国語 (簡体字)
 */
type TargetLang = typeof targetLangList[number];

/**
 * @see https://www.deepl.com/ja/docs-api/translate-text/translate-text/
 */
type RequestPostTranslate = {
  /**
   * 翻訳するテキスト。
   */
  text: string;

  /**
   * 翻訳するテキストの言語。省略時はテキストの言語を検出して翻訳する。
   */
  source_lang?: SourceLang;

  /**
   * 翻訳する言語。
   */
  target_lang: TargetLang;

  /**
   * 翻訳エンジンが最初に入力をセンテンスに分割するかどうか。
   */
  split_sentences?: "0" | "1" | "nonewlines";

  /**
   * 翻訳エンジンが元の書式を尊重するかどうか。
   */
  preserve_formatting?: "0" | "1";

  /**
   * 翻訳されたテキストがフォーマルな表現に傾くか、インフォーマルな表現に傾くか。
   */
  formality?: "default" | "more" | "less" | "prefer_more" | "prefer_less";

  /**
   * 翻訳に使用する用語集を指定する。
   */
  glossary_id?: string;

  /**
   * どのようなタグを扱うか。
   */
  tag_handling?: string;

  /**
   * 文章を分割しない XML タグをカンマ区切りで列挙する。
   */
  non_splitting_tags?: string;

  /**
   * XML 構造の自動検出についての設定。
   */
  outline_detection?: string;

  /**
   * 常に分割を引き起こす XML タグをカンマ区切りで列挙する。
   */
  splitting_tags?: string;

  /**
   * 翻訳しないテキストを示すXMLタグをカンマ区切りで列挙する。
   */
  ignore_tags?: string;
};

/**
 * @see https://www.deepl.com/ja/docs-api/translate-text/translate-text/
 */
type ResponsePostTranslate = {
  translations: {
    /**
     * 翻訳元の言語。
     */
    detected_source_language: boolean;

    /**
     * 翻訳したテキスト。
     */
    text: string;
  }[];
};

export type Config = {
  token: string;
  sourceLang?: SourceLang;
  targetLang: TargetLang;
};

export class DeepL extends Provider {
  public static readonly provider = "deepl";

  private static readonly url = "https://api-free.deepl.com";

  private async request<
    Req extends RequestPostTranslate,
    Res extends ResponsePostTranslate,
  >(
    token: string,
    endpoint: string,
    method: "post",
    request: Req,
  ): Promise<Res> {
    const url = new URL(DeepL.url);
    url.pathname = endpoint;

    const body = new FormData();
    if (method === "post") {
      Object.entries(request).forEach(([k, v]) => {
        if (Array.isArray(v)) {
          v.forEach((v2) => body.set(`${k}[]`, v2));
        } else {
          body.set(k, v);
        }
      });
    }

    const response = await fetch(url.toString(), {
      method,
      headers: {
        Authorization: `DeepL-Auth-Key ${token}`,
      },
      body,
    });

    const json = await response.json();

    if (response.ok) {
      return json as Res;
    } else {
      throw new Error(json);
    }
  }

  public async translate(
    text: string,
    config: Config,
  ) {
    const request: RequestPostTranslate = { text, target_lang: "EN-US" };
    if (config.sourceLang) {
      request.source_lang = config.sourceLang;
    }
    if (config.targetLang) {
      request.target_lang = config.targetLang;
    }

    try {
      const response = await this.request<
        RequestPostTranslate,
        ResponsePostTranslate
      >(
        config.token,
        "/v2/translate",
        "post",
        request,
      );

      return response.translations.map((v) => v.text).join("\n");
    } catch (e) {
      throw new TranslateError(e.toString());
    }
  }

  public async parseOptions(args: string[]): Promise<Partial<Config>> {
    const { options } = await new Command()
      .type("sourceLang", new EnumType(sourceLangList))
      .type("targetLang", new EnumType(targetLangList))
      .arguments("[arg:string]")
      .option(
        "-* --* [...options:string]",
        "Translate options.",
        { hidden: true },
      )
      .option("--token <token:string>", "DeepL API token.")
      .option(
        "-s --source-lang <sourceLang:sourceLang>",
        "Language of the text to be translated. ",
      )
      .option(
        "-t --target-lang <targetLang:targetLang>",
        "language into which the text should be translated.",
      )
      .parse(args);

    return {
      token: options.token,
      sourceLang: options.sourceLang,
      targetLang: options.targetLang,
    };
  }
}
