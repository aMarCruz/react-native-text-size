import React from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { primaryColor, fontSizePageTitle, TOPBAR_HEIGHT, titleColor, fontSizePrimaryText } from './constants'

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
      <Text
        numberOfLines={1}
        style={[styles.titleText, colorStyle]}>
        {title}
      </Text>
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
    alignSelf: 'stretch',
    paddingTop: 20,
    height: 20 + TOPBAR_HEIGHT,
    backgroundColor: 'white',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: TOPBAR_HEIGHT,
    maxHeight: TOPBAR_HEIGHT,
  },
  titleText: {
    color: titleColor,
    fontSize: fontSizePageTitle,
    fontWeight: '600',
    letterSpacing: 0.41,
  },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: fontSizePrimaryText,
    letterSpacing: 0.5,
    color: primaryColor,
  },
})

export { TopAppBar }
