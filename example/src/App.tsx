/* eslint max-len:0 */
import React from 'react'
import {
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  // typings
  LayoutChangeEvent,
} from 'react-native'
import TextSize, {
  // typings
  TSMeasureResult,
  TSFontInfo,
  TSTextBreakStrategy,
  TSFontSpecs,
  TSFontStyle,
  TSFontVariant,
  TSFontWeight,
} from 'react-native-text-size'
import alertPrompt from 'react-native-prompt-android'
import { CrossPicker as Picker } from './CrossPicker'
import { TopAppBar } from './TopAppBar'
import { FontInfo } from './FontInfo'
import { Button } from './Button'
import { fontSizeCaption, fontSizeSecondaryText, fontSizeInput, reactNativeXNumber } from './constants'

type Props = {}
type State = {
  fonts: Array<string | undefined>,
  parms: {
    text: string,
    width?: number,
    allowFontScaling?: boolean,
    textBreakStrategy?: TSTextBreakStrategy,
  },
  specs: TSFontSpecs,
  info?: TSMeasureResult,
  layout?: { width: number, height: number },
  fontInfo: TSFontInfo | null,
}

const IOS = Platform.OS === 'ios' && Platform.Version || undefined
const ANDROID = Platform.OS === 'android' && Platform.Version || undefined

const winDims = Dimensions.get('window')
const IS_SMALL = winDims.width <= 420
const TEXT_TOP = 0
const TEXT_LEFT = 14
const TEXT_WIDTH = Math.min(274, winDims.width - TEXT_LEFT * 2)

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

// 5 decimals max
const formatNumber = (n: number) => {
  return n.toFixed(5).replace(/\.?0+$/, '')
}

export default class MeasureApp extends React.Component<Props, State> {

  constructor (props: Props) {
    super(props)

    this.state = {
      fonts: [undefined],
      parms: {
        text: TEXT_STR,
        width: TEXT_WIDTH,
        allowFontScaling: true,
        textBreakStrategy: undefined,
      },
      specs: TEST_FONT,
      fontInfo: null,
    }

    TextSize.specsForTextStyles()
      .then((specs) => { console.log('specsForTextStyles:', specs) })
      .catch(console.error)
    console.log('TextSize.FontSize:', TextSize.FontSize)
  }

  componentDidMount () {
    TextSize.measure({
      ...this.state.parms,
      ...this.state.specs,
    }).then((info) => {
      this.displayResult(info)
      this.setState({ info })
    }).catch((err) => {
      console.warn('Error in measure:', err)
    })
    TextSize.fontFamilyNames().then((fonts) => {
      fonts.unshift(undefined as any)
      this.setState({ fonts })
    })
  }

  displayResult (info: TSMeasureResult) {
    console.log(`TextSize info - height: ${info.height}, width: ${
      info.width}, lastLineWidth: ${info.lastLineWidth}, lineCount: ${info.lineCount}`)
  }

