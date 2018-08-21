/*
  Warn if previous rn-text-size is installed.
*/
/* eslint-env node */
/* eslint no-console:0 */
const fs = require('fs')

const pathToTS = './node_modules/react-native-text-size/package.json'

//if (fs.existsSync(pathToTS)) {
  let version = '1.0'
  try {
    version = require(pathToTS).version
  } catch (_) {
    // ignore
  }
  if (version && version.substr(0, 2) === '1.') {
    console.error('\nPlease remove the previous version of react-native-text-size before install the new one.\n')
    process.exit(1)
  }
//}
