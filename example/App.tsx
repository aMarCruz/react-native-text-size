/* @flow */
/* eslint max-len:0 */
import React from 'react'
import {
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
  ScrollView,
  StyleSheet,
  Switch,
  ToolbarAndroid,
  Text,
  TextInput,
  View,
  // typings
  LayoutChangeEvent,
} from 'react-native'
import TextSize, {
  // typings
  TSMeasureResult,
  TSTextBreakStrategy,
  TSFontSpecs,
  TSFontStyle,
  TSFontVariant,
  TSFontWeight,
} from 'react-native-text-size'
import { CrossPicker as Picker } from './src/CrossPicker'

type Props = {}
type State = {
  info?: TSMeasureResult,
  specs: TSFontSpecs,
  text: string,
  width?: number,
  allowFontScaling?: boolean,
  textBreakStrategy?: TSTextBreakStrategy,
  fonts?: string[],
  layout?: { width: number, height: number }
}

const IOS = Platform.OS === 'ios' && Platform.Version || undefined
const ANDROID = Platform.OS === 'android' && Platform.Version || undefined

const winDims = Dimensions.get('window')
const TEXT_TOP = 0
const TEXT_LEFT = 16
const TEXT_WIDTH = 274

const TEST_FONT: TSFontSpecs = {
  fontFamily: undefined,
  fontSize: undefined,
  fontStyle: undefined,
  fontWeight: undefined,
  fontVariant: undefined,
  includeFontPadding: true,
  letterSpacing: undefined,
}
const TEXT_STR = 'This is a first string\n' +
'The second string is slightly bigger ƒƒ \n' +
'Bacon ⌛ ⌨ ☄ 🤘 ipsum dolor 12345 amet 67890 capicola filet mignon flank venison ball tip pancetta cupim tenderloin bacon beef shank.'

const reactNativeVersion = (): { major: number, minor: number, patch: number } => {
  try {
    return require('./node_modules/react-native/Libraries/Core/ReactNativeVersion').version
  } catch (_) {
    return { major: 0, minor: 0, patch: 0 } // bellow 0.49.x
  }
}

// 5 decimals max
const formatNumber = (n: number) => {
  return n.toFixed(5).replace(/\.?0+$/, '')
}

export default class MeasureApp extends React.Component<Props, State> {

  constructor (props: Props) {
    super(props)

    this.state = {
      specs: TEST_FONT,
      text: TEXT_STR,
      width: TEXT_WIDTH,
      allowFontScaling: true,
      textBreakStrategy: undefined,
    }

    if (ANDROID) {
      StatusBar.setBackgroundColor('#002984')
      StatusBar.setTranslucent(true)
    }

    TextSize.fontFromSpecs({
      ...TEST_FONT,
    }).then((info) => {
      console.log('Initial font info:', info)
    }).catch(console.warn)

    const rn = reactNativeVersion()
    console.log(`Dimensions scale: ${winDims.scale}, fontScale: ${winDims.fontScale}`)
    console.log(`ReactNative ${rn.major}.${rn.minor}.${rn.patch}`)
    // $FlowSucks - can't convert undefined to string???
    console.log(`${IOS ? 'iOS' : 'Android SDK'} ${IOS || ANDROID}`)

    TextSize.specsForTextStyles()
      .then((specs) => { console.log('specsForTextStyles:', specs) })
      .catch(console.error)
    console.log('TextSize.FontSize:', TextSize.FontSize)
  }

  componentDidMount () {
    TextSize.measure({
      text: this.state.text,
      width: this.state.width,
      allowFontScaling: this.state.allowFontScaling,
      textBreakStrategy: this.state.textBreakStrategy,
      ...this.state.specs,
    }).then((info) => {
      this.displayResult(info)
      this.setState({ info })
    }).catch((err) => {
      console.warn('Error in measure:', err)
    })
    TextSize.fontFamilyNames().then((fonts) => {
      this.setState({ fonts })
    })
  }

  displayResult (info: TSMeasureResult) {
    console.log(`TextSize info - height: ${info.height}, width: ${
      info.width}, lastLineWidth: ${info.lastLineWidth}, lineCount: ${info.lineCount}`)
  }

