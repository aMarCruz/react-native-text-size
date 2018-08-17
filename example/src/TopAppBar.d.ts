/*
  TS proxy
*/
import { Component } from 'react'
import { ImageURISource, ViewProps } from 'react-native'

export type TopAppBarAction = {
  title: string,
  icon?: ImageURISource,
  show?: "always" | "ifRoom" | "never",
  showWithText?: boolean,
}

export interface TopAppBarProps extends ViewProps {
  actions?: TopAppBarAction[];
  logo?: ImageURISource;
  navIcon?: ImageURISource;
  overflowIcon?: ImageURISource;
  rtl?: boolean;
  subtitle?: string;
  subtitleColor?: string;
  testID?: string;
  title?: string;
  titleColor?: string;
  onActionSelected?: (position: number) => void;
  onIconClicked?: () => void;
}

declare class TopAppBar extends Component<TopAppBarProps> {
  constructor()
}

export { TopAppBar }
