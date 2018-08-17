import React from 'react'
import { Picker } from 'react-native'

// typings
import { PickerItems, PickerOptions } from './CrossPicker'

/**
 * Render the items.
 */
const renderItems = (items: PickerItems) => {
  return items.map((str) => {
    const name = str === undefined ? '(undefined)' : String(str)
    return  <Picker.Item key={`key-${name}`} label={name} value={str} />
  })
}

/**
 * Simple wrapper for PickerAndroid
 */
export const CrossPicker = (props: PickerOptions) => {
  const { items, ...pickerProps } = props
  return (
    <Picker mode="dropdown" {...pickerProps}>
      {items && renderItems(items)}
    </Picker>
  )
}
