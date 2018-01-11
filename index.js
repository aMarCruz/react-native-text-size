var react = require('react-native');
var Dimensions = react.Dimensions;
var RNMeasureText = react.NativeModules.RNMeasureText;

/**
 * Get width, height, lineCount, and lastLineWidth values for text.
 *
 * @param {object} params - Info
 */
exports.measure = function measure (params) {

  var fontSize = params && params.fontSize

  if (typeof fontSize !== 'number') {
    return Promise.reject(new Error('missing required \'fontSize\' property'));
  }

  var fontScale = Dimensions.get('window').fontScale || 1;

  if (fontScale !== 1) {
    params = Object.assign(
      {},
      params,
      { fontSize: fontSize * fontScale }
    );
  }

  return RNMeasureText.measure(params);
}
