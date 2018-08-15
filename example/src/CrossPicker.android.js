// @ts-check
import React from 'react'
import { Picker } from 'react-native'

/**
 * Render the items.
 * @param {PickerItems} items
 */
const renderItems = (items) => {
  // $FlowSucks ...come on
  return items.map((str) => {
    const name = str === undefined ? '(undefined)' : String(str)
    return  <Picker.Item key={`key-${name}`} label={name} value={str} />
  })
}

/**
 * Wrapper for PickerAndroid
 * @param {PickerOptions} props
 */
export const CrossPicker = (props) => {
  const { items, ...pickerProps } = props
  return (
    <Picker mode="dropdown" {...pickerProps}>
      {items && renderItems(items)}
    </Picker>
  )
}
