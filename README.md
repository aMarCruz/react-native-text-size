# React Native Text Size

[![npm Version][npm-badge]][npm-url]
[![License][license-badge]][license-url]

Measure text accurately before laying it out and get font information from your App (Android and iOS).

There are two main functions: `flatHeights` to obtain the height of different blocks of text simultaneously, optimized for components such as [`<FlatList>`][0] or [`<RecyclerListView>`][1].

The other one is `measure`, which gets detailed information about one block of text:

- The width used by the text, with an option to calculate the real width of the largest line.
- The height of the text, with or without paddings.
- The number of lines.
- The width of the last line.
- Extended information of a given line.

The width and height are practically the same as those received from the `onLayout` event of a `<Text>` component with the same properties.

In both functions, the text to be measured is required, but the rest of the parameters are optional and work in the same way as with React Native:

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

In addition, the library includes functions to obtain information about the fonts visible to the App.

If it has helped you, please support my work with a star ⭐️ or [ko-fi][kofi-url].

## Installation

Mostly automatic installation from npm

```bash
yarn add react-native-text-size
react-native link react-native-text-size
```

**Requirements:**

- React Native v0.52 to v0.56.
- Android API 16 or iOS 9.0 and above.

If you are using Gradle 4 or later, don't forget to change the `compile` directive to `implementation` in the dependencies block of the android/app/build.gradle file.

See [Manual Installation][2] on the Wiki as an alternative if you have problems with automatic installation.

## API

