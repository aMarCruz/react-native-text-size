#if __has_include(<React/RCTConvert.h>)
#import <React/RCTConvert.h>
#import <React/RCTFont.h>
#import <React/RCTLog.h>
#import <React/RCTUtils.h>
#else
#import "React/RCTConvert.h"   // Required when used as a Pod in a Swift project
#import "React/RCTFont.h"
#import "React/RCTLog.h"
#import "React/RCTUtils.h"
#endif

#import <CoreText/CoreText.h>
#import "RNTextSize.h"

#define _DEBUG_THIS 1

static NSString *const E_MISSING_TEXT = @"E_MISSING_TEXT";
static NSString *const E_INVALID_FONT_SPEC = @"E_INVALID_FONT_SPEC";
static NSString *const E_INVALID_TEXTSTYLE = @"E_INVALID_TEXTSTYLE";
static NSString *const E_INVALID_FONTFAMILY = @"E_INVALID_FONTFAMILY";

static inline BOOL isNull(id str) {
  return !str || str == (id) kCFNull;
}

static inline CGFloat CGFloatValueFrom(NSNumber * _Nullable num) {
#if CGFLOAT_IS_DOUBLE
  return num ? num.doubleValue : NAN;
#else
  return num ? num.floatValue : NAN;
#endif
}

#if CGFLOAT_IS_DOUBLE
#define CGRound round
#else
#define CGRound roundf
#endif

/*
 * 2018-08-14 by aMarCruz: First working version, tested in RN 0.56
 */
@implementation RNTextSize

RCT_EXPORT_MODULE();

@synthesize bridge = _bridge;

// Because the exported constants
+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

/*
  Is RN exposing its default font size? Try to get a UIFont here warnings
  "Required dispatch_sync to load constants ...This may lead to deadlocks"
  as in https://github.com/facebook/react-native/issues/16376
 */
- (NSDictionary *)constantsToExport {
  // iOS standard sizes
  NSDictionary *fontSize = @{
                             @"default": @(14),
                             @"button": @([UIFont buttonFontSize]),
                             @"label": @([UIFont labelFontSize]),
                             @"smallSystem": @([UIFont smallSystemFontSize]),
                             @"system": @([UIFont systemFontSize]),
                             };
  return @{@"FontSize": fontSize};
}

/**
 * Gets the width, height, line count and last line width for the provided text
 * font specifications.
 * Based on `RCTTextShadowViewMeasure` of Libraries/Text/Text/RCTTextShadowView.m
 */
