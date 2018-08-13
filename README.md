# React Native Text Size

[![npm Version][npm-image]][npm-url]
[![License][license-image]][license-url]

Measure text accurately before rendering and get font information from your App (Android and iOS).

---
**IMPORTANT:**

_react-native-text-size v2.0 is a complete refactoring, before using it, please uninstall the previous version._

This is WIP, I am working on the normalization and documentation of additional functions.

---

If this library has helped you, please support my work with a star or [a coffee](https://www.buymeacoffee.com/aMarCruz).

## Automatic installation

```bash
$ yarn add react-native-text-size
$ react-native link react-native-text-size
```

## Manual installation

#### iOS

1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `react-native-text-size` and add `RNTextSize.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libRNMeasureText.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<

#### Android

1. Open up `android/app/src/main/java/[...]/MainActivity.java`
  - Add `import com.github.amarcruz.rntextsize.RNTextSizePackage;` to the imports at the top of the file
  - Add `new RNTextSizePackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
  	```groovy
  	include ':react-native-text-size'
  	project(':react-native-text-size').projectDir = new File(rootProject.projectDir, 	'../node_modules/react-native-text-size/android')
  	```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
  	```groovy
      compile project(':react-native-text-size')
  	```

## API Methods

### `measure`

```js
measure(options: TSMeasureParams): Promise<TSMeasureResult>
```

This function measures the text like RN does when the text does not have embedded images or text with different sizes. It take a subset of the properties used by [`<Text>`](https://facebook.github.io/react-native/docs/text) to describe the font to use.

If you provide the `width`, the measurement will apply the restriction and take into account the automatic line breaks, in addition to the explicit ones.

<a name="tsmeasureparams"></a>**TSMeasureParams**

Plain JS object with the text to measure, the maximum width, and properties like ones in the react-native [Text](https://facebook.github.io/react-native/docs/text) component.

Property | Type    | Default  | Notes
-------- | ------- | -------- | ------
text     | string  | (none)   | This is the only required property and can't be `null`. If this is an empty string the resulting `width` will be zero.
width    | number  | Infinity | Restrict the width. The resulting height will vary depending on the automatic flow of the text.
fontFamily | string | OS dependent | The default is the same applied by React Native.
fontWeight | string | 'normal' | On android, numeric ranges has no granularity and '500' to '900' becomes 'bold', but you can use fonts of specific weights, like "sans-serif-medium".
fontSize   | number | 14       | The default value is that used by RN and is provided in the `TextSize.FontSize.default` constant.
fontStyle  | string | 'normal' | One of "normal" or "italic".
allowFontScaling | boolean | true | Apply user accessibility settings (i.e. use SP units).
letterSpacing    | number  | 0    | Additional spacing between letters.
includeFontPadding | boolean | true | Android only. Include additional top and bottom padding.
textBreakStrategy  | string  | 'highQuality' | Android API 23+ only: 'simple', 'balanced', or 'highQuality'
fontVariant        | array   | (none)        | iOS only.

**TSMeasureResult**

Promise that resolves to a plain JS object with units in [Density Independent Pixels](https://developer.android.com/guide/topics/resources/more-resources#Dimension) (aka DP or DIP), except for `lineCount`.

Property  | Type   | Notes
--------- | ------ | ------
width     | number | Total width.
height    | number | Total height, including top and bottom padding if `includingFontPadding` was given.
lastLineWidth | number | Width of the last line, excluding trailing blanks.
lineCount | number | Number of lines, taking into account hard and automatic line breaks.

In case of error, the promise is rejected with an extended Error object with one of the following error codes:

Code | Details
---- | -------
E_PARAMETERS   | `measure` requires an object with the parameters, which was not provided.
E_MISSING_TEXT | The text to measure was not provided.

#### Example

```jsx
import { Dimensions, Platform } from 'react-native'
import MeasureText from 'react-native-text-size'

const iOS = Platform.OS === 'ios'

const text = 'This is an example'
const theFont = {
  fontSize = 16,
  fontFamily = undefined, // iOS:'San Francisco', Android 'Roboto'
  fontStyle = 'italic',
  fontWeight = 'bold',
}

class Test extends Component {
  state = {
    width: 0,
    height: 0,
  }

  async componentDidMount() {
    const width = Dimensions.get('window').width * 0.8
    const size = await MeasureText.measure({
      text,       // texts to measure
      width,      // container max width
      fontSize,
      fontFamily,
      fontStyle,
      fontWeight,
    })
    this.setState({
      width: size.width,
      height: size.height
    })
  }

render() {
    const { width, height } = this.state
    return (
      <View style={{ padding: 12 }}>
        <Text style={{ width, height, fontSize, fontFamily, fontStyle, fontWeight }}>
          {text}
        </Text>
      </View>
    )
  }
}
```

### `fontFromSpecs`

```ts
fontFromSpecs(specs: TSFontSpecs): Promise<TSFontInfo>
```

Returns the characteristics of the font obtained from the given specifications.

**TSFontSpecs**

This is a subset of `TSMeasureParams`, so the details are omitted.

Property   | Type   | Default
---------- | ------ | -------
fontFamily | string | iOS: 'San Francisco', Android: 'Roboto'
fontWeight | string | 'normal'
fontSize   | number | 14
fontStyle  | string | 'normal'
fontVariant   | array | (none)
letterSpacing | number | 0

<a name="tsfontinfo"></a> **TSFontInfo**

Plain JS object with info for the given font and size, with units in [Scale-independent Pixels](https://developer.android.com/guide/topics/resources/more-resources#Dimension) (sp) and floating point numbers. This is more accurate\* and allows you to use your preferred rounding method.

Property   | Type   | Details
---------- | ------ | --------
fontFamily | string | Can be `null`. In Android it is the same string passed as parameter.
fontName   | string | Can be `null` in iOS, always `undefined` in Android.
fontWeight | TFontWeight | 'normal' or 'bold'.
fontSize   | number | It may be different from the given parameter if it includes decimals.
fontStyle  | TFontStyle | 'normal' or 'italic'.
fontVariant | TFontVariant | iOS only, `undefined` in Android.
ascender   | number | The _recommended_ distance above the baseline for singled spaced text.
descender  | number | The _recommended_ distance below the baseline for singled spaced text.
capHeight  | number | iOS only. Height of uppercase letters.
xHeight    | number | iOS only. Height of the lowercase 'x'.
top        | number | Android only. Maximum distance above the baseline for the tallest glyph in the font.
bottom     | number | Android only. Maximum distance below the baseline for the lowest glyph in the font.
leading    | number | The _recommended_ additional space to add between lines of text.
lineHeight | number | The _recommended_ line height (remember, in SP). It should be greater if text contain Unicode symbols, such as emoticons.
_hash | number | Hash code, meybe useful for debugging.

\* Please consider no more than 5 digits of precision in this values.

**Tip**

> Avoid `allowsFontScaling: false`.
>
> When setting the `fontSize` and `lineHeight` properties of `<Text>` and `<TextInput>`, if you set or omit `allowFontScaling`, React Native recognizes these units as _sp_ and performs the conversion and scaling automatically.


### `specsForTextStyles`

```ts
specsForTextStyles(): Promise<{ [key: string]: TSFontSpec }>
```

Wrapper for the iOS [`UIFont.preferredFontForTextStyle`](https://developer.apple.com/documentation/uikit/uifont/1619030-preferredfontfortextstyle) method and the current Android [Material Design type scale](https://material.io/design/typography/#type-scale) styles.

The result is a Promise that resolves to a simple JS object whose keys depend on the OS, but the properties of its values (objects as well) are consistent with those used when defining RN styles for fonts, so it can be used to configure `<Text>` or `<TextInput>` components.

I have not tried to normalize the key names, with the exception of 2 or 3, these have a different interpretation in each UI. You know your app and can use them to create custom styles according to your needs.

**TSMDStyleSpec (Android)**

The resulting info is hard-coded in rn-text-size, the fontFamily is defined with their 'sans-serif' equivalents.

Key        | fontFamily    | fontSize | letterSpacing
---------- | ----------------- | ---- | --------------
h1         | sans-serif-light  | 96   | -1.5
h2         | sans-serif-light  | 60   | -0.5
h3         | sans-serif        | 48   | 0
h4         | sans-serif        | 34   | 0.25
h5         | sans-serif        | 24   | 0
h6         | sans-serif-medium | 20   | 0.15
subtitle1  | sans-serif        | 16   | 0.15
subtitle2  | sans-serif-medium | 14   | 0.1
body1      | sans-serif        | 16   | 0.5
body2      | sans-serif        | 14   | 0.25
button     | sans-serif-medium | 14   | 0.75
caption    | sans-serif        | 12   | 0.4
overline   | sans-serif        | 10   | 1.5

The font used, in non-rooted devices are sans-serif: Roboto, sans-serif-light: Roboto-Light, sans-serif-medium: Roboto-Medium.

_Note: The Material Design guide determines that both, 'button' and 'overline' text must be uppercase, but `fontVariant` is not supported in RN for Android, so that property is excluded._

**TSTextStyleSpec (iOS)**

The resulting info is obtained from the iOS API, using the constant derived from the identifier that you passed.

Key         | UIFontTextStyle constant
----------- | ------------------------
body        | `UIFontTextStyleBody`
callout     | `UIFontTextStyleCallout`
caption1    | `UIFontTextStyleCaption1`
caption2    | `UIFontTextStyleCaption2`
footnote    | `UIFontTextStyleFootnote`
headline    | `UIFontTextStyleHeadline`
subheadline | `UIFontTextStyleSubheadline`
title1      | `UIFontTextStyleTitle1`
title2      | `UIFontTextStyleTitle2`
title3      | `UIFontTextStyleTitle3`

**TSFontInfo**

See [TSFontInfo](#tsfontinfo) in `fontFromSpecs`.


### `fontFamilyNames`

```ts
fontFamilyNames(): Promise<string[]>
```

Returns an array of font family names available on the system.

In iOS, this uses the `UIFont.familyNames` method of the iOS SDK.

In Android the result is hard-coded for the system fonts and complemented dynamically with the custom fonts, if any.

#### Android Fonts

Android does not offer functions to enumerate the pre-installed fonts and the official names are aliased to real font names, so the information provided by rn-text-size is limited to a subset of fonts that you will (probably) find already installed. For example, in devices with API 21 or above, the system fonts are:

Generic Name         | Font File (.ttf)                       | Weight | Italic
-------------------- | -------------------------------------- | ------ | ------
sans-serif-thin      | Roboto-Regular (aliased)<br>Roboto-ThinItalic | 100 | yes
sans-serif-light     | Roboto-Light<br>Roboto-LightItalic     | 300    | yes
sans-serif           | Roboto-Regular<br>Roboto-RegularItalic | 400    | yes
&nbsp;               | Roboto-Bold<br>Roboto-BoldItalic       | 700\*  | yes
sans-serif-medium    | Roboto-Medium<br>Roboto-MediumItalic   | 500    | yes
sans-serif-black     | Roboto-Black<br>Roboto-BlackItalic     | 900    | yes
sans-serif-condensed-light | RobotoCondensed-Light<br>RobotoCondensed-LightItalic | 300 | yes
sans-serif-condensed | RobotoCondensed-Regular<br>RobotoCondensed-Italic  | 400 | yes
&nbsp;               | RobotoCondensed-Bold<br>RobotoCondensed-BoldItalic | 700\* | yes
sans-serif-smallcaps | CarroisGothicSC-Regular                | 400    | --
serif                | NotoSerif-Regular<br>NotoSerif-RegularItalic | 400 | yes
&nbsp;               | NotoSerif-Bold<br>NotoSerif-BoldItalic | 700\*  | yes
monospace            | DroidSansMono                          | 400    | --
serif-monospace      | CutiveMono                             | 400    | --
casual               | ComingSoon                             | 400    | --
cursive              | DancingScript-Regular                  | 400    | --
&nbsp;               | DancingScript-Bold                     | 700\*  | --

\* There is not '*-bold' generic names of this fonts, to obtain the weight 700 of them, you must use `fontWeight: 'bold'`.

Up to SDK 27, Android did not support setting different weights other than 'normal' and 'bold' by code. RN 0.57, the last version released on this date, does not support it either and converts weights '500'-'900' to 'bold'.

So, for example, if you want "Roboto Medium Italic" (weight 500), you have only two choices:
```js
// recommended
{
  fontFamily: 'sans-serif-medium',
  fontStyle: 'italic'
}
// by filename ...looks more like an iOS font Family :)
{
  fontFamily: 'Roboto-MediumItalic'
}
```

But for "Roboto Bold Italic", you can use any of this forms:
```js
// recommended
{
  fontWeight: 'bold',
  fontStyle: 'italic'
}
// generic name, specific weight & style
{
  fontFamily: 'sans-serif',
  fontWeight: 'bold',
  fontStyle: 'italic'
}
// by filename, with embedded weight & style
{
  fontFamily: 'Roboto-BoldItalic'
}
```

Also, be careful not to overwrite the desired weight with `fontWeight`, like here:
```js
{
  fontFamily: 'sans-serif-medium',
  fontStyle: 'bold' // bye bye weight 500
}
```
Some of the predefined, alternativa names:

* sans-serif: arial, helvetica, tahoma, verdana.
* serif: times, times new roman, palatino, georgia, baskerville, goudy, fantasy, ITC Stone Serif
* monospace: sans-serif-monospace, monaco
* serif-monospace: courier, courier new

If you are curious, se the `fonts.xml` or `system_fonts.xml` file in the ~/Android/Sdk/platforms/android-[sdk-num]/data/fonts directory.


### `fontNamesForFamilyName`

```ts
fontNamesForFamilyName(fontFamily: string): Promise<string[]>
```

Wrapper for the `UIFont.fontNamesForFamilyName` method of the iOS SDK, returns an array of font names available in a particular font family.

You can use the `fontFamilyNames` function to get an array of the available font family names on the system.

**iOS only**, on Android this function always resolves to `null`.

## Known Issues

Although rn-text-size provides the resulting `lineHeight`, it does not support it as a parameter because RN uses a non-standard algorithm to set it. I recommend you don't use `lineHeight` unless it is strictly necessary, but if you use it, try to make it 35% or more than the font size.

Nested `<Text>` components (or with images inside) can be rasterized with dimensions different from those calculated, rn-text-size does not accept multiple sizes in the text.


## Custom Fonts

If you ask yourself why Android provides so few fonts in relation to iOS, ...me too.

Google recommends that you embed the custom fonts you need together in your app and for this the Android API really shines. All you need to do is copy the font files (.ttf or .otf) into `android/app/src/assets/fonts` and you are done.

Alternatively, you can copy them to a directory outside of 'android' and use the `rnpm` key of package.json to load them (as is done in the example app). In this way, RN will copy and register them in iOS as well.

To apply your custom font, use the filename without extension in the `fontFamily` property (iOS requieres a different name).

The name of the available custom fonts can be obtained with the function `fontFamilyNames` of rn-text-size.

### Custom Fonts on iOS

Unlike Android, iOS provides numerous pre-installed fonts and it is unlikely you require a customized one and its setup is a bit more complicated. But if required, I recommend installing them through package.json or follow one of the several guides in the network.

React Native iOS supports the full range of font weights, you don't need to use the "familyName", only the `fontFamily` and its weight and/or style. Either way, if you need it rn-text-size provides the `fontNamesForFamilyName` function to get the names of the fonts in an iOS family.

This is the mapping between the RN `fontWeight` property and values of the `RCTFontWeight` enum of the iOS SDK:

fontWeight | RCTFontWeight
---------- | -------------
'100' | `UIFontWeightUltraLight`
'200' | `UIFontWeightThin`
'300' | `UIFontWeightLight`
'400' or 'normal' | `UIFontWeightRegular`
'500' | `UIFontWeightMedium`
'600' | `UIFontWeightSemibold`
'700' or 'bold' | `UIFontWeightBold`
'800' | `UIFontWeightHeavy`
'900' | `UIFontWeightBlack`

From iOS 9, the default font or "System", is "San Francisco".

### iOS Larger Accessibility Sizes

You can find more info in the [Larger Accessibility Type Sizes](https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/typography/) and the [iOS Font Size Guidelines](https://learnui.design/blog/ios-font-size-guidelines.html) of "Font Sizes in UI Design: The Complete Guide".

## TODO

- [ ] A lot of things

## Support my Work

I'm a full-stack developer with more than 20 year of experience and I try to share most of my work for free and help others, but this takes a significant amount of time and effort so, if you like my work, please consider...

[![Buy Me a Coffee][bmc-image]](bmc-url)

Thanks for your support!

## License

The [BSD 2-Clause](LICENCE) "Simplified" License.

Copyright (c) 2017, Airam
All rights reserved.

[npm-image]:      https://img.shields.io/npm/v/react-native-text-size.svg
[npm-url]:        https://www.npmjs.com/package/react-native-text-size
[license-image]:  https://img.shields.io/badge/license-BSD%202--Clause-blue.svg
[license-url]:    https://github.com/aMarCruz/react-native-text-size/blob/master/LICENSE
[bmc-image]:      https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png
[bmc-url]:        https://www.buymeacoffee.com/aMarCruz
