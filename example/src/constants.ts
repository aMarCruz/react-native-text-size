import { Platform, NativeModules } from 'react-native'
import TextSize from 'react-native-text-size'

const iOS = Platform.OS === 'ios'

// android
export const primaryColor = iOS ? '#0076FF' : '#3f51b5'
export const primaryDarkColor = '#364289'
export const defaultFontSize = iOS ? 17 : 16
//export const primaryDarkColor = '#002984'
export const borderColor = iOS ? '#8E8E93' : '#00000030'
export const titleColor = iOS ? '#333' : '#000000de'

export const TOPBAR_HEIGHT = iOS ? 44 : 56
// when translucent statusbar
export const STATUSBAR_HEIGHT = iOS ? 20 : Platform.Version >= 21 ? 24 : 0

export const fontSizeButton = TextSize.FontSize.button
export const fontSizeCaption = TextSize.FontSize.smallSystem
export const fontSizeInput = TextSize.FontSize.label
export const fontSizePrimaryText = TextSize.FontSize.label
export const fontSizeSecondaryText = TextSize.FontSize.system
export const fontSizePageTitle = iOS ? 17 : 20

const rnVer = ((): { major: number, minor: number, patch: number } => {
  const { PlatformConstants: pc } = NativeModules
  const ver = pc && pc.reactNativeVersion
  if (ver && typeof ver.minor === 'number') {
    return ver
  }
  return { major: 0, minor: 0, patch: 0 } // bellow 0.49.x
})()

export const reactNativeVersion = `${rnVer.major}.${rnVer.minor}.${rnVer.patch}`
export const reactNativeXNumber  = (rnVer.major << 16) | rnVer.minor