RCT_EXPORT_METHOD(measure:(NSDictionary * _Nullable)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  // RCTConvert will return nil if the `options` object was not received.
  NSString *const _Nullable text = [RCTConvert NSString:options[@"text"]];
  if (isNull(text)) {
    reject(E_MISSING_TEXT, @"Missing required text.", nil);
    return;
  }

  // We cann't use RCTConvert since it does not handle font scaling and RN
  // does not scale the font if a custom delegate has been defined to create.
  //UIFont * _Nullable font = [RCTConvert UIFont:options];
  UIFont *const _Nullable font = [RNTextSize UIFontFromUserSpecs:options withBridge:_bridge];
  if (!font) {
    reject(E_INVALID_FONT_SPEC, @"Invalid font specification.", nil);
    return;
  }

  // Allows empty text here
  if (!text.length) {
    resolve(@{
              @"width": @0,
              @"height": @(font.pointSize),
              @"lineCount": @0,
              @"lineHeight": @(font.lineHeight),
              });
    return;
  }

  // Allow the user to specify the width or height (both optionals).
  const CGFloat optWidth = CGFloatValueFrom(options[@"width"]);
  const CGFloat maxWidth = isnan(optWidth) || isinf(optWidth) ? CGFLOAT_MAX : optWidth;
  const CGSize maxSize = CGSizeMake(maxWidth, CGFLOAT_MAX);

  // Create attributes for the font and the optional letter spacing.
  const CGFloat letterSpacing = CGFloatValueFrom(options[@"letterSpacing"]);
  NSDictionary<NSAttributedStringKey,id> *const attributes = isnan(letterSpacing)
  ? @{NSFontAttributeName: font}
  : @{NSFontAttributeName: font, NSKernAttributeName: @(letterSpacing)};

  NSTextContainer *textContainer = [[NSTextContainer alloc] initWithSize:maxSize];
  textContainer.lineFragmentPadding = 0.0;
  textContainer.lineBreakMode = NSLineBreakByClipping; // no maxlines support

  NSLayoutManager *layoutManager = [NSLayoutManager new];
  [layoutManager addTextContainer:textContainer];
  layoutManager.allowsNonContiguousLayout = YES;      // 'cause lastLineWidth

  NSTextStorage *textStorage = [[NSTextStorage alloc] initWithString:text attributes:attributes];
  [textStorage addLayoutManager:layoutManager];

  [layoutManager ensureLayoutForTextContainer:textContainer];
  CGSize size = [layoutManager usedRectForTextContainer:textContainer].size;
  if (!isnan(letterSpacing) && letterSpacing < 0) {
    size.width -= letterSpacing;
  }

  const CGFloat epsilon = 1 / RCTScreenScale();
  const CGFloat width = MIN(RCTCeilPixelValue(size.width + 0.001), maxSize.width);
  const CGFloat height = MIN(RCTCeilPixelValue(size.height + epsilon), maxSize.height);

  const CGFloat lastIndex = layoutManager.numberOfGlyphs - 1;
  const CGSize lastSize = [layoutManager lineFragmentUsedRectForGlyphAtIndex:lastIndex
                                                              effectiveRange:nil].size;
  const CGFloat lastLineWidth = lastSize.width;
  const CGFloat lineCount = CGRound(size.height / font.lineHeight);

  const NSDictionary *result = @{
                                 @"width": @(width),
                                 @"height": @(height),
                                 @"lastLineWidth": @(lastLineWidth),
                                 @"lineCount": @(lineCount),
#if _DEBUG_THIS
                                 @"_fontLineHeight": @(font.lineHeight),
                                 @"_rawWidth": @(size.width),
                                 @"_rawHeight": @(size.height),
                                 @"_leading": @(font.leading),
                                 @"_descender": @(font.descender),
#endif
                                 };
  resolve(result);
}

/**
 * Returns the font info for one of the predefined iOS Text Styles.
 *
 * @see https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/typography/
 * @see https://useyourloaf.com/blog/auto-adjusting-fonts-for-dynamic-type/
 */
RCT_EXPORT_METHOD(specsForTextStyles:(RCTPromiseResolveBlock)resolve
                            rejecter:(RCTPromiseRejectBlock)reject)
{
  UIFontTextStyle textStyleLargeTitle;
  if (@available(iOS 11.0, *)) {
    textStyleLargeTitle = UIFontTextStyleLargeTitle;
  } else {
    textStyleLargeTitle = [NSNull null];
  }

  NSDictionary<NSString *, UIFontTextStyle>
  *const textStyles = @{
                        @"body": UIFontTextStyleBody,
                        @"callout": UIFontTextStyleCallout,
                        @"caption1": UIFontTextStyleCaption1,
                        @"caption2": UIFontTextStyleCaption2,
                        @"footnote": UIFontTextStyleFootnote,
                        @"headline": UIFontTextStyleHeadline,
                        @"subheadline": UIFontTextStyleSubheadline,
                        @"largeTitle": textStyleLargeTitle,
                        @"title1": UIFontTextStyleTitle1,
                        @"title2": UIFontTextStyleTitle2,
                        @"title3": UIFontTextStyleTitle3,
                        };
  NSMutableDictionary *result = [NSMutableDictionary dictionaryWithCapacity:[textStyles count]];

  for (NSString *key in textStyles) {
    const UIFontTextStyle textStyle = textStyles[key];
    if (!textStyle) {
      continue;
    }
    const UIFont *font = [UIFont preferredFontForTextStyle:textStyle];
    const UIFontDescriptor *descriptor = font.fontDescriptor;
    const NSDictionary *traits = [descriptor objectForKey:UIFontDescriptorTraitsAttribute];

    const NSArray *fontVariant = [RNTextSize fontVariantFromDescriptor:descriptor];
    const id null = [NSNull null];

    NSDictionary *specs = @{
                            @"fontFamily": font.familyName ?: null,
                            @"fontSize": @(font.pointSize),
                            @"fontStyle": [RNTextSize fontStyleFromTraits:traits],
                            @"fontWeight": [RNTextSize fontWeightFromTraits:traits],
                            @"fontVariant": fontVariant ?: null,
                            };
    [result setValue:specs forKey:key];
  }

  resolve(result);
}

