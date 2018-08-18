# React Native Text Size

[![npm Version][npm-image]][npm-url]
[![License][license-image]][license-url]

Measure text accurately before rendering and get font information from your App (Android and iOS).

The text to be measured is required, the rest of the parameters supported are optional and work in the same way as with React Native:

- Font family, Font file (Android), or Font face (iOS).
- Font size
- Font weight
- Font style
- Font variant (iOS)
- Letter spacing
- Include font padding (Android)
- Text break strategy (Android)
- Allow font scaling
- Maximum width, for automatic line-break based on text-break strategy.

The result includes:

- The maximum width used by the text.
- Height, with or without paddings.
- The number of lines.
- The width of the last line, useful to save space with "See more..." style labels or time stamps.

...and it is practically identical to the one that React Native would send in the onLayout event using the same parameters.

Additionally, the library includes functions for detailed information of the fonts visible to the App.

**Requirements:**

- React Native v0.52.0 or later
- Targets Androind API 16 and iOS 9.0

The [sample App](https://github.com/aMarCruz/react-native-text-size/tree/master/example) uses RN v0.52.0, which is the minimum version supported by rnTextSize, but you can change it (See your README before testing it).

To take advantage of features such as `letterSpacing`, and better support for the most modern devices, use RN v0.55 or above.

---
**IMPORTANT:**

_rnTextSize (react-native-text-size) v2.0 is a complete refactoring, before using it, please uninstall the previous version._

This is WIP, I am working on the normalization and documentation of additional functions.

---

If this library has helped you, please support my work with a star or [buy me a coffee](https://www.buymeacoffee.com/aMarCruz).

## Automatic installation

```bash
$ yarn add react-native-text-size
$ react-native link react-native-text-size
```

## Manual installation

#### iOS

1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `react-native-text-size` and add `RNTextSize.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libRNTextSize.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
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

JS object with the text to measure, the maximum width, and properties like ones in the react-native [`<Text>`](https://facebook.github.io/react-native/docs/text) component.

Property | Type    | Default  | Notes
-------- | ------- | -------- | ------
text     | string  | (none)   | This is the only required parameter and may include _emojis_ or be empty, but it can not be `null`. If this is an empty string the resulting `width` will be zero.
width    | number  | Infinity | Restrict the width. The resulting height will vary depending on the automatic flow of the text.
fontFamily | string | OS dependent | The default is the same applied by React Native.
fontWeight | string | 'normal' | On android, numeric ranges has no granularity and '500' to '900' becomes 'bold', but you can use fonts of specific weights, like "sans-serif-medium".
fontSize   | number | 14       | The default value is that used by RN and is provided in the `.FontSize.default` constant.
fontStyle  | string | 'normal' | One of "normal" or "italic".
fontVariant        | array   | (none)        | _iOS only_
allowFontScaling | boolean | true | To respect the user' setting of large fonts (i.e. use SP units).
letterSpacing    | number  | (none) | Additional spacing between characters (a.k.a. `tracking`).<br>NOTE: In iOS a zero cancels automatic kerning.<br>_All iOS, Android with API 21+ and RN 0.55+_
includeFontPadding | boolean | true | Include additional top and bottom padding, to avoid clipping certain characters.<br>_Android only_
textBreakStrategy  | string  | 'highQuality' | One of 'simple', 'balanced', or 'highQuality'.<br>_Android only, with API 23+_

The [example App](https://github.com/aMarCruz/react-native-text-size/tree/master/example) shows interactively the effect of these parameters on the screen.

**TSMeasureResult**

Promise that resolves to a plain JS object with units in [Density Independent Pixels](https://developer.android.com/guide/topics/resources/more-resources#Dimension) (a.k.a DP or DIP), except for `lineCount`.

Property  | Type   | Notes
--------- | ------ | ------
width     | number | Total used width. It may be less or equal to the given width.
height    | number | Total height, including top and bottom padding if `includingFontPadding` was given.
lastLineWidth | number | Width of the last line, without trailing blanks.
lineCount | number | Number of lines, taking into account hard and automatic line breaks.

In case of error, the promise is rejected with an extended Error object with one of the following error codes, as literal strings:

Code | Details
---- | -------
E_MISSING_PARAMETERS | `measure` requires an object with the parameters, which was not provided.
E_MISSING_TEXT | The text to measure is `null` or was not provided.
E_INVALID_FONT_SPEC | The font specification is not valid. It is unlikely that this will happen on Android.
E_UNKNOWN_ERROR | Well... who knows?

#### _Example_

```jsx
//...
import rnTextSize, { TSFontSpecs } from 'react-native-text-size'

type Props = {}
type State = { width: number, height: number }

// On iOS 9+ will show 'San Francisco' and 'Roboto' on Android
const fontSpecs: TSFontSpecs = {
  fontFamily = undefined,
  fontSize = 24,
  fontStyle = 'italic',
  fontWeight = 'bold',
}
const text = 'I ❤️ rnTextSize'

class Test extends Component<Props, State> {
  state = {
    width: 0,
    height: 0,
  }

  async componentDidMount() {
    const width = Dimensions.get('window').width * 0.8
    const size = await rnTextSize.measure({
      text,             // text to measure, can include symbols
      width,            // max-width of the "virtual" container
      ...fontSpecs,     // RN font specification
    })
    this.setState({
      width: size.width,
      height: size.height
    })
  }

  // The result is reversible
  render() {
    const { width, height } = this.state
    return (
      <View style={{ padding: 12 }}>
        <Text style={{ width, height, ...fontSpecs }}>
          {text}
        </Text>
      </View>
    )
  }
}
```

---

### `fontFromSpecs`

```ts
fontFromSpecs(specs: TSFontSpecs): Promise<TSFontInfo>
```

Returns the characteristics of the font obtained from the given specifications.

**TSFontSpecs**

This is a subset of [`TSMeasureParams`](#tsmeasureparams), so the details are omitted here.

Property   | Type   | Default
---------- | ------ | -------
fontFamily | string | iOS: 'San Francisco', Android: 'Roboto'
fontWeight | string | 'normal'
fontSize   | number | 14
fontStyle  | string | 'normal'
fontVariant   | array | (none)
letterSpacing | number | 0

<a name="tsfontinfo"></a> **TSFontInfo**

JS object, fully compatible with RN Text Style, with info for the given font and size, in [_sp_](https://developer.android.com/guide/topics/resources/more-resources#Dimension) in Android or points in iOS, and floating point numbers.

Using float numbers is more accurate\* than integers and allows you to use your preferred rounding method.
Remember RN doesn't work with subpixels in Android and will truncate this values.

Property    | Type   | Details
----------- | ------ | --------
fontFamily  | string | Can be `null`. In Android it is the same string passed as parameter.
fontName    | string | Can be `null` in iOS, always `undefined` in Android.
fontSize    | number | It may be different from the given parameter if it includes decimals.
fontStyle   | TFontStyle   | 'normal' or 'italic'.
fontWeight  | TFontWeight  | 'normal' or 'bold'.
fontVariant | TFontVariant | _iOS only_, `undefined` in Android.
ascender    | number | The recommended distance above the baseline for singled spaced text.
descender   | number | The recommended distance below the baseline for singled spaced text.
top         | number | _Android only_. Maximum distance above the baseline for the tallest glyph in the font.
bottom      | number | _Android only_. Maximum distance below the baseline for the lowest glyph in the font.
leading     | number | The recommended additional space to add between lines of text.
lineHeight  | number | The recommended line height (remember, in _sp_). It should be greater if text contain Unicode symbols, such as emojis.
_hash       | number | Hash code, maybe useful for debugging.

\* Please consider no more than 5 digits of precision in this values.

See more in:

[Understanding typography](https://material.io/design/typography/understanding-typography.html#type-properties) at the Google Material Design site.

[About Text Handling in iOS](https://developer.apple.com/library/archive/documentation/StringsTextFonts/Conceptual/TextAndWebiPhoneOS/Introduction/Introduction.html#//apple_ref/doc/uid/TP40009542.) for iOS.

**Tip**

> Avoid `allowsFontScaling: false`.
>
> When setting the `fontSize` and `lineHeight` properties of `<Text>` and `<TextInput>`, if you omit, or set `allowFontScaling:true`, React Native recognizes these units as _sp_ and performs the conversion and scaling automatically.

---

### `specsForTextStyles`

```ts
specsForTextStyles(): Promise<{ [key: string]: TSFontSpec }>
```
Get system font information for the running OS.

This is a wrapper for the iOS [`UIFont.preferredFontForTextStyle`](https://developer.apple.com/documentation/uikit/uifont/1619030-preferredfontfortextstyle) method and the current Android Material Design [Type Scale](https://material.io/design/typography/#type-scale) styles.

The result is a Promise that resolves to a JS object whose keys depend on the OS, but its values are consistent with those used for the RN Text Style, so it can be used to configure `<Text>` or `<TextInput>` components.

I have not tried to normalize the key names, with the exception of 2 or 3, these have a different interpretation in each UI. You know your app and can use them to create custom styles according to your needs.

**Text Styles for Android**

The resulting info is hard-coded in rnTextSize, the fontFamily is defined with their 'sans-serif' equivalents.

It will render the default 'Roboto' font and its variants, in non-rooted devices.

The values follows the current Material Design guidelines:

Key        | fontFamily    | fontSize | letterSpacing\*
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

\* `letterSpacing` is excluded in React Native v0.54 or lower, and is only supported by Android API 21 Lollipop or later.

_Note: The Material Design guide determines that both, 'button' and 'overline' text must be uppercase, but `textTransform` is not supported in RN for Android, so that property is excluded._

**Text Styles for iOS**

The resulting info is obtained dynamically from the iOS UIKit. It is an object where each key has an [`UIFontTextStyle`](https://developer.apple.com/documentation/uikit/uifonttextstyle?language=objc) equivalent:

Key         | UIFontTextStyle constant
----------- | ------------------------
body        | `UIFontTextStyleBody`
callout     | `UIFontTextStyleCallout`
caption1    | `UIFontTextStyleCaption1`
caption2    | `UIFontTextStyleCaption2`
footnote    | `UIFontTextStyleFootnote`
headline    | `UIFontTextStyleHeadline`
subheadline | `UIFontTextStyleSubheadline`
largeTitle  | `UIFontTextStyleLargeTitle`   // added in iOS 11
title1      | `UIFontTextStyleTitle1`
title2      | `UIFontTextStyleTitle2`
title3      | `UIFontTextStyleTitle3`

See more in [Typography](https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/typography/), at the Human Interface Guidelines site.

The format of the values is the same as in Android, a collection of this `TSFontForStyle` objects:

**TSFontForStyle**

Property      | Type         | Notes
------------- | ------------ |------
fontFamily    | string       | System font face or family name.
fontSize      | number       | Unescaled font size in _sp_.
fontStyle     | TSFontStyle  | 'normal' or 'italic'.
fontWeight    | TSFontWeight | 'normal' or 'bold', on iOS can be '100' to '900'.
fontVariant   | TSFontVariant[] or null | _iOS only_.
letterSpacing | number       | _Android only_. Omitted if running RN for lower than 0.55.0

---

### `fontFamilyNames`

```ts
fontFamilyNames(): Promise<string[]>
```

Returns a Promise for an array of font family names available on the system.

On iOS, this uses the [`UIFont.familyNames`](https://developer.apple.com/documentation/uikit/uifont/1619040-familynames?language=objc) method of the UIKit.

On Android the result is hard-coded for the system fonts and complemented dynamically with the custom fonts, if any.

#### Android Fonts

Android does not offer functions to enumerate the pre-installed fonts and the official names are aliased to real font names, so the information provided by rnTextSize is limited to a subset of fonts that you will (probably) find already installed. For example, in devices with API 21 or above, the system fonts are:

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

\* There is not `*-bold` generic names of this fonts, to obtain the weight 700 of them, you must use `fontWeight: 'bold'`.

Up to SDK 27, Android did not support setting different weights other than 'normal' and 'bold' by code. RN 0.57, the last version released on this date, does not support it either and converts weights '500'-'900' to 'bold'.

So, for example, if you want "Roboto Medium Italic" (weight 500), you have only two choices:
```js
// recommended
{
  fontFamily: 'sans-serif-medium',
  fontStyle: 'italic'
}
// by filename ...looks more like an iOS font face :)
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

Also, be careful not to overwrite the desired weight with `fontWeight`, as here:
```js
{
  fontFamily: 'sans-serif-medium',
  fontStyle: 'bold'     // bye bye weight 500
}
```
Some of the predefined, alternative names:

* sans-serif: arial, helvetica, tahoma, verdana.
* serif: times, times new roman, palatino, georgia, baskerville, goudy, fantasy, ITC Stone Serif
* monospace: sans-serif-monospace, monaco
* serif-monospace: courier, courier new

If you are curious, se the `fonts.xml` or `system_fonts.xml` file in the ~/Android/Sdk/platforms/android-[sdk-num]/data/fonts directory.

---

### `fontNamesForFamilyName`

```ts
fontNamesForFamilyName(fontFamily: string): Promise<string[]>
```

Wrapper for the `UIFont.fontNamesForFamilyName` method of UIKit, returns an array of font names available in a particular font family.

You can use the `fontFamilyNames` function to get an array of the available font family names on the system.

**iOS only**, on Android this function always resolves to `null`.


## Custom Fonts

If you ask yourself why Android provides so few fonts in relation to iOS, ...me too.

Google recommends that you embed the custom fonts you need together in your app and for this the Android API really shines. All you need to do is copy the font files (.ttf or .otf) into `android/app/src/assets/fonts` and you are done.

Alternatively, you can copy them to a directory outside of 'android' and use the `rnpm` key of package.json to load them (as is done in the [sample App](https://github.com/aMarCruz/react-native-text-size/tree/master/example)). In this way, RN will copy and register this fonts in iOS as well.

To apply your custom font, use the filename without extension as `fontFamily` (iOS requieres the font name).

The name of the available custom fonts can be obtained with the function `fontFamilyNames` of rnTextSize.

### Custom Fonts on iOS

Unlike Android, iOS provides numerous pre-installed fonts and it is unlikely you require a customized one and its setup is a bit more complicated. But if required, I recommend installing them through package.json or follow one of the several guides in the network.

React Native for iOS support the full range of font weights. Use `fontFamily` and its weight and/or style but, if you are curios, look at the rnTextSize [`fontNamesForFamilyName`](#fontnamesforfamilyname) function.

### iOS Larger Accessibility Sizes

Use the base size and `allowFontScaling` and test it, RN will do the rest.

You can find more info in the [Larger Accessibility Type Sizes](https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/typography/) and the [iOS Font Size Guidelines](https://learnui.design/blog/ios-font-size-guidelines.html) of "Font Sizes in UI Design: The Complete Guide".


## Known Issues

Although rnTextSize provides the resulting `lineHeight`, it does not support it as a parameter because RN uses a non-standard algorithm to set it. I recommend you do not use `lineHeight` unless it is strictly necessary, but if you use it, try to make it 30% or more than the font size, or use rnTextSize [`fontFromSpecs`](#fontfromspecs) method if you want more precision.

Nested `<Text>` components (or with images inside) can be rasterized with dimensions different from those calculated, rnTextSize does not accept multiple sizes in the text.

## TODO

- [ ] Normalized tracking, or letter spacing, in font info.
- [ ] More testing, including Android and iOS TVs.
- [ ] Learn the beautiful English, to make better docs.
- [ ] Learn the ugly Objective-C, after almost a month of studying I don't find it pretty.
- [ ] And a lot of more things.
- [ ] Ahh a... lot of money, of course. I need a Mac 😆 so...

## Support my Work

I'm a full-stack developer with more than 20 year of experience and I try to share most of my work for free and help others, but this takes a significant amount of time and effort so, if you like my work, please consider...

[![Buy Me a Coffee][bmc-image]](bmc-url)

Feedback, PRs stars, and smiles are also welcome.

Thanks for your support!

## License

The [BSD 2-Clause](LICENCE) "Simplified" License.

Copyright (c) 2018, Alberto Martínez. All rights reserved.

[npm-image]:      https://img.shields.io/npm/v/react-native-text-size.svg
[npm-url]:        https://www.npmjs.com/package/react-native-text-size
[license-image]:  https://img.shields.io/badge/license-BSD%202--Clause-blue.svg
[license-url]:    https://github.com/aMarCruz/react-native-text-size/blob/master/LICENSE
[bmc-image]:      https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png
[bmc-url]:        https://www.buymeacoffee.com/aMarCruz
