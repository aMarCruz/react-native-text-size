declare type PickerItemValue = string | undefined

declare type PickerItems = Array<PickerItemValue>

declare type PickerOptions = {
  style?: any,
  selectedValue?: PickerItemValue,
  enabled?: boolean,
  mode?: 'dialog' | 'dropdown',
  prompt?: string,
  testID?: string,
  items: PickerItems | undefined,
  onValueChange?: (value: any, index: number) => any,
}
