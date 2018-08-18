# rnTextSize Tester

Test interactively the behavior of rnTextSize.

This app is using React Native 0.52.0, the minimal supported RN version, and is written in Typescript 2.9 with ES2017 sources.

Please clone the repo and follow the instruction of the [Setup](#setup) section.

If you want to test with a newer version of RN, edit the package.json changing to the desired versions of RN and React.

These are some of the supported ones and the version of React for which it was designed:

React Native | React  | Notes
------------ | ------ | ------------
0.56.0       | 16.4.1 | must change "babel-preset-react-native" to "^5"
0.55.4       | 16.3.1 | my favorite at aug'2018
0.54.4       | 16.3.1 | why not the 0.55?
0.53.3       | 16.2.0 | avoid this
0.52.3       | 16.2.0 | this sample is pre-comfigured for this, do not use in new Apps

### Setup

The package.json in this folder does not include rnTextSize, so you can install it from the sources you want:

* From the parent folder

  Use the script "setup" of the package.json.

  It requires [yarn](https://yarnpkg.com/lang/en/):

  ```bash
  $ yarn setup
  ```

  _Note:_ In this way, react-native-text-size will not appear as dependency on package.json.

* Development version

  ```bash
  $ yarn && yarn add aMarCruz/react-native-text-size#dev
  $ react-native link
  ```

Now the setup is done. Run the app as usual.
