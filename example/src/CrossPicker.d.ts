/*
  TS proxy
*/
import * as React from 'react'

export type PickerItemValue = string | undefined
export type PickerItems = Array<PickerItemValue>
export type PickerOptions = {
  style?: any,
  selectedValue?: PickerItemValue,
  enabled?: boolean,
  mode?: 'dialog' | 'dropdown',
  prompt?: string,
  testID?: string,
  items: PickerItems | undefined,
  onValueChange?: (value: any, index: number) => any,
}

declare class CrossPicker extends React.Component<PickerOptions> {
  constructor()
}

export { CrossPicker }
