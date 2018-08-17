import React from 'react'
import { Dimensions, Modal, ModalProps, StyleSheet, Text, View, Platform } from 'react-native'
import { fontSizeSecondaryText, reactNativeVersion, fontSizePageTitle, borderColor, titleColor } from './constants'
import { TSFontInfo } from 'react-native-text-size'
import { Button } from './Button'

type Props = ModalProps & {
  onClose: () => void,
  font: TSFontInfo | null,
}

const scrnDim = Dimensions.get('screen')
const iOS = Platform.OS == 'ios'
const Android = !iOS

const vs = function<T>(v: T) { return v == null ? `(${v})` : v }

const renderBody = (font: TSFontInfo) => {
  return (
    <View style={styles.scroller}>
      <View style={styles.rowTitle}>
        <Text style={styles.title}>Font Information</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.text}>fontFamily:</Text>
        <Text style={styles.info}>{vs(font.fontFamily) || '(empty)'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.text}>fontSize:</Text>
        <Text style={styles.info}>{vs(font.fontSize)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.text}>fontStyle:</Text>
        <Text style={styles.info}>{vs(font.fontStyle)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.text}>fontWeight:</Text>
        <Text style={styles.info}>{vs(font.fontWeight)}</Text>
      </View>
      {iOS &&
        <View style={styles.row}>
          <Text style={styles.text}>fontVariant:</Text>
          <Text style={styles.info}>{JSON.stringify(font.fontVariant)}</Text>
        </View>}
      {iOS &&
        <View style={styles.row}>
          <Text style={styles.text}>ascender:</Text>
          <Text style={styles.info}>{font.ascender}</Text>
        </View>}
      {iOS &&
        <View style={styles.row}>
          <Text style={styles.text}>descender:</Text>
          <Text style={styles.info}>{font.descender}</Text>
        </View>}
      {Android && <View style={styles.row}>
        <Text style={styles.text}>top:</Text>
        <Text style={styles.info}>{font.top}</Text>
      </View>}
      {Android &&
        <View style={styles.row}>
          <Text style={styles.text}>bottom:</Text>
          <Text style={styles.info}>{font.bottom}</Text>
        </View>}
      <View style={styles.row}>
        <Text style={styles.text}>leading:</Text>
        <Text style={styles.info}>{font.leading}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.text}>lineHeight:</Text>
        <Text style={styles.info}>{font.lineHeight}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.text}>_hash:</Text>
        <Text style={styles.info}>{font._hash}</Text>
      </View>

      <View style={styles.divisor}/>
      <View style={styles.row}>
        <Text style={styles.text}>React Native:</Text>
        <Text style={styles.info}>v{reactNativeVersion}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.text}>System:</Text>
        <Text style={styles.info}>{`${iOS ? 'iOS' : 'Android SDK'} ${Platform.Version}`}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.text}>Screen size:</Text>
        <Text style={styles.info}>{`${scrnDim.width}x${scrnDim.height}`}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.text}>Screen scale:</Text>
        <Text style={styles.info}>{scrnDim.scale}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.text}>Font scale:</Text>
        <Text style={styles.info}>{scrnDim.fontScale}</Text>
      </View>
    </View>
  )
}

export function FontInfo (props: Props) {
  const { font, onClose, ...rest } = props
  return (
    <Modal
      animationType="fade"
      hardwareAccelerated
      transparent
      onDismiss={onClose}
      onRequestClose={onClose}
      {...rest}>
      <View style={styles.wrapper}>
        <View style={styles.container}>

          {font && renderBody(font)}

          <View style={styles.footer}>
            <Button text="Close" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.36)',
  },
  container: {
    borderRadius: iOS ? 9 : 4,
    backgroundColor: 'white',
    ...Platform.select({
      android: {
        elevation: 6,
      },
    }),
  },
  scroller: {
    paddingHorizontal: 24,
    paddingBottom: iOS ? 8 : 0,
  },
  footer: {
    alignSelf: 'stretch',
    height: 52,
    paddingTop: 8,
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        alignItems: 'center' as any,  // ¿?
        borderTopWidth: 1,
        borderTopColor: borderColor,
      },
      android: {
        alignItems: 'flex-end' as any,
      },
    })
  },
  row: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    paddingVertical: 2,
  },
  rowTitle: {
    height: 62,
    paddingTop: 4,
    justifyContent: 'center',
  },
  title: {
    color: titleColor,
    fontSize: fontSizePageTitle,
    fontWeight: '500',
    includeFontPadding: false,
  },
  text: {
    width: '40%',
    fontSize: fontSizeSecondaryText,
  },
  info: {
    fontSize: fontSizeSecondaryText,
  },
  divisor: {
    alignSelf: 'stretch',
    height: 1,
    marginVertical: 8,
    marginRight: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: borderColor,
  },
})
