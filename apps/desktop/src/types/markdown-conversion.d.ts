declare module "turndown" {
  export type TurndownOptions = {
    bulletListMarker?: "-" | "*" | "+";
    codeBlockStyle?: "indented" | "fenced";
    emDelimiter?: "_" | "*";
    headingStyle?: "setext" | "atx";
    hr?: string;
  };

  export default class TurndownService {
    constructor(options?: TurndownOptions);
    turndown(input: string): string;
    use(plugin: unknown): void;
  }
}

declare module "turndown-plugin-gfm" {
  export const gfm: unknown;
}
