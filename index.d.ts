declare module "react-native-text-size" {

  interface TextSizeParams {
    text: string;
    fontSize: number;
    fontFamily?: string;
    width?: number;
  }

  export type TextSizeResult = {
    width: number,
    height: number,
    lineCount: number,
    lastLineWidth: number,
  }

  interface TextSizeStatic {
    measure: (params: TextSizeParams) => Promise<TextSizeResult>;
  }

  const TextSize: TextSizeStatic;

  export default TextSize;
}
