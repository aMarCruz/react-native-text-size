import React from 'react'
import {
  StatusBar,
  StyleSheet,
  ToolbarAndroid,
} from 'react-native'
import { primaryColor, primaryDarkColor, TOPBAR_HEIGHT } from './constants'

// typings
import { TopAppBarProps } from './TopAppBar'
type Props = TopAppBarProps

let topBarSet = false

export const TopAppBar = (props: Props) => {

  const { style, titleColor, ...other } = props

  if (!topBarSet) {
    topBarSet = true
    StatusBar.setBackgroundColor(primaryDarkColor, true)
    StatusBar.setTranslucent(false)
  }

  return (
    <ToolbarAndroid
      titleColor={titleColor || '#fff'}
      {...other}
      style={[styles.barRegular, style]}
    />
  )
}

const styles = StyleSheet.create({
  barRegular: {
    position: 'relative',
    alignSelf: 'stretch',
    left: 0,
    right: 0,
    height: TOPBAR_HEIGHT,
    backgroundColor: primaryColor,
    elevation: 8,
  },
  topbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    backgroundColor: primaryColor,
  },
})
