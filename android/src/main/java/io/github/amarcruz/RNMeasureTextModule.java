package io.github.amarcruz;

import android.os.Build;
import android.text.BoringLayout;
import android.text.Layout;
import android.text.StaticLayout;
import android.text.TextPaint;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

// fontFamily support
import com.facebook.react.views.text.ReactFontManager;
import android.content.res.AssetManager;
import android.graphics.Typeface;
import javax.annotation.Nullable;

public class RNMeasureTextModule extends ReactContextBaseJavaModule {

  public static void setAssetManager(AssetManager assetManager) {
    sAssetManager = assetManager;
  }

  public RNMeasureTextModule(ReactApplicationContext reactContext) {
    super(reactContext);
    setAssetManager(reactContext.getAssets());
  }

  @Override
  public String getName() {
    return "RNMeasureText";
  }

  @ReactMethod
  public void measure(ReadableMap options, Promise promise) {
    if (!options.hasKey("text")) {
      promise.reject(ERR_INVALID_TEXTS, "missing required 'text' property");
      return;
    }
    if (!options.hasKey("fontSize")) {
      promise.reject(ERR_INVALID_FONT, "missing required 'fontSize' property");
      return;
    }

    TextPaint textPaint = sTextPaintInstance;
    @Nullable Layout layout = null;

    // Optional width?
    int width = 0;
    if (options.hasKey("width")) {
      width = Math.round((float) options.getDouble("width"));
    }
    String text = options.getString("text");

    float fontSize = (float) options.getDouble("fontSize");
    textPaint.setTextSize(fontSize);

    String fontFamily = "system";
    if (options.hasKey("fontFamily")) {
      fontFamily = options.getString("fontFamily");
    }
    Typeface typeface = getTypeface(fontFamily, 0);
    textPaint.setTypeface(typeface);

    // technically, width should never be negative, but there is currently a bug in
    final boolean unconstrainedWidth = width <= 0;
    final boolean includeFontPadding = false;
    final float spacingMultiplier = 1;
    final float spacingAddition = 0;
    final int textBreakStrategy =
      (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) ? 0 : Layout.BREAK_STRATEGY_HIGH_QUALITY;

    int hintWidth;

    try {
      BoringLayout.Metrics boring = BoringLayout.isBoring(text, textPaint);
      float desiredWidth = boring == null ?
          Layout.getDesiredWidth(text, textPaint) : -1;

      if (boring == null &&
        (unconstrainedWidth || (desiredWidth > -1 && desiredWidth <= width))) {
        // Is used when the width is not known and the text is not boring, ie. if it contains
        // unicode characters.
        hintWidth = (int) Math.ceil(desiredWidth);

      }  else if (boring != null && (unconstrainedWidth || boring.width <= width)) {
        // Is used for single-line, boring text when the width is either unknown or bigger
        // than the width of the text.
        layout = BoringLayout.make(
            text,
            textPaint,
            boring.width,
            Layout.Alignment.ALIGN_NORMAL,
            spacingMultiplier,
            spacingAddition,
            boring,
            includeFontPadding);

      }  else {
        // Is used for multiline, boring text and the width is known.
        hintWidth = (int) width;
      }

      if (layout == null) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
          layout = new StaticLayout(
            text,
            textPaint,
            hintWidth,
            Layout.Alignment.ALIGN_NORMAL,
            spacingMultiplier,
            spacingAddition,
            includeFontPadding
          );
        } else {
          layout = StaticLayout.Builder.obtain(text, 0, text.length(), textPaint, hintWidth)
            .setAlignment(Layout.Alignment.ALIGN_NORMAL)
            .setLineSpacing(spacingAddition, spacingMultiplier)
            .setIncludePad(includeFontPadding)
            .setBreakStrategy(textBreakStrategy)
            .setHyphenationFrequency(Layout.HYPHENATION_FREQUENCY_NORMAL)
            .build();
        }
      }

      WritableMap result = Arguments.createMap();
      final int lineCount = layout.getLineCount();

      result.putInt("width", layout.getWidth());
      result.putInt("height", layout.getHeight());
      result.putInt("lineCount", lineCount);
      result.putDouble("lastLineMax", (double) layout.getLineMax(lineCount - 1));
      promise.resolve(result);

    } catch (Exception e) {
      promise.reject(ERR_UNKNOWN_ERROR, e);
    }
  }

  // It's important to pass the ANTI_ALIAS_FLAG flag to the constructor rather than setting it
  // later by calling setFlags. This is because the latter approach triggers a bug on Android 4.4.2.
  // The bug is that unicode emoticons aren't measured properly which causes text to be clipped.
  private static final TextPaint sTextPaintInstance = new TextPaint(TextPaint.ANTI_ALIAS_FLAG);

  @Nullable private static AssetManager sAssetManager = null;

  private static final String ERR_INVALID_TEXTS = "ERR_INVALID_TEXT";
  private static final String ERR_INVALID_FONT = "ERR_INVALID_FONT";
  private static final String ERR_UNKNOWN_ERROR = "ERR_UNKNOWN_ERROR";

  private static Typeface getTypeface(String fontFamily, int style) {
    ReactFontManager fontManager = ReactFontManager.getInstance();
    return fontManager.getTypeface(fontFamily, style, sAssetManager);
  }

}
