import { Dimensions, NativeModules } from 'react-native';

const RNMeasureText = NativeModules.RNMeasureText;

const windowDims = Dimensions.get('window')

/**
 * Get width, height, lineCount, and lastLineWidth values for text.
 *
 * @param {object} params - Info
 */
function measure (params) {

  const fontSize = params && params.fontSize

  if (typeof fontSize !== 'number') {
    return Promise.reject(new Error('missing required \'fontSize\' property'));
  }

  const fontScale = windowDims.fontScale || 1;

  if (fontScale !== 1) {
    params = Object.assign(
      {},
      params,
      { fontSize: fontSize * fontScale }
    );
  }

  return RNMeasureText.measure(params);
}

export default {
  measure: measure,
}