  doMeasure (prop: Partial<TSFontSpecs>) {
    const { specs, text, width, allowFontScaling, textBreakStrategy } = this.state
    const specsParams = {
      ...specs, text, width, allowFontScaling, textBreakStrategy, ...prop,
    }
    TextSize.measure(specsParams).then((info) => {
      this.displayResult(info)
      this.setState((state) => {
        return {
          specs: { ...state.specs, ...prop },
          info,
        }
      })
    }).catch(console.error)
  }

  setFontFamily = (fontFamily: string | undefined) => {
    this.doMeasure({ fontFamily })
  }
  setFontStyle = (fontStyle: TSFontStyle | undefined) => {
    this.doMeasure({ fontStyle: fontStyle || undefined })
  }
  setFontWeight = (fontWeight: TSFontWeight | undefined) => {
    this.doMeasure({ fontWeight: fontWeight || undefined })
  }
  setFontSize = (ev: any) => {
    const fs = parseFloat(ev.nativeEvent.text)
    this.doMeasure({ fontSize: !isNaN(fs) && fs > 0 ? fs : undefined })
  }
  setLetterSpacing = (ev: any) => {
    const fs = parseFloat(ev.nativeEvent.text)
    this.doMeasure({ letterSpacing: fs || undefined })
  }
  setIncludeFontPadding = (includeFontPadding: boolean) => {
    this.doMeasure({ includeFontPadding })
  }
  setFontVariant = (variant: TSFontVariant) => {
    this.doMeasure({ fontVariant: variant ? [variant] : undefined })
  }

  setAllowFontScaling = (allowFontScaling: boolean) => {
    const { specs, text, width, textBreakStrategy } = this.state
    const specsParams = {
      ...specs, text, width, allowFontScaling, textBreakStrategy,
    }
    TextSize.measure(specsParams).then((info) => {
      this.displayResult(info)
      this.setState({ allowFontScaling })
    }).catch(console.error)
  }

  setTextBreakStrategy = (textBreakStrategy: TSTextBreakStrategy) => {
    const { specs, text, width, allowFontScaling } = this.state
    const specsParams = {
      ...specs, text, width, allowFontScaling, textBreakStrategy,
    }
    TextSize.measure(specsParams).then((info) => {
      this.displayResult(info)
      this.setState({ textBreakStrategy })
    }).catch(console.error)
  }

  onLayout = (e: LayoutChangeEvent) => {
    const info = e.nativeEvent.layout
    this.setState({ layout: { width: info.width, height: info.height } })
    console.log(`onLayout info - height: ${info.height}, width: ${info.width}`)
  }

