declare module "react-native-text-size" {

  export type TSFontWeight = 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
  export type TSFontStyle = 'normal' | 'italic'
  export type TSFontVariant = 'small-caps' | 'oldstyle-nums' | 'lining-nums' | 'tabular-nums' | 'proportional-nums'
  export type TSTextBreakStrategy = 'simple' | 'highQuality' | 'balanced'

  export type TSFontSize = {
    readonly default: number,
    readonly button: number,
    readonly label: number,
    readonly smallSystem: number,
    readonly system: number,
  }

  // export type TSMDStyleSpec =
  // | 'h1'
  // | 'h2'
  // | 'h3'
  // | 'h4'
  // | 'h5'

  export type TSTextStyle =
  | 'body'
  | 'callout'
  | 'caption1'
  | 'caption2'
  | 'footnote'
  | 'headline'
  | 'subheadline'
  | 'title1'
  | 'title2'
  | 'title3'

  export type TSFontInfo = {
    fontFamily: string | null,
    fontName: string | null,
    fontWeight: TSFontWeight,
    fontSize: number,
    fontStyle: TSFontStyle,
    fontVariant?: TSFontVariant | null,
    ascender: number,
    descender: number,
    capHeight?: number,
    xHeight?: number,
    top?: number,
    bottom?: number,
    leading: number,
    lineHeight: number,
    _hash: number,
  }

  export interface TSFontSpecs {
    fontFamily?: string;
    fontSize?: number;
    fontStyle?: TSFontStyle;
    fontWeight?: TSFontWeight;
    /** @platform ios */
    fontVariant?: Array<TSFontVariant>;
    allowFontScaling?: boolean;
    letterSpacing?: number;
    /** @platform android */
    includeFontPadding?: boolean;
    /** @platform android (SDK 23+) */
    textBreakStrategy?: TSTextBreakStrategy;
  }

  export interface TSMeasureParams extends TSFontSpecs {
    /** The required text to measure. */
    text: string;
    /** Maximum width of the area to display the text. @default MAX_INT */
    width?: number;
    /** @default true */
    allowFontScaling?: boolean;
  }

  export type TSMeasureResult = {
    width: number,
    height: number,
    lastLineWidth: number,
    lineCount: number,
  }

  interface TextSizeStatic {
    readonly FontSize: TSFontSize;

    measure(params: TSMeasureParams): Promise<TSMeasureResult>;
    specsForTextStyles(): Promise<{ [key: string]: TSFontSpecs }>;
    fontFromSpecs(specs?: TSFontSpecs): Promise<TSFontInfo>;
    fontFamilyNames(): Promise<string[]>;
    fontNamesForFamilyName(fontFamily: string): Promise<string[]>;
  }

  const TextSize: TextSizeStatic;
  export default TextSize;
}