/**
 * Returns info from a font built with the parameters provided by the user.
 */
RCT_EXPORT_METHOD(fontFromSpecs:(NSDictionary *)specs
                       resolver:(RCTPromiseResolveBlock)resolve
                       rejecter:(RCTPromiseRejectBlock)reject)
{
  if (isNull(specs)) {
    reject(E_INVALID_FONT_SPEC, @"Missing font specification.", nil);
  } else {
    UIFont * _Nullable font = [RNTextSize UIFontFromUserSpecs:specs withBridge:_bridge];
    if (font) {
      resolve([RNTextSize fontInfoFromUIFont:font]);
    } else {
      reject(E_INVALID_FONT_SPEC, @"Invalid font specification.", nil);
    }
  }
}

/**
 * Returns an array of font family names available on the system.
 */
RCT_EXPORT_METHOD(fontFamilyNames:(RCTPromiseResolveBlock)resolve
                         rejecter:(RCTPromiseRejectBlock)reject)
{
  NSArray<NSString *> *fonts = [UIFont.familyNames
                                sortedArrayUsingSelector:@selector(localizedCaseInsensitiveCompare:)];
  resolve(fonts);
}

/**
 * Returns an array of font names available in a particular font family.
 */
RCT_EXPORT_METHOD(fontNamesForFamilyName:(NSString * _Nullable)fontFamily
                                resolver:(RCTPromiseResolveBlock)resolve
                                rejecter:(RCTPromiseRejectBlock)reject)
{
  if (isNull(fontFamily)) {
    reject(E_INVALID_FONTFAMILY, @"Missing fontFamily name.", nil);
  } else {
    NSArray<NSString *> *fontNames = [UIFont fontNamesForFamilyName:fontFamily];
    if (fontNames) {
      resolve(UIFont.familyNames);
    } else {
      reject(E_INVALID_FONTFAMILY, @"Invalid fontFamily name.", nil);
    }
  }
}

//
// ============================================================================
//  Non-exposed instance & static methods
// ============================================================================
//

#if _DEBUG_THIS
- (CGSize)getLineCountAndLastLineWidth:(NSLayoutManager *)layoutManager {
  NSRange lineRange;
  CGRect lastLineRect = CGRectZero;
  CGFloat glyphCount = layoutManager.numberOfGlyphs;
  NSUInteger numberOfLines = 0;

  for (NSInteger index = 0; index < glyphCount; numberOfLines++) {
    lastLineRect = [layoutManager lineFragmentRectForGlyphAtIndex:index effectiveRange:&lineRange];
    index = NSMaxRange(lineRange);
  }

  return CGSizeMake(lastLineRect.size.width, numberOfLines);
}
#endif

/**
 * Get a font based on the given specs.
 *
 * This method is used instead of [RCTConvert UIFont] to support the omission
 * of scaling when a custom delegate has been defined for font's creation.
 */
+ (UIFont * _Nullable)UIFontFromUserSpecs:(const NSDictionary *)specs
                               withBridge:(const RCTBridge *)bridge
{
  const BOOL allowFontScaling =
  specs[@"allowFontScaling"] == nil ? YES : [specs[@"allowFontScaling"] boolValue];
  const CGFloat scaleMultiplier =
  allowFontScaling && bridge ? bridge.accessibilityManager.multiplier : 1.0;

  return [RCTFont updateFont:nil
                  withFamily:[RCTConvert NSString:specs[@"fontFamily"]]
                        size:[RCTConvert NSNumber:specs[@"fontSize"]]
                      weight:[RCTConvert NSString:specs[@"fontWeight"]]
                       style:[RCTConvert NSString:specs[@"fontStyle"]]
                     variant:[RCTConvert NSStringArray:specs[@"fontVariant"]]
             scaleMultiplier:scaleMultiplier];
}

