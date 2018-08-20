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

#define _DEBUG 1

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

#define A_SIZE(x) (sizeof (x)/sizeof (x)[0])

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
                             @"button": @([UIFont buttonFontSize]), // 18
                             @"label": @([UIFont labelFontSize]),   // 17
                             @"smallSystem": @([UIFont smallSystemFontSize]),   // 12
                             @"system": @([UIFont systemFontSize]),   // 14
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

  // Allow empty text without generating error
  // TODO: Return the same height as RN.
  if (!text.length) {
    resolve(@{
              @"width": @0,
              @"height": @0,
              @"lastLineWidth": @0,
              @"lineCount": @0,
              });
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

  const CGFloat epsilon = 1 / RCTScreenScale(); // Yoga seems do this
  const CGFloat width = MIN(RCTCeilPixelValue(size.width + 0.001), maxSize.width);
  const CGFloat height = MIN(RCTCeilPixelValue(size.height + epsilon), maxSize.height);
  const CGFloat lineCount = CGRound(size.height / (font.lineHeight + font.leading));

  CGFloat lastLineWidth = 0.0;
  if ([options[@"usePreciseWidth"] boolValue]) {
    const CGFloat lastIndex = layoutManager.numberOfGlyphs - 1;
    const CGSize lastSize = [layoutManager lineFragmentUsedRectForGlyphAtIndex:lastIndex
                                                                effectiveRange:nil].size;
    lastLineWidth = lastSize.width;
  }

  const NSDictionary *result = @{
                                 @"width": @(width),
                                 @"height": @(height),
                                 @"lineCount": @(lineCount),
#if _DEBUG
                                 @"_fontLineHeight": @(font.lineHeight),
                                 @"_rawWidth": @(size.width),
                                 @"_rawHeight": @(size.height),
                                 @"_leading": @(font.leading),
#endif
                                 };
  resolve(result);
}

/**
 * Resolve with an object with info about a font built with the parameters provided by
 * the user. Rejects if the parameters are falsy or the font could not be created.
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
 * Resolves with an array of font info from the predefined iOS Text Styles.
 *
 * NOTE:  The info includes unscaled font size and letterSpacing because this is
 *        managed by the RN `allowFontScaling` property.
 *        The returned size is "Large" (body of 17pt) following the iOS HIG.
 *
 * Altough the technique used to get create the result is complicated to maintain,
 * it simplifies things a lot.
 *
 * @see https://devsign.co/notes/tracking-and-character-spacing
 * @see https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/typography/
 * @see https://useyourloaf.com/blog/auto-adjusting-fonts-for-dynamic-type/
 */
RCT_EXPORT_METHOD(specsForTextStyles:(RCTPromiseResolveBlock)resolve
                            rejecter:(RCTPromiseRejectBlock)reject)
{
  // These are the predefined kerning (1/1000em) to convert into letterSpacing (points)
  static const int T_OFFSET = 10;  // tracking start with fontSize 10
  static const char trackings[] = {
    12, 6, 0, -6, -11, -16, -20, -24, -25, -26,
    19, 17, 16, 16, 15, 14, 14, 13, 13, 13,
    12, 12, 12, 11, 11, 11, 11, 11, 11, 11,
    10, 10, 10, 10, 9, 9, 9, 9, 8, 8,
    7, 7, 7, 6, 6, 6, 5, 5, 5, 5,
    4, 4, 4, 4, 4, 3, 3, 3, 3, 2,
    2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
  };
  // These are the names of the properties to return
  static char *keys[] = {
    "title1", "title2", "title3", "headline",
    "body",  "callout", "subheadline",
    "footnote", "caption1", "caption2",
    "largeTitle",
  };
  // These are the predefined fontSize values of the "Large" size set
  static char sizes[] = {
    28, 22, 20, 17,
    17, 16, 15,
    13, 12, 11,
    34,
  };

  // The largeTitle style is avaiable from iOS 11 only
  UIFontTextStyle textStyleLargeTitle;
  int length = A_SIZE(keys);
  if (@available(iOS 11.0, *)) {
    textStyleLargeTitle = UIFontTextStyleLargeTitle;
  } else {
    textStyleLargeTitle = (id) [NSNull null];
    length--;
  }

  // These are the keys for getting the info with UIKit's preferredFontForTextStyle
  // (I really don't know if we can use NSString* in static arrays).
  NSArray<UIFontTextStyle> *textStyles =
  @[
    UIFontTextStyleTitle1, UIFontTextStyleTitle2, UIFontTextStyleTitle3, UIFontTextStyleHeadline,
    UIFontTextStyleBody, UIFontTextStyleCallout, UIFontTextStyleSubheadline,
    UIFontTextStyleFootnote, UIFontTextStyleCaption1, UIFontTextStyleCaption2,
    textStyleLargeTitle,
  ];

  // ...and with all in place, we are ready to create our result
  NSMutableDictionary *result = [NSMutableDictionary dictionaryWithCapacity:[textStyles count]];

  for (int ix = 0; ix < length; ix++) {
    const UIFontTextStyle textStyle = textStyles[ix];

    const UIFont *font = [UIFont preferredFontForTextStyle:textStyle];
    const UIFontDescriptor *descriptor = font.fontDescriptor;
    const NSDictionary *traits = [descriptor objectForKey:UIFontDescriptorTraitsAttribute];

    const NSString *fontFamily = font.familyName ?: font.fontName ?: (id) [NSNull null];
    const NSArray *fontVariant = [RNTextSize fontVariantFromDescriptor:descriptor];
    const NSString *fontStyle  = [RNTextSize fontStyleFromTraits:traits];
    const NSString *fontWeight = [RNTextSize fontWeightFromTraits:traits];

    // The standard font size for this style is also used to calculate letterSpacing
    const int fontSize = sizes[ix];
    const int index = fontSize - T_OFFSET;
    const int tracking = index >= 0 && index < A_SIZE(trackings) ? trackings[index] : 0;
    const CGFloat letterSpacing = fontSize * tracking / 1000.0;

    NSMutableDictionary *value = [[NSMutableDictionary alloc]
                                  initWithObjectsAndKeys:fontFamily, @"fontFamily",
                                  @(fontSize), @"fontSize",
                                  @(letterSpacing), @"letterSpacing",
                                  nil];
    if (![fontWeight isEqualToString:@"normal"]) {
      [value setValue:fontWeight forKey:@"fontWeight"];
    }
    if (![fontStyle isEqualToString:@"normal"]) {
      [value setValue:fontStyle forKey:@"fontStyle"];
    }
    if (fontVariant) {
      [value setValue:fontVariant forKey:@"fontVariant"];
    }

    [result setValue:value forKey:@(keys[ix])];
  }

  resolve(result);
}

