# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## \[Unreleased]

### Added

- Updated README.md with example for flatHeights - Thanks to @donni106

### Changed

- The dependency on android.support.annotations is replaced by javax.annotation

### Fixed

- fix s.source_files regex to match RNTextSize source files: RNTextSize - Thanks to @abegehr

## \[3.0.0] - 2019-01-10

### Added

- Support `textTransform:uppercase` for specsForTextStyles in Android.

### Changed

- peerDependency on react-native to >=57.0
- Update gradle files to be consistent with RN 0.57
- Update License year.

### Removed

- Unused 'example' directory.

## \[2.1.1] - 2019-01-10

### Added

- Markdown lint rules.
- `lineInfoForLine` option, to get information for a given line.

### Changed

- Update Readme.
- Limit peerDependency on RN to v0.56, rnTextSize v3 will support RN>=57

### Fixed

- Linting errors in the markdown of the Changelog and Readme files.

## \[2.0.4] - 2018-09-14

### Changed

- Patch to v2.0.3 published from wrong branch

## \[2.0.3] - 2018-09-14

### Changed

- Updated README

### Fixed

- PR #6 Fix podspec sysntax. Thanks to @Jyrno42

## \[2.0.2] - 2018-08-31

### Changed

- iOS: Give `flatHeights` better performace by avoiding multiple creation of NSTextStorage.
- Android: Now Studio can check versions in android/build.gradle

### Fixed

- Closes #5: Inconsistency in flatHeights between Android and iOS.
- Some error in the README and include note about unlink the previous version.

## \[2.0.1] - 2018-08-22

### Fixed

- Silly typo error in last minute edition.

## \[2.0.0] - 2018-08-22

Bump v2.0.0 :tada:

### Changed

- Code cleanup, minor enhancements.

### Removed

- Removed the `FontSize` constants.

## \[2.0.0-beta.6] - 2018-08-21

### Added

- New function `flatHeights` to calculate the height of multiple strings at once, much faster than `measure`.
- Revised Readme. Now it's clearer, part of its content moved to the Wiki.
- Docummented the iOS-only properties `capHeight` and `xHeight` from the `fontFromSpecs` result.
- New flag `usePreciseWidth` (default `false`) request the most accurate calculation of the width (Android) and the value of `lastWidth` (both), but its is a bit slower.

### Changed

- iOS: The `specsForTextStyles` function returns fontSize amd letterSpacing with unscaled values, to allow its use with `allowFontScaling`.

### Fixed

- Android: `Arguments.fromList` does not exists in RN 0.52, replaced with `Arguments.fromArray`
- iOS: Fix errors in the sample App that prevented it from running in iOS.

### Removed

- To avoid interfering with this changelog, the sample application was moved to its own repository.

## \[2.0.0-beta.4] - Unpublished

**WARNING:**

_The package id has changed, you must uninstall the previous version before using this one._

### Added

- Note on the README of the sample App, to test it with a different version of RN.
- Adds flow typings (almost) working with Flow 0.61.x
- Enhancements to the sample App with RN 0.56 and Flow
- New functions `specsForTextStyles`, `fontFromSpecs`, and `fontFamilyNames`

### Changed

- Complete rewrite of the sample app.
- Simplify anroid/build.gradle and adjust the configuration.
- `allowFontScaling` is handled in the native side, index.js was simplified a lot.
- Migration of example to RN 0.52 and Typescript, enhanced features.
- Minimum supported versions: RN 0.52.x, Android SDK 16, iOS 9.0
- New fformat of the CHANGELOG to follow the _Keep a Changelog_ recommendations.
- Package ID now is `com.github.amarcruz.rntextsize` for Android, and `RNTextSize` for iOS.
- Fixes to typings.

### Removed

- Drop support for iOS 8 and RN below 0.52

### Fixed

- Tested on iOS 9 & 11 simulators, Android devices 5.1 & 7, simulator 4.4 & 11, all with RN 0.52.0 and 0.56.0
- Improved measurement on both platforms, accuracy is more than 5 decimals.
- The iOS API and behavior of `measure` now is the same as Android.
- Makes the example works.

## \[1.0.0-beta.5] - Unpublished

- Preliminary implementation for iOS (thanks to @xuhom)
- The license is changed to BSD 2-Clause as [react-native-measure-text](https://github.com/airamrguez/react-native-measure-text), on which this library is based.

## \[1.0.0-beta.4] - Unpublished

### Changed

- Now the SDK versions are compatible with global rootProject.ext for flexible configuration.

## [1.0.0-beta.3] - 2018-02-17

Published to npm, tested with Android SDK 21.

### Changed

- Updates compileSdkVersion, buildToolsVersion and targetSdkVersion.
- Gradle plugin to 2.3.3

## \[1.0.0-beta.2] - Unpublished

### Changed

- Using ES6 for index.js

### Fixed

- Correction to the default export in the index

## \[1.0.0-alpha.10] - Unpublished

### Changed

- compileSdkVersion 25, buildToolsVersion 25.0.3, targetSdkVersion 25

## \[1.0.0-alpha.9] - Unpublished

### Changed

- Revision to README
- targetSdkVersion from 22 to 23.

### Fixed

- Fix error in android path
- Android package id is 'io.amarcruz.rnmeasuretext'

## \[1.0.0-alpha.8] - Unpublished

### Added

- Suppport for `includeFontPadding`

### Changed

- Using gradle 2.2.3

## \[1.0.0-alpha.7] - Unpublished

### Added

- Returned info includes `lineCount` with the number of lines and `lastLineWidth` with the last line width (Android).
- Uses scaled `fontSize` (with `allowFontScaling`, automatic).

### Changed

- Makes `width` property optional in parameters (Android).
- Minor fixes, now working.
- First commit, Android only.
