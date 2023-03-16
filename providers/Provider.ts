export abstract class Provider {
  public static readonly provider: string;

  public constructor() {
  }

  public abstract translate(
    text: string,
    config?: Record<string, unknown>,
  ): Promise<string>;

  public abstract parseOptions(
    args: string[],
  ): Promise<Record<string, unknown>>;
}

export class TranslateError extends Error {
}
