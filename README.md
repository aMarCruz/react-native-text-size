# React Native Text Size

Measure text width and height without laying it out.

[![npm Version][npm-image]][npm-url]
[![License][license-image]][license-url]

## Installation

### Automatic installation

`$ yarn add react-native-text-size`

`$ react-native link react-native-text-size`

### Manual installation

#### iOS

1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `react-native-text-size` and add `RNMeasureText.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libRNMeasureText.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<

#### Android

1. Open up `android/app/src/main/java/[...]/MainActivity.java`
  - Add `import io.github.amarcruz.RNMeasureTextPackage;` to the imports at the top of the file
  - Add `new RNMeasureTextPackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
  	```
  	include ':react-native-text-size'
  	project(':react-native-text-size').projectDir = new File(rootProject.projectDir, 	'../node_modules/react-native-text-size/android')
  	```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
  	```
      compile project(':react-native-text-size')
  	```

## Syntax

```js
 TextSize.measure({
   text: string,
   fontSize: number,
   fontFamily?: string,
   width?: number
}) => {
  width: number,
  height: number,
  lineCount: number,
  lastLineMax: number
}
```

## Example

```js
import MeasureText from 'react-native-text-size';

const text = 'This is an example';
const width = 100;
const fontSize = 16;
const fontFamily = 'Roboto';

class Test extends Component {
  state = {
    width: 0,
    height: 0,
  }
  async componentDidMount() {
    const size = await MeasureText.measure({
      text,       // texts to measure
      width,      // container width
      fontSize,
      fontFamily
    });
    this.setState({
      width: size.width,
      height: size.height
    });
  }
  render() {
    const { width, height } = this.state;
    return (
      <View>
        <Text style={{ width, height, fontSize, fontFamily }}>
          {text}
        </Text>
      </View>
    );
  }
}
```

## License

The [MIT License](LICENCE) (MIT)

Copyright (c) 2017 Alberto Martínez (https://github.com/aMarCruz)

[npm-image]:      https://img.shields.io/npm/v/react-native-text-size.svg
[npm-url]:        https://www.npmjs.com/package/react-native-text-size
[license-image]:  https://img.shields.io/npm/l/express.svg
[license-url]:    https://github.com/aMarCruz/jscc-brunch/blob/master/LICENSE
