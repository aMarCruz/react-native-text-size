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

  export type TSMDStyleSpec =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'
  | 'button'
  | 'caption'
  | 'overline'

  export type TSTextStyle =
  | 'body'
  | 'callout'
  | 'caption1'
  | 'caption2'
  | 'footnote'
  | 'headline'
  | 'subheadline'
  | 'largeTitle'
  | 'title1'
  | 'title2'
  | 'title3'

  export type TSFontInfo = {
    fontFamily: string | null,
    fontName?: string | null,
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
    /** iOS all, Android SDK 21+ with RN 0.55+ */
    letterSpacing?: number;
    /** @platform android */
    includeFontPadding?: boolean;
    /** @platform android (SDK 23+) */
    textBreakStrategy?: TSTextBreakStrategy;
  }

  export type TSFontForStyle = {
    fontFamily: string,
    /** Unscaled font size, untits are SP in Android, points in iOS */
    fontSize: number,
    /** fontStyle is omitted if it is "normal" */
    fontStyle?: TSFontStyle,
    /** fontWeight is omitted if it is "normal" */
    fontWeight?: TSFontWeight,
    /** @platform ios */
    fontVariant?: Array<TSFontVariant> | null,
    /** iOS all, Android SDK 21+ with RN 0.55+ */
    letterSpacing?: number,
  }

  export interface TSHeightsParams extends TSFontSpecs {
    /** The required text to measure. */
    text: Array<string | null>;
    /** Maximum width of the area to display the text. @default MAX_INT */
    width?: number;
    /** @default true */
    allowFontScaling?: boolean;
  }

  export interface TSMeasureParams extends TSFontSpecs {
    /** The required text to measure. */
    text: string;
    /** Maximum width of the area to display the text. @default MAX_INT */
    width?: number;
    /** @default true */
    allowFontScaling?: boolean;
    /** Request an exact width calculation. For Android, iOS always do this. */
    usePreciseWidth?: boolean;
  }

  export type TSMeasureResult = {
    width: number,
    height: number,
    lastLineWidth?: number,
    lineCount: number,
  }

  interface TextSizeStatic {
    measure(params: TSMeasureParams): Promise<TSMeasureResult>;
    flatHeights(params: TSHeightsParams): Promise<number[]>;
    specsForTextStyles(): Promise<{ [key: string]: TSFontForStyle }>;
    fontFromSpecs(specs?: TSFontSpecs): Promise<TSFontInfo>;
    fontFamilyNames(): Promise<string[]>;
  }

  const TextSize: TextSizeStatic;
  export default TextSize;
}
