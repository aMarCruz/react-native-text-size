// getDerivedStateFromProps in React < 1.6.3
declare module "react-lifecycles-compat" {
  const polyfill: <T>(component: T) => T
  export { polyfill }
}