  doMeasure (prop: Partial<TSFontSpecs> | Partial<State['parms']>, rootProp?: boolean) {
    const specsParams = {
      ...this.state.parms, ...this.state.specs, ...prop,
    }
    TextSize.measure(specsParams).then((info) => {
      this.displayResult(info)
      // @ts-ignore
      this.setState((state) => {
        return rootProp
          ? { parms: { ...state.parms, ...prop }, info }
          : { specs: { ...state.specs, ...prop }, info }
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
    this.doMeasure({ fontSize: isNaN(fs) ? undefined : fs })
  }
  setLetterSpacing = (ev: any) => {
    const fs = parseFloat(ev.nativeEvent.text)
    this.doMeasure({ letterSpacing: isNaN(fs) ? undefined : fs })
  }
  setIncludeFontPadding = (includeFontPadding: boolean) => {
    this.doMeasure({ includeFontPadding })
  }
  setFontVariant = (variant: TSFontVariant) => {
    this.doMeasure({ fontVariant: variant ? [variant] : undefined })
  }
  setAllowFontScaling = (allowFontScaling: boolean) => {
    this.doMeasure({ allowFontScaling }, true)
  }
  setTextBreakStrategy = (textBreakStrategy: TSTextBreakStrategy) => {
    this.doMeasure({ textBreakStrategy }, true)
  }
  setText = (text: string) => {
    this.doMeasure({ text }, true)
  }
  setWidth = (text: string) => {
    const width = parseFloat(text)
    if (!isNaN(width)) {
      this.doMeasure({ width }, true)
    }
  }

  promptForText = () => {
    alertPrompt('Text to Measure', undefined, this.setText, {
      cancelable: true,
      defaultValue: this.state.parms.text,
      placeholder: 'Enter the text to measure',
    })
  }
  promptForWidth = () => {
    alertPrompt('Maximum Width', undefined, this.setWidth, {
      cancelable: true,
      defaultValue: String(this.state.parms.width),
      placeholder: 'Width restriction or 0 for none',
      type: IOS ? 'default' : 'numeric',
    })
  }

  showFontInfo = () => {
    const parms = {
      ...this.state.parms,
      ...this.state.specs,
    }
    TextSize.fontFromSpecs(parms).then((fontInfo) => {
      this.setState({ fontInfo })
    })
  }
  onInfoClose = () => {
    this.setState({ fontInfo: null })
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
      parms,
      fonts,
      fontInfo,
      layout,
    } = this.state
    const {
      allowFontScaling,
      textBreakStrategy,
    } = parms

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

    const keyboardType = ANDROID && reactNativeXNumber <= 56 ? 'numeric' : 'decimal-pad'

    // The change of color will redraw the sample text and raise a new onLayout event
    const sampleStyle = {
      color: specs.includeFontPadding ? 'black' : '#222',
      maxWidth: parms.width,
    }

    return (
      <SafeAreaView style={styles.container}>

        <TopAppBar title="rnTextSize Tester" />

        <ScrollView style={styles.scrollArea}>

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
          {IOS ? (
            <View style={styles.row}>
              <Text style={styles.prompt}>fontVariant:</Text>
              <Picker
                style={styles.pickerBox}
                selectedValue={specs.fontVariant && specs.fontVariant[0] || ''}
                onValueChange={this.setFontVariant}
                items={[undefined, 'small-caps',
                  'oldstyle-nums', 'lining-nums', 'tabular-nums', 'proportional-nums']}
              />
          </View>) : null
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
              keyboardType={keyboardType}
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
              keyboardType={keyboardType}
              placeholder="spacing"
              defaultValue={specs.letterSpacing ? String(specs.letterSpacing) : ''}
              onEndEditing={this.setLetterSpacing}
            />
          </View>
          {ANDROID ? (
            <View style={styles.row}>
              <Text style={styles.prompt}>textBreakStrategy:</Text>
              <Picker
                style={styles.pickerBox}
                selectedValue={textBreakStrategy}
                onValueChange={this.setTextBreakStrategy}
                items={[undefined, 'highQuality', 'balanced', 'simple']}
              />
            </View>) : null
          }
          <View style={styles.row}>
            <Text style={styles.prompt}>allowFontScaling:</Text>
            <Switch
              style={styles.switchBox}
              value={allowFontScaling}
              onValueChange={this.setAllowFontScaling}
            />
          </View>

          {ANDROID ? (
            <View style={styles.row}>
              <Text style={styles.prompt}>includeFontPadding:</Text>
              <Switch
                style={styles.switchBox}
                value={specs.includeFontPadding}
                onValueChange={this.setIncludeFontPadding}
              />
            </View>) : null
          }

          <View style={styles.lastRow}>
            <Text style={styles.statusText}>{layoutStat}</Text>
            <Text style={styles.statusText}>{infoStat}</Text>
          </View>

          <View style={styles.buttonBar}>
            <Button outline={!IOS} text={IS_SMALL ? 'Text' : 'Set Text'} onPress={this.promptForText} />
            <Button outline={!IOS} text={IS_SMALL ? 'Width' : 'Set Width'} onPress={this.promptForWidth} />
            <Button outline={!IOS} text="Info..." onPress={this.showFontInfo} />
          </View>

          {/*
            Graphical Output
          */}
          <View>
            {sizes.width > 0 && <View style={[styles.result, sizes]} />}

            <Text
              allowFontScaling={allowFontScaling}
              textBreakStrategy={textBreakStrategy}
              style={[styles.sample, specs, sampleStyle]}
              onLayout={this.onLayout}>{parms.text}</Text>

            <View style={[styles.lastLineWidthMark, posStyle]} />
          </View>

        </ScrollView>

        <FontInfo visible={!!fontInfo} font={fontInfo} onClose={this.onInfoClose} />
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
    paddingLeft: TEXT_LEFT,
    paddingRight: TEXT_LEFT - 8,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: IOS ? 56 : 40,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomColor: IOS ? '#8E8E93' : '#CCC',
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
    fontSize: fontSizeSecondaryText,
    letterSpacing: IOS ? -0.24 : undefined,
  },
  statusText: {
    fontFamily: IOS ? 'Courier' : 'monospace',
    fontSize: fontSizeCaption,
  },
  sample: {
    flexWrap: 'wrap',
    top: TEXT_TOP,
    left: 0,
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
    fontSize: fontSizeInput,
  },
  switchBox: {
    marginRight: 8,
  },
  buttonBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingBottom: 12,
    marginRight: 4,
  },
})
