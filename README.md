# React Native Text Size

[![npm Version][npm-image]][npm-url]
[![License][license-image]][license-url]

Measure text accurately before laying it out and get font information from your App (Android and iOS).

The text to be measured is required, the rest of the parameters supported are optional and work in the same way as with React Native:

- `fontFamily`
- `fontSize`
- `fontWeight`
- `fontStyle`
- `fontVariant` (iOS)
- `includeFontPadding` (Android)
- `textBreakStrategy` (Android)
- `letterSpacing`
- `allowFontScaling`
- `width`: Constraint for automatic line-break based on text-break strategy.

There are two main functions, one to obtain the height of different blocks of text simultaneously, optimized for components such as `<FlatList>`.

The other one gets detailed information about a block of text:

- The width used by the text, with an option to calculate the real width of the largest line.
- Height, with or without paddings.
- The number of lines.
- The width of the last line, if required, useful to save space with "See more..." style labels or time stamps.

Both, width and height, are practically the same as those received in the `onLayout` event of a `<Text>` component with the same properties.

In addition, the library includes functions to obtain information about the fonts visible to the App.

rnTextSize is WIP, but if it has helped you, please support my work with a star :star2: or [buy me a coffee](https://www.buymeacoffee.com/aMarCruz).

---
**IMPORTANT:**

**rnTextSize (react-native-text-size) v2.0 is a complete refactoring, before using it, please unlink the previous version.**

**If `react-native unlink` fails, it reverses the changes described in [Manual Installation](https://github.com/aMarCruz/react-native-text-size/wiki/Manual-Installation).**

---

**Requirements:**

- React Native v0.52.0 or later
- Targets Android API 16 and iOS 9.0

The [sample App](https://github.com/aMarCruz/rn-text-size-sample-app) uses RN v0.52.0, which is the minimum version supported by rnTextSize but, to take advantage of features such as `letterSpacing` and better support for the most modern devices, use RN v0.55 or above.

## Installation

```bash
$ yarn add react-native-text-size
$ react-native link react-native-text-size
```

If you are using Gradle 4 or later, don't forget to change the `compile` directive to `implementation` in the dependencies block of the android/app/build.gradle file.

See [Manual Installation](https://github.com/aMarCruz/react-native-text-size/wiki/Manual-Installation) on the Wiki as an alternative if you have problems with automatic installation.

# API

- [`measure`](#measure)

- [`flatHeights`](#flatheights)

- [`specsForTextStyles`](#specsfortextstyles)

- [`fontFromSpecs`](#fontfromspecs)

- [`fontFamilyNames`](#fontfamilynames)

- [`fontNamesForFamilyName`](#fontnamesforfamilyname)

## `measure`

```js
measure(options: TSMeasureParams): Promise<TSMeasureResult>
```

This function measures the text as RN does and its result is consistent\* with that of `Text`'s onLayout event. It take a subset of the properties used by [`<Text>`](https://facebook.github.io/react-native/docs/text#props) to describe the font and other options to use.

If you provide the `width`, the measurement will apply automatic wrapping in addition to the explicit line breaks.

\* _There may be some inconsistencies in iOS, see this [Know Issue](#incorrent-height-ios) to know more._

**NOTE:**

Although this function is accurate and provides complete information, it can be heavy if the text is a lot, like the one that can be displayed in a FlatList. For these cases, it is better to use [`flatHeights`](#flatheights), which is optimized fotr those cases.

<a name="tsmeasureparams"></a>**TSMeasureParams**

Plain JS object with this properties:

Property   | Type   | Default  | Notes
---------- | ------ | -------- | ------
text       | string | (none)   | This is the only required parameter and may include _emojis_ or be empty, but it can not be `null`. If this is an empty string the resulting `width` will be zero.
width      | number | Infinity | Restrict the width. The resulting height will vary depending on the automatic flow of the text.
usePreciseWidth | boolean | false | If `true`, request an exact `width` and the value of `lastLineWidth` (iOS always returns the exact width).<br>You can see the effect of this flag in the [sample App](https://github.com/aMarCruz/rn-text-size-sample-app).
fontFamily | string | OS dependent | The default is the same applied by React Native: Roboto in Android, San Francisco in iOS.<br>**Note:** Device manufacturer or custom ROM can change the default font.
fontWeight | string | 'normal' | On android, numeric ranges has no granularity and '500' to '900' becomes 'bold', but you can use fonts of specific weights, like "sans-serif-medium".
fontSize   | number | 14       | The default value comes from RN.
fontStyle  | string | 'normal' | One of "normal" or "italic".
fontVariant         | array   | (none) | _iOS only_
allowFontScaling    | boolean | true | To respect the user' setting of large fonts (i.e. use SP units).
letterSpacing       | number  | (none) | Additional spacing between characters (a.k.a. `tracking`).<br>**Note:** In iOS a zero cancels automatic kerning.<br>_All iOS, Android with API 21+ and RN 0.55+_
includeFontPadding  | boolean | true | Include additional top and bottom padding, to avoid clipping certain characters.<br>_Android only_
textBreakStrategy   | string  | 'highQuality' | One of 'simple', 'balanced', or 'highQuality'.<br>_Android only, with API 23+_

The [sample App](https://github.com/aMarCruz/rn-text-size-sample-app) shows interactively the effect of these parameters on the screen.

**TSMeasureResult**

`measure` returns a Promise that resolves to a plain JS object with this properties:

Property  | Type   | Notes
--------- | ------ | ------
width     | number | Total used width. It may be less or equal to the given width. On Android this value may vary depending on the `usePreciseWidth` flag.
height    | number | Total height, including top and bottom padding if `includingFontPadding` was set (the default).
lastLineWidth | number | Width of the last line, without trailing blanks.<br>__Note:__ If `usePreciseWidth` is `false` (the default), this field is undefined.
lineCount | number | Number of lines, taking into account hard and automatic line breaks.

In case of error, the promise is rejected with an extended Error object with one of the following error codes, as literal strings:

Code | Details
---- | -------
E_MISSING_PARAMETERS | `measure` requires an object with the parameters, which was not provided.
E_MISSING_TEXT | The text to measure is `null` or was not provided.
E_INVALID_FONT_SPEC | The font specification is not valid. It is unlikely that this will happen on Android.
E_UNKNOWN_ERROR | Well... who knows?

### _Example_

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

## `flatHeights`

```ts
flatHeights(options: TSHeightsParams): Promise<number[]>
```

Calculate the height of each of the strings in an array.

This is an alternative to `measure` designed for cases in which you have to calculate the height of numerous text blocks with common characteristics (width, font, etc), a Typical case in the `<FlatList>`.

The measurement uses the same algorithm as `measure` but it returns only the height of each block and, by avoiding multiple steps through the bridge, it is faster... _much faster_ on Android!

I did tests on 5,000 random text blocks and these were the results (ms):

&nbsp;  | `measure` | `flatHeights`
------- | --------: | ----------:
Android | 49,624    | 1,091
iOS     |  1,949    |   732

In the future I will prepare an example of its use with FlatList and multiple styles on the same card.

**TSHeightsParams**

This is an object similar to the one received by measure, with the difference that the text property is an array of strings, and the usePreciseWidth property is ignored.

The result is an array with the height of each block, in the same order was given.

This is an object similar to the one received by `measure`, but the `text` property is an array of strings and the `usePreciseWidth` property is ignored.

Property   | Type   | Default
---------- | ------ | --------
text       | string[] | (none)
width      | number | Infinity
fontFamily | string | OS dependent
fontWeight | string | 'normal'
fontSize   | number | 14
fontStyle  | string | 'normal'
fontVariant         | array   | (none)
allowFontScaling    | boolean | true
letterSpacing       | number  | (none)
includeFontPadding  | boolean | true
textBreakStrategy   | string  | 'highQuality'

The result is a Promise that resolves to an array with the height of each block (_SP_), in the same order in which they were received.

Unlike measure, `null` elements returns 0 without generating error, and empty strings returns the same height that RN assigns to empty `<Text>` components.


## `specsForTextStyles`

```ts
specsForTextStyles(): Promise<{ [key: string]: TSFontForStyle }>
```

Get system font information for the running OS.

This is a wrapper for the iOS [`UIFont.preferredFontForTextStyle`](https://developer.apple.com/documentation/uikit/uifont/1619030-preferredfontfortextstyle) method and the current Android [Material Design Type Scale](https://material.io/design/typography/#type-scale) styles.

The result is a Promise that resolves to a JS object whose keys depend on the OS, but its values are in turn objects fully compatible with those used in the RN styles, so it can be used to stylize `<Text>` or `<TextInput>` components:

**TSFontForStyle**

Property      | Type         | Notes
------------- | ------------ |------
fontFamily    | string       | System family name or font face.
fontSize      | number       | Font size in _SP_ (unscaled).
fontStyle     | TSFontStyle  | Only if 'italic', undefined for 'normal' style.
fontWeight    | TSFontWeight | Undefined if the font weight is 'normal'.
fontVariant   | TSFontVariant[] or null | _iOS only_.
letterSpacing | number       | Omitted if running on Android with RN lower than 0.55

To know the key names, please see [Keys from specsForTextStyles](https://github.com/aMarCruz/react-native-text-size/wiki/Keys-from-specsForTextStyles) the Wiki.

I have not tried to normalize these keys since, with the exception of 2 or 3, they have a different interpretation in each OS. You will know how to use them to create custom styles according to your needs.


## `fontFromSpecs`

```ts
fontFromSpecs(specs: TSFontSpecs): Promise<TSFontInfo>
```

Returns the characteristics of the font obtained from the given specifications.

**TSFontSpecs**

This parameter is a subset of [`TSMeasureParams`](#tsmeasureparams), so the details are omitted here.

Property   | Type   | Default
---------- | ------ | -------
fontFamily | string | iOS: 'San Francisco', Android: 'Roboto'
fontWeight | string | 'normal'
fontSize   | number | 14
fontStyle  | string | 'normal'
fontVariant   | string[] | (none)
letterSpacing | number | 0

`fontFromSpecs` uses an implicit `allowsFontScaling:true` and, since this is not a measuring function, `includeFontPadding` has no meaning.

<a name="tsfontinfo"></a> **TSFontInfo**

The result is a Promise that resolves to a JS object with info for the given font and size, units in [_SP_](https://developer.android.com/guide/topics/resources/more-resources#Dimension) in Android or points in iOS, using floating point numbers where applicable\*.

Property    | Type   | Details
----------- | ------ | --------
fontFamily  | string | In Android it is the same string passed as parameter.
fontName    | string |_iOS only_, always `undefined` in Android.
fontSize    | number | It may be different from the given parameter if it includes decimals.
fontStyle   | string | 'normal' or 'italic'.
fontWeight  | string | 'normal' or 'bold', on iOS it can go from '100' to '900'.
fontVariant | string[] | _iOS only_, always `undefined` in Android.
ascender    | number | The recommended distance above the baseline for singled spaced text.
descender   | number | The recommended distance below the baseline for singled spaced text.
capHeight   | number | _iOS only_ Height of capital characters.
xHeight     | number | _iOS only_ Height of lowercase "x".
top         | number | _Android only_. Maximum distance above the baseline for the tallest glyph in the font.
bottom      | number | _Android only_. Maximum distance below the baseline for the lowest glyph in the font.
leading     | number | The recommended additional space to add between lines of text.
lineHeight  | number | The recommended line height (remember, _SP_ in Android). It should be greater if text contain Unicode symbols, such as emojis.
_hash       | number | Hash code, maybe useful for debugging.

\* _Using floats is more accurate than integers and allows you to use your preferred rounding method, but consider no more than 5 digits of precision in this values. Also, remember RN doesn't work with subpixels in Android and will truncate this values._

See more in:

[Understanding typography](https://material.io/design/typography/understanding-typography.html#type-properties) at the Google Material Design site.

[About Text Handling in iOS](https://developer.apple.com/library/archive/documentation/StringsTextFonts/Conceptual/TextAndWebiPhoneOS/Introduction/Introduction.html#//apple_ref/doc/uid/TP40009542.) for iOS.

**Tip**

Avoid `allowsFontScaling: false`.

When setting the `fontSize` and `lineHeight` properties of `<Text>` and `<TextInput>`, if you omit, or set `allowFontScaling:true`, React Native performs the conversion and scaling automatically.


## `fontFamilyNames`

```ts
fontFamilyNames(): Promise<string[]>
```

Returns a Promise for an array of font family names available on the system.

On iOS, this uses the [`UIFont.familyNames`](https://developer.apple.com/documentation/uikit/uifont/1619040-familynames?language=objc) method of the UIKit.

On Android the result is hard-coded for the system fonts and complemented dynamically with the custom fonts, if any.

See [About Android Fonts](https://github.com/aMarCruz/react-native-text-size/wiki/About-Android-Fonts) and [Custom Fonts](https://github.com/aMarCruz/react-native-text-size/wiki/Custom-Fonts) in the Wiki to know more about this list.


## `fontNamesForFamilyName`

```ts
fontNamesForFamilyName(fontFamily: string): Promise<string[]>
```

Wrapper for the `UIFont.fontNamesForFamilyName` method of UIKit, returns an array of font names available in a particular font family.

You can use the rnTextSize's `fontFamilyNames` function to get an array of the available font family names on the system.

**iOS only**, on Android this function always resolves to `null`.


## Known Issues

#### Incorrent height (iOS)

On iOS, RN takes into account the absolute position on the screen to calculate the dimensions. rnTextSize can't do that and both, width and height, can have a difference of up to 1 pixel (not point).

#### letterSpacing not scaling (iOS)

RN does not support the [Dynamic Type Sizes](https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/typography#dynamic-type-sizes), but does an excellent job imitating this feature through `allowFontScaling` ...except for `letterSpacing` that is not scaled.

I hope that a future version of RN solves this issue.

#### lineHeight Support

Although rnTextSize provides the resulting `lineHeight` in some functions, it does not support it as a parameter because RN uses a non-standard algorithm to set it. I recommend you do not use `lineHeight` unless it is strictly necessary, but if you use it, try to make it 30% or more than the font size, or use rnTextSize [`fontFromSpecs`](#fontfromspecs) method if you want more precision.

#### Nexted Text

Nested `<Text>` components (or with images inside) can be rasterized with dimensions different from those calculated, rnTextSize does not accept multiple sizes in the text.


## TODO

- [X] Normalized tracking or letter spacing in font info.
- [ ] Including `lineHeight` in specsForTextStyles.
- [ ] More testing, including Android and iOS TVs.
- [ ] Learn the beautiful English, to make better docs.
- [ ] Learn the ugly Objective-C, after almost a month of studying I don't find it pretty.
- [ ] And a lot of more things.
- [ ] Ahh a... lot of money, of course. I need a Mac 😆 so...


## Support my Work

I'm a full-stack developer with more than 20 year of experience and I try to share most of my work for free and help others, but this takes a significant amount of time and effort so, if you like my work, please consider...

[![Buy Me a Coffee][bmc-image]][bmc-url]

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