/**
 * Create the font info that will be returned by other methods.
 */
+ (NSDictionary *)fontInfoFromUIFont:(const UIFont *)font
{
  const UIFontDescriptor *descriptor = font.fontDescriptor;
  const NSDictionary *traits = [descriptor objectForKey:UIFontDescriptorTraitsAttribute];
  const NSArray *fontVariant = [self fontVariantFromDescriptor:descriptor];
  const id null = [NSNull null];

  return @{
           @"fontFamily": font.familyName ?: null,
           @"fontName": font.fontName ?: null,
           @"fontSize": @(font.pointSize),
           @"fontStyle": [self fontStyleFromTraits:traits],
           @"fontWeight": [self fontWeightFromTraits:traits],
           @"fontVariant": fontVariant ?: null,
           @"ascender": @(font.ascender),
           @"descender": @(font.descender),
           @"capHeight": @(font.capHeight),   // height of capital characters
           @"xHeight": @(font.xHeight),       // height of lowercase "x"
           @"leading": @(font.leading),       // additional space between lines
           @"lineHeight": @(font.lineHeight),
           @"_hash": @(font.hash),
           };
}

+ (NSString *)fontWeightFromTraits:(const NSDictionary *)traits
{
  const CGFloat weight = CGFloatValueFrom(traits[UIFontWeightTrait]) + 0.01;

  return (weight >= UIFontWeightBlack) ? @"900"
  : (weight >= UIFontWeightHeavy) ? @"800"
  : (weight >= UIFontWeightBold) ? @"bold"
  : (weight >= UIFontWeightSemibold) ? @"600"
  : (weight >= UIFontWeightMedium) ? @"500"
  : (weight >= UIFontWeightRegular) ? @"normal"
  : (weight >= UIFontWeightLight) ? @"300"
  : (weight >= UIFontWeightThin) ? @"200" : @"100"; // UIFontWeightUltraLight
}

+ (NSString *)fontStyleFromTraits:(const NSDictionary *)traits
{
  const UIFontDescriptorSymbolicTraits symbolicTrais = [traits[UIFontSymbolicTrait] unsignedIntValue];
  const BOOL isItalic = (symbolicTrais & UIFontDescriptorTraitItalic) != 0;

  return isItalic ? @"italic" : @"normal";
}

/**
 * Get font info for one of the predefined iOS Text Styles.
 *
 * FIXME:
 * kNumberCase variants are not being recognized... RN bug?
 */
+ (NSArray<NSString *> * _Nullable)fontVariantFromDescriptor:(const UIFontDescriptor *)descriptor
{
  const NSArray *features = descriptor.fontAttributes[UIFontDescriptorFeatureSettingsAttribute];
  if (isNull(features)) {
    return nil;
  }
  const NSString *outArr[features.count];
  NSUInteger count = 0;

  for (NSDictionary *item in features) {
    const NSNumber *type = item[UIFontFeatureTypeIdentifierKey];
    if (type) {
      const int value = (int) [item[UIFontFeatureSelectorIdentifierKey] longValue];

      switch (type.integerValue) {
        case kLowerCaseType:
          if (value == kLowerCaseSmallCapsSelector) {
            outArr[count++] = @"small-caps";
          }
          break;
        case kNumberCaseType:
          if (value == kLowerCaseNumbersSelector) {
            outArr[count++] = @"oldstyle-nums";
          } else if (value == kUpperCaseNumbersSelector) {
            outArr[count++] = @"lining-nums";
          }
          break;
        case kNumberSpacingType:
          if (value == kMonospacedNumbersSelector) {
            outArr[count++] = @"tabular-nums";
          } else if (value == kProportionalNumbersSelector) {
            outArr[count++] = @"proportional-nums";
          }
          break;
      }
    }
  }

  return count ? [NSArray arrayWithObjects:outArr count:count] : nil;
}

@end