/**
 * Resolve with an array of font family names available on the system.
 */
RCT_EXPORT_METHOD(fontFamilyNames:(RCTPromiseResolveBlock)resolve
                         rejecter:(RCTPromiseRejectBlock)reject)
{
  NSArray<NSString *> *fonts = [UIFont.familyNames
                                sortedArrayUsingSelector:@selector(localizedCaseInsensitiveCompare:)];
  resolve(fonts);
}

/**
 * Resolve with an array of font names available in a particular font family.
 * Reject if the name is falsy or the names could not be obtain.
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

/**
 * Create a font based on the given specs.
 *
 * TODO: implement the following behavior:
 * This method is used instead of [RCTConvert UIFont] to support the omission
 * of scaling when a custom delegate has been defined for font's creation.
 */
+ (UIFont * _Nullable)UIFontFromUserSpecs:(const NSDictionary *)specs
                               withBridge:(const RCTBridge *)bridge
{
  const id allowFontScalingSrc = specs[@"allowFontScaling"];
  const BOOL allowFontScaling = allowFontScalingSrc == nil ? YES : [allowFontScalingSrc boolValue];
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
 * The keys in the returned dictionary are a superset of the RN Text styles
 * so the format is not fully compatible.
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

/**
 * Reads the font weight of a trait and returns a string with the representation
 * of the weight in multiples of "100", as expected by RN, or one of the words
 * "bold" or "normal" if appropiate.
 *
 * @param trais NSDictionary with the traits of the font.
 * @return NSString with the weight of the font.
 */
+ (NSString *)fontWeightFromTraits:(const NSDictionary *)traits
{
  // Use a small tolerance to avoid rounding problems
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

/**
 * Returns a string with the style found in the trait, either "normal" or "italic".
 *
 * @param trais NSDictionary with the traits of the font.
 * @return NSString with the style.
 */
+ (NSString *)fontStyleFromTraits:(const NSDictionary *)traits
{
  const UIFontDescriptorSymbolicTraits symbolicTrais = [traits[UIFontSymbolicTrait] unsignedIntValue];
  const BOOL isItalic = (symbolicTrais & UIFontDescriptorTraitItalic) != 0;

  return isItalic ? @"italic" : @"normal";
}

/**
 * Parses a font descriptor and returns a fontVariant array as expected by RN.
 *
 * @param descriptor with the features of the font
 * @return NSArray of NSString with variants, or nil if none was found.
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

  // Use a C array to store the result temporarily
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

  // Returns an array only if found variants, to preserve memory
  return count ? [NSArray arrayWithObjects:outArr count:count] : nil;
}

@end