  render () {
    const {
      info,
      specs,
      text,
      allowFontScaling,
      textBreakStrategy,
      fonts,
      layout
    } = this.state

    let sizes, infoStat, posStyle
    if (info) {
      sizes = {
        height: info.height,
        width: info.width,
        minHeight: info.height,
        minWidth: info.width,
      }
      posStyle = { left: info.lastLineWidth, top: TEXT_TOP + info.height }
      infoStat = `TextSize height ${formatNumber(info.height)}, width ${formatNumber(
        info.width)}\n  lastLineWidth ${formatNumber(info.lastLineWidth)}, lines: ${info.lineCount}`
    } else {
      sizes = { width: -1 }
      posStyle = { left: 10, top: 50 }
      infoStat = 'waiting for text-size...'
    }

    const layoutStat = layout ? `onLayout height ${
      formatNumber(layout.height)}, width ${formatNumber(layout.width)} ` : ' '

    return (
      <SafeAreaView style={styles.container}>

        <ToolbarAndroid title="TextSize Tester" titleColor="#fff" style={{
          height: 56,
          backgroundColor: '#3f51b5',
          elevation: 6,
        }} />

        <ScrollView style={{
          paddingLeft: TEXT_LEFT,
          paddingRight: TEXT_LEFT - 8,
          marginTop: 4,
        }}>

          <View style={styles.row}>
            <Text style={styles.prompt}>Font:</Text>
            <Picker
              mode="dialog"
              prompt="Select fontFamily"
              style={styles.pickerBox}
              selectedValue={specs.fontFamily}
              onValueChange={this.setFontFamily}
              items={fonts}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.prompt}>fontStyle:</Text>
            <Picker
              style={styles.pickerBox}
              selectedValue={specs.fontStyle}
              onValueChange={this.setFontStyle}
              items={[undefined, 'normal', 'italic']}
            />
          </View>
          {IOS &&
            <View style={styles.row}>
              <Text style={styles.prompt}>fontVariant:</Text>
              <Picker
                style={styles.pickerBox}
                selectedValue={specs.fontVariant && specs.fontVariant[0] || ''}
                onValueChange={this.setFontVariant}
                items={[undefined, 'small-caps',
                  'oldstyle-nums', 'lining-nums', 'tabular-nums', 'proportional-nums']}
              />
            </View>
          }
          <View style={styles.row}>
            <Text style={styles.prompt}>fontWeight:</Text>
            <Picker
              style={styles.pickerBox}
              selectedValue={specs.fontWeight}
              onValueChange={this.setFontWeight}
              items={[undefined, 'normal', 'bold']}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.prompt}>fontSize:</Text>
            <TextInput
              ref="fontSizeInput"
              style={styles.numeric}
              autoCapitalize="none"
              keyboardType="numeric"
              placeholder="enter size"
              defaultValue={specs.fontSize && specs.fontSize > 0 ? String(specs.fontSize) : ''}
              onEndEditing={this.setFontSize}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.prompt}>letterSpacing:</Text>
            <TextInput
              ref="letterSpacingInput"
              style={styles.numeric}
              autoCapitalize="none"
              keyboardType="number-pad"
              placeholder="spacing"
              defaultValue={specs.letterSpacing ? String(specs.letterSpacing) : ''}
              onEndEditing={this.setLetterSpacing}
            />
          </View>
          {ANDROID &&
            <View style={styles.row}>
              <Text style={styles.prompt}>textBreakStrategy:</Text>
              <Picker
                style={styles.pickerBox}
                selectedValue={textBreakStrategy}
                onValueChange={this.setTextBreakStrategy}
                items={[undefined, 'highQuality', 'balanced', 'simple']}
              />
            </View>
          }
          <View style={styles.row}>
            <Text style={styles.prompt}>allowFontScaling:</Text>
            <Switch
              style={styles.switchBox}
              value={allowFontScaling}
              onValueChange={this.setAllowFontScaling}
            />
          </View>

          {ANDROID &&
            <View style={styles.row}>
              <Text style={styles.prompt}>includeFontPadding:</Text>
              <Switch
                style={styles.switchBox}
                value={specs.includeFontPadding}
                onValueChange={(includeFontPadding) => this.doMeasure({ includeFontPadding })}
              />
            </View>
          }
          <View style={styles.lastRow}>
            <Text style={styles.statusText}>{layoutStat}</Text>
            <Text style={styles.statusText}>{infoStat}</Text>
          </View>

          {/*
            Graphical Output
          */}
          <View>
            {sizes.width > 0 && <View style={[styles.result, sizes]} />}

            <Text
              allowFontScaling={allowFontScaling}
              style={[styles.sample, specs as any]}
              onLayout={this.onLayout}>
              {text}
            </Text>

            <View style={[styles.lastLineWidthMark, posStyle]} />
          </View>

        </ScrollView>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //...StyleSheet.absoluteFillObject,
    ...Platform.select({
      android: {
        marginTop: StatusBar.currentHeight || 0,
      },
    }),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: IOS ? 56 : 40,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  lastRow: {
    justifyContent: 'space-around',
    minHeight: 44,
    paddingTop: 8,
    paddingBottom: 12,
  },
  prompt: {
    paddingRight: 4,
    textAlignVertical: 'center',
  },
  statusText: {
    fontFamily: IOS ? 'Courier' : 'monospace',
    fontSize: 12,
  },
  sample: {
    top: TEXT_TOP,
    left: 0,
    width: TEXT_WIDTH,
    maxWidth: TEXT_WIDTH,
    marginBottom: 40,
    backgroundColor: 'rgba(255,0,0,0.25)',
  },
  result: {
    position: 'absolute',
    top: TEXT_TOP,
    left: 0,
    borderColor: 'black',
    borderWidth: 1,
  },
  lastLineWidthMark: {
    position: 'absolute',
    width: 2,
    borderLeftWidth: 1,
    borderLeftColor: '#0000cc',
    height: 24,
  },
  pickerBox: {
    flexGrow: 1,
    alignSelf: 'center',
    marginLeft: 4,
  },
  numeric: {
    minWidth: 128,
    textAlign: 'right',
    marginRight: 12,
    fontFamily: IOS ? 'Courier' : 'monospace',
    fontWeight: 'bold',
  },
  switchBox: {
    marginRight: 8,
  },
})
