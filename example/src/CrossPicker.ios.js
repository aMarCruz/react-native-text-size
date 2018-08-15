// @ts-check
import React from 'react'
import { ActionSheetIOS, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { polyfill } from 'react-lifecycles-compat'

/**
 * @typedef {Object} State
 * @prop {string} title - Button text
 * @prop {PickerItemValue} prevValue - For getDerivedStateFromProps
 */

const _noop = () => {}

/**
 * Simple component Text that responds to touches w/an UIActionSheet.
 * PickerAndroid equivalent.
 *
 * @augments {React.PureComponent<PickerOptions>}
 */
class CrossPicker extends React.PureComponent {

  /* @type State */
  state = { title: '', prevValue: '' }

  /**
   * Any time the value changes, reset the state.
   * @param {PickerOptions} props
   * @param {State} state
   */
  static getDerivedStateFromProps (props, state) {
    const newValue = props.selectedValue

    if (newValue !== state.prevValue) {
      const items = props.items || []
      const index = items.length ? items.indexOf(newValue) : -1
      const title = index < 0 ? ''
        : items[index] === undefined ? '(undefined)' : String(items[index])

      return { title, prevValue: newValue }
    }

    return null
  }

  /**
   * @param {number} index Selected item
   */
  _onItemPress = (index) => {
    const { items, onValueChange } = this.props

    if (items && index >= 0 && index < items.length && onValueChange) {
      onValueChange(items[index], index)
    }
  }

  /**
   * Open the ActionSheet, ignore if no items
   */
  _onPress = () => {
    const { items, prompt } = this.props

    if (items && items.length) {
      const options = items.map((str) => {
        return str === undefined ? '(undefined)' : String(str)
      })
      options.push('Cancel')
      const conf = {
        options,
        cancelButtonIndex: options.length - 1,
        title: prompt,
      }

      ActionSheetIOS.showActionSheetWithOptions(conf, this._onItemPress)
    }
  }

  render () {
    const { title } = this.state
    const { style, enabled } = this.props

    return (
      <TouchableOpacity
        style={[styles.outerBox, style]}
        onPress={enabled === false ? _noop : this._onPress}
      >
        <View style={styles.innerBox}>
          <Text
            style={styles.textButton}
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text style={styles.downArrow}>{'\u2304'}</Text>
        </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  outerBox: {
    flexGrow: 1,
  },
  innerBox: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  textButton: {
    alignSelf: 'flex-start',
  },
  downArrow: {
    alignSelf: 'flex-end',
    fontFamily: 'Arial',
    color: 'black',
  },
})

polyfill(CrossPicker)
export { CrossPicker }
