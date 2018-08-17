# RNTextSize Tester

Test the behavior of react-native-text-size.

This app is using React Native 0.52.0, the minimal supported version and is writted in Typescript 2.9 with ES2017 sources.

### Install

The package.json in this folder does not include rn-text-size, so you can install it from the sources you want:

* From the parent folder

  Use the script "setup" of the package.json.

  It requires [yarn](https://yarnpkg.com/lang/en/):

  ```bash
  $ yarn setup
  ```

  Note: In this way, rn-text-size will not appear as dependency on package.json.

* Development version

  ```bash
  $ yarn && yarn add aMarCruz/react-native-text-size#dev
  $ react-native link
  ```

Now the setup is done. Run the app as usual.
