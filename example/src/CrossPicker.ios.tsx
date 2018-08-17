import React from 'react'
import { ActionSheetIOS, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { polyfill } from 'react-lifecycles-compat'
import { defaultFontSize } from './constants'

// typings
import { PickerOptions, PickerItemValue } from './CrossPicker'

type Props = PickerOptions
type State = { title: string, prevValue: PickerItemValue }

const _noop = () => {}

/**
 * Simple component Text that responds to touches w/an UIActionSheet.
 * PickerAndroid equivalent.
 */
class CrossPicker extends React.PureComponent<PickerOptions, State> {

  state = { title: '', prevValue: '' }

  /**
   * Any time the value changes, reset the state.
   */
  static getDerivedStateFromProps (props: Props, state: State) {
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
   * User pressed an item
   */
  _onItemPress = (index: number) => {
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
            {this.state.title}
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
    fontSize: defaultFontSize,
    color: 'black',
  },
})

polyfill(CrossPicker)
export { CrossPicker }
