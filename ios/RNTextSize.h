#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#import <React/RCTAccessibilityManager.h>
#else
#import "React/RCTBridgeModule.h"
#import "React/RCTAccessibilityManager.h"
#endif

@interface RNTextSize : NSObject <RCTBridgeModule>
@end
