#if __has_include(<React/RCTConvert.h>)
#import <React/RCTConvert.h>
#import <React/RCTFont.h>
#import <React/RCTLog.h>
#else
#import "React/RCTConvert.h"   // Required when used as a Pod in a Swift project
#import "React/RCTFont.h"
#import "React/RCTLog.h"
#endif

#import <CoreText/CoreText.h>
#import "RNTextSize.h"

#define _DEBUG_THIS 1

static NSString *const E_MISSING_TEXT = @"E_MISSING_TEXT";
static NSString *const E_INVALID_FONT_SPEC = @"E_INVALID_FONT_SPEC";
static NSString *const E_INVALID_TEXTSTYLE = @"E_INVALID_TEXTSTYLE";
static NSString *const E_INVALID_FONTFAMILY = @"E_INVALID_FONTFAMILY";

static inline BOOL isNull(id str) {
  return !str || str == (id)kCFNull;
}

static inline CGFloat CGFloatValueFrom(NSNumber * _Nullable num) {
#if CGFLOAT_IS_DOUBLE
  return num ? num.doubleValue : NAN;
#else
  return num ? num.floatValue : NAN;
#endif
}

#if CGFLOAT_IS_DOUBLE
#define CGAbs fabs
#define CGCeil ceil
#define CGRound round
#else
#define CGAbs fabsf
#define CGCeil ceilf
#define CGRound roundf
#endif

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
 */
RCT_EXPORT_METHOD(measure:(NSDictionary * _Nullable)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  // RCTConvert will return nil if the `options` object was not received.
  NSString * _Nullable text = [RCTConvert NSString:options[@"text"]];
  if (isNull(text)) {
    reject(E_MISSING_TEXT, @"Missing required text.", nil);
    return;
  }

  // We cann't use RCTConvert since it does not handle font scaling and RN
  // does not scale the font if a custom delegate has been defined to create.
  //UIFont * _Nullable font = [RCTConvert UIFont:options];
  UIFont * _Nullable font = [RNTextSize UIFontFromUserSpecs:options withBridge:_bridge];
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

  // Create attributes for the font and the optional letter spacing.
  // RCTConvert returns 0 for undefined CGFloats, so first test if we have
  // the `letterSpacing` parameter.
  CGFloat letterSpacing = CGFloatValueFrom(options[@"letterSpacing"]);
  NSDictionary<NSAttributedStringKey,id> *attributes = isnan(letterSpacing)
  ? @{NSFontAttributeName: font}
  : @{NSFontAttributeName: font, NSKernAttributeName: @(letterSpacing)};

  // Allow the user to specify the width or height (both optionals).
  CGFloat maxWidth = [RCTConvert CGFloat:options[@"width"]] ?: CGFLOAT_MAX;
  CGFloat maxHeight = [RCTConvert CGFloat:options[@"height"]] ?: CGFLOAT_MAX;
  CGSize maxSize = CGSizeMake(maxWidth, maxHeight);

  // Create and initialize the objects needed to measure the text.
  // See `RCTTextShadowViewMeasure` in Libraries/Text/Text/RCTTextShadowView.m
  // mybe we need to use `lastBaselineForSize` as well.

  NSTextContainer *textContainer = [[NSTextContainer alloc] initWithSize:maxSize];
  textContainer.lineFragmentPadding = 0.0;
  textContainer.lineBreakMode = NSLineBreakByClipping; // no maxlines support

  NSLayoutManager *layoutManager = [NSLayoutManager new];
  layoutManager.allowsNonContiguousLayout = YES;      // 'cause lastLineWidth
  [layoutManager addTextContainer:textContainer];

  NSTextStorage *textStorage = [[NSTextStorage alloc] initWithString:text attributes:attributes];
  [textStorage addLayoutManager:layoutManager];
  [layoutManager ensureLayoutForTextContainer:textContainer];

  CGSize size = [layoutManager usedRectForTextContainer:textContainer].size;
  if (!isnan(letterSpacing) && letterSpacing < 0) {
    size.width -= letterSpacing;
  }

  // TODO:
  // Check if `numberOfLines` is consistent with the size.height/font.lineHeight
  // calculation, especially with several paragrpahs and fonts like Zapfino.
  //
#if _DEBUG_THIS
  CGSize tempSize = [getLineCountAndLastLineWidth layoutManager];
  CGFloat numberOfLines = tempSize.height;
#else
  NSRange lineRange;
  CGSize tempSize = [layoutManager
    lineFragmentUsedRectForGlyphAtIndex:lastIndex effectiveRange:&lineRange].size;
#endif
  CGFloat lastLineWidth = tempSize.width;

  CGFloat const epsilon = 0.49; // `lastBaselineForSize` here?
  CGFloat width = MIN(RCTCeilPixelValue(size.width + epsilon), maxWidth);
  CGFloat height = RCTCeilPixelValue(size.height + epsilon);
  CGFloat lineCount = CGRound(size.height / font.lineHeight);

  NSDictionary *result = @{
                           @"width": @(width),
                           @"height": @(height),
                           @"lastLineWidth": @(lastLineRect.size.width),
                           @"lineCount": @(lineCount),
                           @"lineHeight": @(font.lineHeight),
#if _DEBUG_THIS
                           @"_rawWidth": @(size.width),
                           @"_rawHeight": @(size.height),
                           @"_lineCount": @(numberOfLines),
                           @"_leading": @(font.leading),
#endif
                           };
  resolve(result);
}

