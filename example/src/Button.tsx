/*
  Botón de acción/comando similar al de React pero más potente.

  @TODO: Posibilidad de evitar doble click
*/
import React from 'react'
import {
  Text,
  TouchableNativeFeedback,
  TouchableOpacity,
  Platform,
  View,
  // typings
  TouchableOpacityProperties,
  AccessibilityPropertiesIOS,
} from 'react-native'

import { fontSizeButton, primaryColor, borderColor } from './constants'

type AccessibilityTraitsProp = AccessibilityPropertiesIOS['accessibilityTraits']
type Dict = { [k: string]: any }

type Props = TouchableOpacityProperties & {
  text?: string,
  block?: boolean,
  inverse?: boolean,
  outline?: boolean,
  rounded?: boolean,
  disabled?: boolean,
  rippleColor?: string | null,
}

const iOS = Platform.OS === 'ios'

export class Button extends React.PureComponent<Props> {

  prepareStyles (props: Props) {
    const assign = Object.assign
    const button = { ...styles.base } as Dict
    const text   = { ...styles.text } as Dict
    const result = { button, text }

    // block y rounded después del tipo ya que pueden sobrescrir valores
    if (props.block) {
      assign(button, styles.block)
    }
    if (props.rounded) {
      button.borderRadius = button.height / 2
    }
    if (props.disabled) {
      assign(button, styles.disabled)
    }
    if (props.outline) {
      assign(button, styles.outline)
    }
    if (props.inverse) {
      assign(button, props.inverse)
      text.color = 'white'
    }
    return result
  }

  render () {
    const {
      text,
      style,
      activeOpacity,
      rippleColor,
      disabled,
      onLongPress,
      onPress,
      ...props
    } = this.props
    const rootStyles = this.prepareStyles(this.props)

    const children: JSX.Element | null = text ? (
      <Text
        key="btnText"
        numberOfLines={1}
        style={rootStyles.text}
      >
        {Platform.OS === 'android' ? text.toLocaleUpperCase() : text}
      </Text>
    ) : null

    const press = {} as any
    if (!disabled) {
      press.onPress = onPress
      press.onLongPress = onLongPress
    }

    const pointer = {} as any
    if (disabled) {
      pointer.pointerEvents = 'none'
    }

    if (Platform.OS === 'ios' || Platform.Version <= 21) {
      const accessibilityTraits: AccessibilityTraitsProp =
        Platform.OS === 'ios' ? disabled ? ['button', 'disabled'] : 'button' : undefined

      return (
        <TouchableOpacity
          accessibilityTraits={accessibilityTraits}
          activeOpacity={activeOpacity || 0.5}
          {...press}
        >
          <View style={[rootStyles.button, style]} {...props} {...pointer}>
            {children}
          </View>
        </TouchableOpacity>
      )
    }

    const ripple = rippleColor === null ? undefined
      : TouchableNativeFeedback.Ripple(rippleColor || 'rgba(0xCF,0xCF,0xCF,0.25)')

    return (
      <TouchableNativeFeedback
        accessibilityComponentType="button"
        background={ripple}
        {...press}
      >
        <View style={[rootStyles.button, style]} {...props} {...pointer}>
          {children}
        </View>
      </TouchableNativeFeedback>
    )
  }

}

const styles = {
  // default button (flat)
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    minHeight: 36,
    minWidth: 64,
    paddingHorizontal: 16,
    borderRadius: iOS ? 5 : 4,
  },
  // default text
  text: {
    alignSelf: 'stretch',
    fontSize: fontSizeButton,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: primaryColor,
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif-medium',
        includeFontPadding: false,
      },
    }),
  },
  // extended styles
  outline: {
    borderWidth: 1.25,
    borderColor: iOS ? primaryColor : borderColor,
  },
  inverse: {
    ...Platform.select({
      android: {
        elevation: 2,
      },
    }),
    backgroundColor: primaryColor,
  },
  // apply borderRadius:0 here?
  block: {
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.65,
  },
}
