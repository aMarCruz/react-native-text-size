import React from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { primaryColor, fontSizeButton, TOPBAR_HEIGHT, titleColor } from './constants'

// typings
import { TopAppBarAction, TopAppBarProps } from './TopAppBar'
type Props = TopAppBarProps

const HITSLOP = { top: 6, right: 4, bottom: 6, left: 4 }
const _noop = () => {}

class TopAppBar extends React.Component<Props> {
  renderTitle() {
    const { title, titleColor } = this.props
    if (!title) {
      return null
    }
    const colorStyle = titleColor ? { color: titleColor } : undefined

    return (
      <View style={styles.titleContainer}>
        <Text
          numberOfLines={1}
          style={[styles.titleText, colorStyle]}>
          {title}
        </Text>
      </View>
    )
  }

  renderButton (button: TopAppBarAction, index: number) {
    const { props } = this
    if (!props) {
      return null
    }
    const { style, onActionSelected } = props
    const btnPress = onActionSelected ? () => { onActionSelected(index) } : _noop

    return (
      <TouchableOpacity
        style={styles.btnContainer}
        onPress={btnPress}
        hitSlop={HITSLOP}
      >
        <View style={style}>
          <Text
            numberOfLines={1}
            style={styles.btnText}
          >{button.title}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  render () {
    const {
      actions,
      titleColor,
      style,
    } = this.props;
    const colorStyle = titleColor ? { backgroundColor: titleColor } : undefined

    return (
      <View style={[styles.navBarContainer, colorStyle]}>
        <View style={[styles.navBar, style]}>
          {this.renderTitle()}
          {actions && actions.map(this.renderButton)}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  navBarContainer: {
    backgroundColor: 'white',
  },
  navBar: {
    height: TOPBAR_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  titleContainer: {
    position: 'absolute',
    left: 48,
    right: 48,
    top: 0,
    bottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    color: titleColor,
    fontSize: fontSizeButton,
    fontWeight: '600',
    letterSpacing: 0.41,
  },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: fontSizeButton,
    letterSpacing: 0.5,
    color: primaryColor,
  },
})

export { TopAppBar }