/**
 * Returns the font info for one of the predefined iOS Text Styles.
 *
 * @warning Fonts with larger accessibility sizes might not be in sync w/RN.
 *
 * @see https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/typography/
 * @see https://useyourloaf.com/blog/auto-adjusting-fonts-for-dynamic-type/
 */
RCT_EXPORT_METHOD(specsForTextStyles:
                          resolver:(RCTPromiseResolveBlock)resolve
                          rejecter:(RCTPromiseRejectBlock)reject)
{
  NSString * textStyleCode = @"body";
  UIFontTextStyle textStyle = [RNTextSize UITextStyleFromJSCode:textStyleCode];
  if (textStyle) {
    UIFont *font = [UIFont preferredFontForTextStyle:textStyleCode];
    resolve([RNTextSize fontInfoFromUIFont:font]);
  } else {
    reject(E_INVALID_TEXTSTYLE, @"Invalid text style.", nil);
  }
}

/**
 * Returns info from a font built from the parameters provided by the user.
 */
RCT_EXPORT_METHOD(fontFromSpecs:(NSDictionary *)specs
                       resolver:(RCTPromiseResolveBlock)resolve
                       rejecter:(RCTPromiseRejectBlock)reject)
{
  if (specs) {
    UIFont * _Nullable font = [RNTextSize UIFontFromUserSpecs:specs withBridge:_bridge];
    if (font) {
      resolve([RNTextSize fontInfoFromUIFont:font]);
    } else {
      reject(E_INVALID_FONT_SPEC, @"Invalid font specification.", nil);
    }
  } else {
    reject(E_INVALID_FONT_SPEC, @"Missing font specification.", nil);
  }
}

/**
 * Returns an array of font family names available on the system.
 */
RCT_EXPORT_METHOD(fontFamilyNames:(RCTPromiseResolveBlock)resolve
                            rejecter:(RCTPromiseRejectBlock)reject)
{
  resolve(UIFont.familyNames);
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
      reject(E_INVALID_FONTFAMILY, @"Invalid fontFamily name.");
    }
  }
}

//
// ============================================================================
//  Non-exposed instance & static methods
// ============================================================================
//

#if _DEBUG_THIS
- (GCSize)getLineCountAndLastLineWidth:(NSLayoutManager *)layoutManager {
  static NSRange const lineRange;
  CGFloat lastIndex = layoutManager.numberOfGlyphs - 1;
  CGRect lastLineRect;
  NSUInteger index, numberOfLines;

  for (index = numberOfLines = 0; index <= lastIndex; numberOfLines++) {
    lastLineRect = [layoutManager lineFragmentRectForGlyphAtIndex:index effectiveRange:&lineRange];
    index = NSMaxRange(lineRange);
  }
  RCTLog(@"[measure] hasNonContiguousLayout? %@", layoutManager.hasNonContiguousLayout ? @"YES" : @"NO");

  return GCSizeMake(lastLineRect.size.width, numberOfLines);
}
#endif

/**
 * Get a font based on the given specs.
 *
 * This method is used instead of [RCTConvert UIFont] to support the omission
 * of scaling when a custom delegate has been defined for font's creation.
 */