- [`measure`](#measure)

- [`flatHeights`](#flatheights)

- [`specsForTextStyles`](#specsfortextstyles)

- [`fontFromSpecs`](#fontfromspecs)

- [`fontFamilyNames`](#fontfamilynames)

- [`fontNamesForFamilyName`](#fontnamesforfamilyname)

## measure

```ts
measure(options: TSMeasureParams): Promise<TSMeasureResult>
```

This function measures the text as RN does and its result is consistent\* with that of `Text`'s [onLayout](https://facebook.github.io/react-native/docs/text#onlayout) event. It takes a subset of the properties used by [`<Text>`][3] to describe the font and other options to use.

If you provide `width`, the measurement will apply automatic wrapping in addition to the explicit line breaks.

\* _There may be some inconsistencies in iOS, see this [Know Issue](#incorrent-height-ios) to know more._

**Note:**

Although this function is accurate and provides complete information, it can be heavy if the text is a lot, like the one that can be displayed in a FlatList. For these cases, it is better to use [`flatHeights`](#flatheights), which is optimized for batch processing.

### TSMeasureParams

Plain JS object with this properties (only `text` is required):

Property           | Type    | Default  | Notes
------------------ | ------  | -------- | ------
text               | string  | (none)   | This is the only required parameter and may include _emojis_ or be empty, but it **must not be** `null`.<br>If this is an empty string the resulting `width` will be zero.
fontFamily         | string  | OS dependent | The default is the same applied by React Native: Roboto in Android, San Francisco in iOS.<br>**Note:** Device manufacturer or custom ROM can change the default font.
fontWeight         | string  | 'normal' | On android, numeric ranges has no granularity and '500' to '900' becomes 'bold', but you can use a `fontFamily` of specific weight ("sans-serif-thin", "sans-serif-medium", etc).
fontSize           | number  | 14       | The default font size comes from RN.
fontStyle          | string  | 'normal' | One of "normal" or "italic".
fontVariant        | array   | (none)   | _iOS only_
allowFontScaling   | boolean | true     | To respect the user' setting of large fonts (i.e. use SP units).
letterSpacing      | number  | (none)   | Additional spacing between characters (aka `tracking`).<br>**Note:** In iOS a zero cancels automatic kerning.<br>_All iOS, Android with API 21+ and RN 0.55+_
includeFontPadding | boolean | true     | Include additional top and bottom padding, to avoid clipping certain characters.<br>_Android only_
textBreakStrategy  | string  | 'highQuality' | One of 'simple', 'balanced', or 'highQuality'.<br>_Android only, with API 23+_
width              | number  | MAX_INT  | Restrict the width. The resulting height will vary depending on the automatic flow of the text.
usePreciseWidth    | boolean | false    | If `true`, the result will include an exact `width` and the `lastLineWidth` property.<br>You can see the effect of this flag in the [sample App][sample-app].
lineInfoForLine    | number  | (none)   | If `>=0`, the result will include a [lineInfo](#lineinfo) property with information for the required line number.

The [sample App][sample-app] shows interactively the effect of these parameters on the screen.

### TSMeasureResult

`measure` returns a Promise that resolves to a JS object with this properties:

Property      | Type   | Notes
------------- | ------ | ------
width         | number | Total used width. It may be less or equal to the `width` option.<br>On Android, this value may vary depending on the `usePreciseWidth` flag.
height        | number | Total height, including top and bottom padding if `includingFontPadding` was set (the default).
lastLineWidth | number | Width of the last line, without trailing blanks.<br>If `usePreciseWidth` is `false` (the default), this property is undefined.
lineCount     | number | Number of lines, taking into account hard and automatic line breaks.
lineInfo      | object | Line information.<br>If the `lineInfoForLine` option is not given, this property is undefined.

#### lineInfo

If the value of the `lineInfoForLine` is greater or equal than `lineCount`, this info is for the last line (i.e. `lineCount` - 1).

Property      | Type   | Notes
------------- | ------ | ------
line          | number | Line number of this info, base 0.<br>It can be less than the requested line number if `lineInfoForLine` is out of range.
start         | number | Text offset of the beginning of this line.
end           | number | Text offset after the last _visible_ character (so whitespace is not counted) on this line.
bottom        | number | The vertical position of the bottom of this line, including padding.
width         | number | Horizontal extent of this line, including leading margin indent, but excluding trailing whitespace.<br>Use `usePreciseWidth:true` to get an accurate value for this property.

In case of error, the promise is rejected with an extended Error object with one of the following error codes, as a literal string:

Code                 | Details
-------------------- | -------
E_MISSING_PARAMETERS | `measure` requires an object with the parameters, which was not provided.
E_MISSING_TEXT       | The text to measure is `null` or was not provided.
E_INVALID_FONT_SPEC  | The font specification is not valid. It is unlikely that this will happen on Android.
E_UNKNOWN_ERROR      | Well... who knows?

### Example

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

## flatHeights

```ts
flatHeights(options: TSHeightsParams): Promise<number[]>
```

Calculate the height of each of the strings in an array.

This is an alternative to `measure` designed for cases in which you have to calculate the height of numerous text blocks with common characteristics (width, font, etc), a typical use case with `<FlatList>` or `<RecyclerListView>` components.

The measurement uses the same algorithm as `measure` but it returns only the height of each block and, by avoiding multiple steps through the bridge, it is faster... _much faster_ on Android!

I did tests on 5,000 random text blocks and these were the results (ms):

&nbsp;  | `measure` | `flatHeights`
------- | --------: | ----------:
Android | 49,624    | 1,091
iOS     |  1,949    |   732

In the future I will prepare an example of its use with FlatList and multiple styles on the same card.

### TSHeightsParams

This is an object similar to the one you pass to `measure`, but the `text` option is an array of strings and the `usePreciseWidth` and `lineInfoForLine` options are ignored.

Property            | Type     | Default
------------------- | -------- | --------
text                | string[] | (none)
width               | number   | Infinity
fontFamily          | string   | OS dependent
fontWeight          | string   | 'normal'
fontSize            | number   | 14
fontStyle           | string   | 'normal'
fontVariant         | array    | (none)
allowFontScaling    | boolean  | true
letterSpacing       | number   | (none)
includeFontPadding  | boolean  | true
textBreakStrategy   | string   | 'highQuality'

The result is a Promise that resolves to an array with the height of each block (in _SP_), in the same order in which the blocks were received.

Unlike measure, `null` elements returns 0 without generating error, and empty strings returns the same height that RN assigns to empty `<Text>` components (the difference of the result between `null` and empty is intentional).

## specsForTextStyles

```ts
specsForTextStyles(): Promise<{ [key: string]: TSFontForStyle }>
```

Get system font information for the running OS.

This is a wrapper for the iOS [`UIFont.preferredFontForTextStyle`][4] method and the current Android [Material Design Type Scale][5] styles.

The result is a Promise that resolves to a JS object whose keys depend on the OS, but its values are in turn objects fully compatible with those used in the RN styles, so it can be used to stylize `<Text>` or `<TextInput>` components:

### TSFontForStyle

Property      | Type         | Notes
------------- | ------------ |------
fontFamily    | string       | System family name or font face.
fontSize      | number       | Font size in _SP_ (unscaled).
fontStyle     | TSFontStyle  | Only if 'italic', undefined if the style is 'normal'.
fontWeight    | TSFontWeight | Only if 'bold', undefined if the weight is 'normal'.
fontVariant   | TSFontVariant[] or null | _iOS only_. Currently, no style includes this property.
letterSpacing | number       | Omitted if running on Android with RN lower than 0.55

To know the key names, please see [Keys from specsForTextStyles][6] in the Wiki.

I have not tried to normalize the keys of the result because, with the exception of two or three, they have a different interpretation in each OS, but you can use them to create custom styles according to your needs.

## fontFromSpecs

```ts
fontFromSpecs(specs: TSFontSpecs): Promise<TSFontInfo>
```

Returns the characteristics of the font obtained from the given specifications.

### TSFontSpecs

This parameter is a subset of [`TSMeasureParams`](#tsmeasureparams), so the details are omitted here.

Property      | Type     | Default
------------- | -------- | -------
fontFamily    | string   | iOS: 'San Francisco', Android: 'Roboto'
fontWeight    | string   | 'normal'
fontSize      | number   | 14
fontStyle     | string   | 'normal'
fontVariant   | string[] | (none)
letterSpacing | number   | 0

`fontFromSpecs` uses an implicit `allowsFontScaling:true` and, since this is not a measuring function, `includeFontPadding` has no meaning.

### TSFontInfo

The result is a Promise that resolves to a JS object with info for the given font and size, units in [_SP_][7] in Android or points in iOS, using floating point numbers where applicable\*.

Property    | Type     | Details
----------- | -------- | --------
fontFamily  | string   | In Android it is the same string passed as parameter.
fontName    | string   |_iOS only_, always `undefined` in Android.
fontSize    | number   | It may be different from the given parameter if the parameter includes decimals.
fontStyle   | string   | 'normal' or 'italic'.
fontWeight  | string   | 'normal' or 'bold', on iOS it can go from '100' to '900'.
fontVariant | string[] | _iOS only_, always `undefined` in Android.
ascender    | number   | The recommended distance above the baseline for singled spaced text.
descender   | number   | The recommended distance below the baseline for singled spaced text.
capHeight   | number   | _iOS only_ Height of capital characters.
xHeight     | number   | _iOS only_ Height of lowercase "x".
top         | number   | _Android only_. Maximum distance above the baseline for the tallest glyph in the font.
bottom      | number   | _Android only_. Maximum distance below the baseline for the lowest glyph in the font.
leading     | number   | The recommended additional space to add between lines of text.
lineHeight  | number   | The recommended line height. It should be greater if text contain Unicode symbols, such as emojis.
_hash       | number   | Hash code, may be useful for debugging.

\* _Using floats is more accurate than integers and allows you to use your preferred rounding method, but consider no more than 5 digits of precision in this values. Also, remember RN doesn't work with subpixels in Android and will truncate this values._

See more in:

[Understanding typography][8] at the Google Material Design site.

[About Text Handling in iOS][9] for iOS.

## fontFamilyNames

```ts
fontFamilyNames(): Promise<string[]>
```

Returns a Promise for an array of font family names available on the system.

On iOS, this uses the [`UIFont.familyNames`][10] method of the UIKit.

On Android, the result is hard-coded for the system fonts and complemented dynamically with the fonts installed by your app, if any.

See [About Android Fonts][11] and [Custom Fonts][12] in the Wiki to know more about this list.

## fontNamesForFamilyName

```ts
fontNamesForFamilyName(fontFamily: string): Promise<string[]>
```

Wrapper for the `UIFont.fontNamesForFamilyName` method of UIKit, returns an array of font names available in a particular font family.

You can use the rnTextSize's `fontFamilyNames` function to get an array of the available font family names on the system.

This is an **iOS only** function, on Android it always resolves to `null`.

## Known Issues

### Inconsistent width between platforms

In iOS, the resulting width of both, `measure` and `flatHeights`, includes leading whitespace while in Android these are discarded.

### Incorrent height (iOS)

On iOS, RN takes into account the absolute position on the screen to calculate the dimensions. rnTextSize can't do that and both, width and height, can have a difference of up to 1 pixel (not point).

### letterSpacing not scaling (iOS)

RN does not support the [Dynamic Type Sizes][13], but does an excellent job imitating this feature through `allowFontScaling` ...except for `letterSpacing` that is not scaled.

I hope that a future version of RN solves this issue.

### lineHeight Support

Although rnTextSize provides the resulting `lineHeight` in some functions, it does not support it as a parameter because RN uses a non-standard algorithm to set it. I recommend you do not use `lineHeight` unless it is strictly necessary, but if you use it, try to make it 30% or more than the font size, or use rnTextSize [`fontFromSpecs`](#fontfromspecs) method if you want more precision.

### Nested Text

Nested `<Text>` components (or with images inside) can be rasterized with dimensions different from those calculated, rnTextSize does not accept multiple sizes.

## TODO

- [X] Normalized tracking or letter spacing in font info.
- [ ] More testing, including Android and iOS TVs.
- [ ] Learn the beautiful English, to make better docs.
- [ ] Find something nice in the ugly Objective-C.

## Support my Work

I'm a full-stack developer with more than 20 year of experience and I try to share most of my work for free and help others, but this takes a significant amount of time and effort so, if you like my work, please consider...

[<img src="https://amarcruz.github.io/images/kofi_blue.png" height="36" title="Support Me on Ko-fi" />][kofi-url]

Of course, feedback, PRs, and stars are also welcome 🙃

Thanks for your support!

## License

The [BSD 2-Clause](LICENSE) "Simplified" License.

&copy; 2018, Alberto Martínez. All rights reserved.

[npm-badge]:      https://img.shields.io/npm/v/react-native-text-size.svg
[npm-url]:        https://www.npmjs.com/package/react-native-text-size
[license-badge]:  https://img.shields.io/badge/license-BSD%202--Clause-blue.svg
[license-url]:    https://github.com/aMarCruz/react-native-text-size/blob/master/LICENSE
[kofi-url]:       https://ko-fi.com/C0C7LF7I
[sample-app]:     https://github.com/aMarCruz/rn-text-size-sample-app
[0]: https://facebook.github.io/react-native/docs/flatlist
[1]: https://www.npmjs.com/package/recyclerlistview
[2]: https://github.com/aMarCruz/react-native-text-size/wiki/Manual-Installation
[3]: https://facebook.github.io/react-native/docs/text#props
[4]: https://developer.apple.com/documentation/uikit/uifont/1619030-preferredfontfortextstyle
[5]: https://material.io/design/typography/#type-scale
[6]: https://github.com/aMarCruz/react-native-text-size/wiki/Keys-from-specsForTextStyles
[7]: https://developer.android.com/guide/topics/resources/more-resources#Dimension
[8]: https://material.io/design/typography/understanding-typography.html#type-properties
[9]: https://developer.apple.com/library/archive/documentation/StringsTextFonts/Conceptual/TextAndWebiPhoneOS/Introduction/Introduction.html#//apple_ref/doc/uid/TP40009542.
[10]: https://developer.apple.com/documentation/uikit/uifont/1619040-familynames?language=objc
[11]: https://github.com/aMarCruz/react-native-text-size/wiki/About-Android-Fonts
[12]: https://github.com/aMarCruz/react-native-text-size/wiki/Custom-Fonts
[13]: https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/typography#dynamic-type-sizes
