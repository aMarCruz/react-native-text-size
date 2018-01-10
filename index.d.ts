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
    lastLineMax: number,
  }

  const TextSize: {
    measure: (params: TextSizeParams) => Promise<TextSizeResult>
  };

  export default TextSize;
}