+ (UIFont * _Nullable)UIFontFromUserSpecs:(NSDictionary *)specs withBridge:(RCTBridge *)bridge
{
  BOOL allowFontScaling = specs[@"allowFontScaling"] == nil ? YES : [specs[@"allowFontScaling"] boolValue];
  CGFloat scaleMultiplier = allowFontScaling && bridge ? bridge.accessibilityManager.multiplier : 1.0;

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
+ (NSDictionary *)fontInfoFromUIFont:(UIFont *)font
{
  static CGFloat const tolerance = (CGFloat) 0.01;
  UIFontDescriptor *descriptor = font.fontDescriptor;
  NSDictionary *traits = [descriptor objectForKey:UIFontDescriptorTraitsAttribute];

  // Get the font weight name from the loosy UIFontWeightTrait value
  CGFloat weight = CGFloatValueFrom(traits[UIFontWeightTrait]) + tolerance;
  NSString *fontWeight = (weight >= UIFontWeightBlack) ? @"900"
  : (weight >= UIFontWeightHeavy) ? @"800"
  : (weight >= UIFontWeightBold) ? @"bold"
  : (weight >= UIFontWeightSemibold) ? @"600"
  : (weight >= UIFontWeightMedium) ? @"500"
  : (weight >= UIFontWeightRegular) ? @"normal"
  : (weight >= UIFontWeightLight) ? @"300"
  : (weight >= UIFontWeightThin) ? @"200" : @"100"; // UIFontWeightUltraLight

  UIFontDescriptorSymbolicTraits symbolicTrais = [traits[UIFontSymbolicTrait] unsignedIntValue];
  BOOL isItalic = (symbolicTrais & UIFontDescriptorTraitItalic) != 0;

  NSArray *features = descriptor.fontAttributes[UIFontDescriptorFeatureSettingsAttribute];
  NSArray *fontVariant = isNull(features) ? nil : [self fontVariantFromFeatures:features];
  //if (fontVariant) {
  //  RCTLog(@"[fontInfoFromUIFont] fontVariant: %@", [fontVariant componentsJoinedByString:@", "]);
  //}

  id const null = [NSNull null];
  NSDictionary *info = @{
                         @"fontFamily": font.fontFamily ?: null,
                         @"fontName": font.fontName ?: null,
                         @"fontSize": @(font.pointSize),
                         @"fontStyle": isItalic ? @"italic" : @"normal",
                         @"fontWeight": fontWeight,
                         @"fontVariant": fontVariant ?: null,
                         @"ascender": @(font.ascender),
                         @"descender": @(font.descender),
                         @"capHeight": @(font.capHeight),   // height of capital characters
                         @"xHeight": @(font.xHeight),       // height of lowercase "x"
                         @"leading": @(font.leading),       // additional space between lines
                         @"lineHeight": @(font.lineHeight),
                         };
  return info;
}

/**
 * Get font info for one of the predefined iOS Text Styles.
 *
 * FIXME:
 * kNumberCase variants are not being recognized... RN bug?
 */
+ (NSArray<NSString *> * _Nullable)fontVariantFromFeatures:(NSArray *)srcArr
{
  NSString *outArr[srcArr.count];
  NSUInteger count = 0;

  for (NSDictionary *item in srcArr) {
    NSNumber *type = item[UIFontFeatureTypeIdentifierKey];
    if (type) {
      int value = (int) [item[UIFontFeatureSelectorIdentifierKey] longValue];

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

/**
 * Get the UIFontTextStyle value from the given textStyleCode
 */
+ (UIFontTextStyle _Nullable)UITextStyleFromJSCode:(NSString *)textStyleCode
{
  static NSDictionary<NSString *, UIFontTextStyle> *textStyles;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    textStyles = @{
                   @"body": UIFontTextStyleBody,
                   @"callout": UIFontTextStyleCallout,
                   @"caption1": UIFontTextStyleCaption1,
                   @"caption2": UIFontTextStyleCaption2,
                   @"footnote": UIFontTextStyleFootnote,
                   @"headline": UIFontTextStyleHeadline,
                   @"subheadline": UIFontTextStyleSubheadline,
                   @"title1": UIFontTextStyleTitle1,
                   @"title2": UIFontTextStyleTitle2,
                   @"title3": UIFontTextStyleTitle3,
                   };
  });

  return textStyles[textStyleCode];
}

@end
