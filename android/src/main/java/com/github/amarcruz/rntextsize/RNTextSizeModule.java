package com.github.amarcruz.rntextsize;

import android.content.res.AssetManager;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.os.Build;
import android.text.BoringLayout;
import android.text.Layout;
import android.text.SpannableString;
import android.text.SpannableStringBuilder;
import android.text.StaticLayout;
import android.text.TextPaint;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.DisplayMetricsHolder;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

class RNTextSizeModule extends ReactContextBaseJavaModule {
    private static final String TAG = "RNTextSize";
    private static final float SPACING_ADDITION = 0f;
    private static final float SPACING_MULTIPLIER = 1f;

    private static final String E_MISSING_TEXT = "E_MISSING_TEXT";
    private static final String E_MISSING_PARAMETER = "E_MISSING_PARAMETER";
    private static final String E_UNKNOWN_ERROR = "E_UNKNOWN_ERROR";

    // It's important to pass the ANTI_ALIAS_FLAG flag to the constructor rather than setting it
    // later by calling setFlags. This is because the latter approach triggers a bug on Android 4.4.2.
    // The bug is that unicode emoticons aren't measured properly which causes text to be clipped.
    private static final TextPaint sTextPaintInstance = new TextPaint(TextPaint.ANTI_ALIAS_FLAG);

    private final ReactApplicationContext mReactContext;

    RNTextSizeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mReactContext = reactContext;
    }

    @Override
    public String getName() {
        return TAG;
    }

    /**
     * Based on ReactTextShadowNode.java
     */
    @SuppressWarnings("unused")
    @ReactMethod
    public void measure(@Nullable final ReadableMap specs, final Promise promise) {
        final RNTextSizeConf conf = getConf(specs, promise, true);
        if (conf == null) {
            return;
        }

        final String _text = conf.getString("text");
        if (_text == null) {
            promise.reject(E_MISSING_TEXT, "Missing required text.");
            return;
        }

        final float density = getCurrentDensity();
        final float width = conf.getWidth(density);
        final boolean includeFontPadding = conf.includeFontPadding;

        final WritableMap result = Arguments.createMap();
        if (_text.isEmpty()) {
            result.putInt("width", 0);
            result.putDouble("height", minimalHeight(density, includeFontPadding));
            result.putInt("lastLineWidth", 0);
            result.putInt("lineCount", 0);
            promise.resolve(result);
            return;
        }

        final SpannableString text = (SpannableString) RNTextSizeSpannedText
                .spannedFromSpecsAndText(mReactContext, conf, new SpannableString(_text));

        final TextPaint textPaint = new TextPaint(TextPaint.ANTI_ALIAS_FLAG);
        Layout layout = null;
        try {
            final BoringLayout.Metrics boring = BoringLayout.isBoring(text, textPaint);
            int hintWidth = (int) width;

            if (boring == null) {
                // Not boring, ie. the text is multiline or contains unicode characters.
                final float desiredWidth = Layout.getDesiredWidth(text, textPaint);
                if (desiredWidth <= width) {
                    hintWidth = (int) Math.ceil(desiredWidth);
                }
            } else if (boring.width <= width) {
                // Single-line and width unknown or bigger than the width of the text.
                layout = BoringLayout.make(
                        text,
                        textPaint,
                        boring.width,
                        Layout.Alignment.ALIGN_NORMAL,
                        SPACING_MULTIPLIER,
                        SPACING_ADDITION,
                        boring,
                        includeFontPadding);
            }

            if (layout == null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    layout = StaticLayout.Builder.obtain(text, 0, text.length(), textPaint, hintWidth)
                            .setAlignment(Layout.Alignment.ALIGN_NORMAL)
                            .setBreakStrategy(conf.getTextBreakStrategy())
                            .setHyphenationFrequency(Layout.HYPHENATION_FREQUENCY_NORMAL)
                            .setIncludePad(includeFontPadding)
                            .setLineSpacing(SPACING_ADDITION, SPACING_MULTIPLIER)
                            .build();
                } else {
                    layout = new StaticLayout(
                            text,
                            textPaint,
                            hintWidth,
                            Layout.Alignment.ALIGN_NORMAL,
                            SPACING_MULTIPLIER,
                            SPACING_ADDITION,
                            includeFontPadding
                    );
                }
            }

            final int lineCount = layout.getLineCount();
            float rectWidth;

            if (conf.getBooleanOrTrue("usePreciseWidth")) {
                float lastWidth = 0f;
                // Layout.getWidth() returns the configured max width, we must
                // go slow to get the used one (and with the text trimmed).
                rectWidth = 0f;
                for (int i = 0; i < lineCount; i++) {
                    lastWidth = layout.getLineMax(i);
                    if (lastWidth > rectWidth) {
                        rectWidth = lastWidth;
                    }
                }
                result.putDouble("lastLineWidth", lastWidth / density);
            } else {
                rectWidth = layout.getWidth();
            }

            result.putDouble("width", Math.min(rectWidth / density, width));
            result.putDouble("height", layout.getHeight() / density);
            result.putInt("lineCount", lineCount);

            Integer lineInfoForLine = conf.getIntOrNull("lineInfoForLine");
            if (lineInfoForLine != null && lineInfoForLine >= 0) {
                final int line = Math.min(lineInfoForLine, lineCount);
                final WritableMap info = Arguments.createMap();
                info.putInt("line", line);
                info.putInt("start", layout.getLineStart(line));
                info.putInt("end", layout.getLineVisibleEnd(line));
                info.putDouble("bottom", layout.getLineBottom(line) / density);
                info.putDouble("width", layout.getLineMax(line) / density);
                result.putMap("lineInfo", info);
            }

            promise.resolve(result);
        } catch (Exception e) {
            promise.reject(E_UNKNOWN_ERROR, e);
        }
    }

    // https://stackoverflow.com/questions/3654321/measuring-text-height-to-be-drawn-on-canvas-android
    @SuppressWarnings("unused")
    @ReactMethod
    public void flatHeights(@Nullable final ReadableMap specs, final Promise promise) {
        final RNTextSizeConf conf = getConf(specs, promise, true);
        if (conf == null) {
            return;
        }

        final ReadableArray texts = conf.getArray("text");
        if (texts == null) {
            promise.reject(E_MISSING_TEXT, "Missing required text, must be an array.");
            return;
        }

        final float density = getCurrentDensity();
        final float width = conf.getWidth(density);
        final boolean includeFontPadding = conf.includeFontPadding;
        final int textBreakStrategy = conf.getTextBreakStrategy();

        final WritableArray result = Arguments.createArray();

        final SpannableStringBuilder sb = new SpannableStringBuilder(" ");
        RNTextSizeSpannedText.spannedFromSpecsAndText(mReactContext, conf, sb);

        final TextPaint textPaint = new TextPaint(TextPaint.ANTI_ALIAS_FLAG);
        Layout layout;
        try {

            for (int ix = 0; ix < texts.size(); ix++) {

                // If this element is `null` or another type, return zero
                if (texts.getType(ix) != ReadableType.String) {
                    result.pushInt(0);
                    continue;
                }

                final String text = texts.getString(ix);

                // If empty, return the minimum height of <Text> components
                if (text.isEmpty()) {
                    result.pushDouble(minimalHeight(density, includeFontPadding));
                    continue;
                }

                // Reset the SB text, the attrs will expand to its full length
                sb.replace(0, sb.length(), text);

                if (Build.VERSION.SDK_INT >= 23) {
                    layout = StaticLayout.Builder.obtain(sb, 0, sb.length(), textPaint, (int) width)
                            .setAlignment(Layout.Alignment.ALIGN_NORMAL)
                            .setBreakStrategy(textBreakStrategy)
                            .setHyphenationFrequency(Layout.HYPHENATION_FREQUENCY_NORMAL)
                            .setIncludePad(includeFontPadding)
                            .setLineSpacing(SPACING_ADDITION, SPACING_MULTIPLIER)
                            .build();
                } else {
                    layout = new StaticLayout(
                            sb,
                            textPaint,
                            (int) width,
                            Layout.Alignment.ALIGN_NORMAL,
                            SPACING_MULTIPLIER,
                            SPACING_ADDITION,
                            includeFontPadding
                    );
                }

                result.pushDouble(layout.getHeight() / density);
            }

            promise.resolve(result);
        } catch (Exception e) {
            promise.reject(E_UNKNOWN_ERROR, e);
        }
    }

    /**
     * See https://material.io/design/typography/#type-scale
     */
    @SuppressWarnings("unused")
    @ReactMethod
    public void specsForTextStyles(final Promise promise) {
        WritableMap result = Arguments.createMap();

        result.putMap("h1", makeFontSpecs("-light", 96, -1.5));
        result.putMap("h2", makeFontSpecs("-light", 60, -0.5));
        result.putMap("h3", makeFontSpecs(null, 48, 0));
        result.putMap("h4", makeFontSpecs(null, 34, 0.25));
        result.putMap("h5", makeFontSpecs(null, 24, 0));
        result.putMap("h6", makeFontSpecs("-medium", 20, 0.15));
        result.putMap("subtitle1", makeFontSpecs(null, 16, 0.15));
        result.putMap("subtitle2", makeFontSpecs("-medium", 14, 0.1));
        result.putMap("body1", makeFontSpecs(null, 16, 0.5));
        result.putMap("body2", makeFontSpecs(null, 14, 0.25));
        result.putMap("button", makeFontSpecs("-medium", 14, 0.75, true));
        result.putMap("caption", makeFontSpecs(null, 12, 0.4));
        result.putMap("overline", makeFontSpecs(null, 10, 1.5, true));

        promise.resolve(result);
    }

    /**
     * https://stackoverflow.com/questions/27631736
     * /meaning-of-top-ascent-baseline-descent-bottom-and-leading-in-androids-font
     */
    @SuppressWarnings("unused")
    @ReactMethod
    public void fontFromSpecs(@Nullable final ReadableMap specs, final Promise promise) {
        final RNTextSizeConf conf = getConf(specs, promise);
        if (conf == null) {
            return;
        }
        final Typeface typeface = RNTextSizeConf.getFont(mReactContext, conf.fontFamily, conf.fontStyle);
        final TextPaint textPaint = sTextPaintInstance;
        final int fontSize = (int) Math.ceil(conf.scale(conf.fontSize));

        textPaint.reset();
        textPaint.setTypeface(typeface);
        textPaint.setTextSize(fontSize);

        promise.resolve(fontInfoFromTypeface(textPaint, typeface, conf));
    }

    @SuppressWarnings("unused")
    @ReactMethod
    public void fontFamilyNames(final Promise promise) {
        final boolean lollipop = Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP;
        final WritableArray names = Arguments.createArray();

        names.pushString("sans-serif");
        names.pushString("sans-serif-condensed");
        if (lollipop) {
            names.pushString("sans-serif-thin");
            names.pushString("sans-serif-light");
            names.pushString("sans-serif-medium");
            names.pushString("sans-serif-black");
            names.pushString("sans-serif-smallcaps");
            names.pushString("sans-serif-condensed-light");
        } else {
            // SDK 16
            names.pushString("sans-serif-light");
        }
        names.pushString("serif");
        names.pushString("monospace");
        if (lollipop) {
            names.pushString("serif-monospace");
            names.pushString("casual");
            names.pushString("cursive");
        }

        getFontsInAssets(names);
        promise.resolve(names);
    }

    /**
     * Android does not have font name info.
     */
    @SuppressWarnings("unused")
    @ReactMethod
    public void fontNamesForFamilyName(final String ignored, final Promise promise) {
        promise.resolve(null);
    }

    // ============================================================================
    //
    //      Non-exposed instance & static methods
    //
    // ============================================================================

    @Nullable
    private RNTextSizeConf getConf(final ReadableMap specs, final Promise promise, boolean forText) {
        if (specs == null) {
            promise.reject(E_MISSING_PARAMETER, "Missing parameter object.");
            return null;
        }
        return new RNTextSizeConf(specs, forText);
    }

    @Nullable
    private RNTextSizeConf getConf(final ReadableMap specs, final Promise promise) {
        return getConf(specs, promise, false);
    }

    /**
     * RN consistently sets the height at 14dp divided by the density
     * plus 1 if includeFontPadding when text is empty, so we do the same.
     */
    private double minimalHeight(final float density, final boolean includeFontPadding) {
        final double height = 14.0 / density;
        return includeFontPadding ? height + 1.0 : height;
    }

    /**
     * This is for 'fontFromFontStyle', makes the minimal info required.
     * @param suffix The font variant
     * @param fontSize Font size in SP
     * @param letterSpacing Sugest this to user
     * @return map with specs
     */
    private WritableMap makeFontSpecs(String suffix, int fontSize, double letterSpacing, boolean upcase) {
        final WritableMap map = Arguments.createMap();
        final String roboto = "sans-serif";

        // In Android, the fontFamily determines the weight
        map.putString("fontFamily", suffix != null ? (roboto + suffix) : roboto);
        map.putInt("fontSize", fontSize);

        if (RNTextSizeConf.supportLetterSpacing()) {
            map.putDouble("letterSpacing", letterSpacing);
        }

        if (upcase && RNTextSizeConf.supportUpperCaseTransform()) {
            map.putString("textTransform", "uppercase");
        }

        return map;
    }

    private WritableMap makeFontSpecs(String suffix, int fontSize, double letterSpacing) {
        return makeFontSpecs(suffix, fontSize, letterSpacing, false);
    }

    @Nonnull
    private WritableMap fontInfoFromTypeface(
            @Nonnull final TextPaint textPaint,
            @Nonnull final Typeface typeface,
            @Nonnull final RNTextSizeConf conf
    ) {
        // Info is always in unscaled values
        final float density = getCurrentDensity();
        final Paint.FontMetrics metrics = new Paint.FontMetrics();
        final float lineHeight = textPaint.getFontMetrics(metrics);

        final WritableMap info = Arguments.createMap();
        info.putString("fontFamily", conf.getString("fontFamily"));
        info.putString("fontWeight", typeface.isBold() ? "bold" : "normal");
        info.putString("fontStyle", typeface.isItalic() ? "italic" : "normal");
        info.putDouble("fontSize", textPaint.getTextSize() / density);
        info.putDouble("leading", metrics.leading / density);
        info.putDouble("ascender", metrics.ascent / density);
        info.putDouble("descender", metrics.descent / density);
        info.putDouble("top", metrics.top / density);
        info.putDouble("bottom", metrics.bottom / density);
        info.putDouble("lineHeight", lineHeight / density);
        info.putInt("_hash", typeface.hashCode());
        return info;
    }

    /**
     * Retuns the current density.
     */
    @SuppressWarnings("deprecation")
    private float getCurrentDensity() {
        return DisplayMetricsHolder.getWindowDisplayMetrics().density;
    }

    private static final String[] FILE_EXTENSIONS = {".ttf", ".otf"};
    private static final String FONTS_ASSET_PATH = "fonts";

    private String[] fontsInAssets = null;

    /**
     * Set the font names in assets/fonts into the target array.
     * @param destArr Target
     */
    private void getFontsInAssets(@Nonnull WritableArray destArr) {
        String[] srcArr = fontsInAssets;

        if (srcArr == null) {
            final AssetManager assetManager = mReactContext.getAssets();
            ArrayList<String> tmpArr = new ArrayList<>();

            if (assetManager != null) {
                try {
                    String[] list = assetManager.list(FONTS_ASSET_PATH);

                    if (list != null) {
                        for (String spec : list) {
                            addFamilyToArray(tmpArr, spec);
                        }
                    }
                } catch (IOException ex) {
                    ex.printStackTrace();
                }
            }

            Collections.sort(tmpArr, String.CASE_INSENSITIVE_ORDER);
            fontsInAssets = srcArr = tmpArr.toArray(new String[0]);
        }

        for (String name : srcArr) {
            destArr.pushString(name);
        }
    }

    private void addFamilyToArray(
            @Nonnull final List<String> outArr,
            @Nonnull final String spec
    ) {
        for (String ext : FILE_EXTENSIONS) {
            if (spec.endsWith(ext)) {
                final String name = spec.substring(0, spec.length() - ext.length());

                if (!outArr.contains(name)) {
                    outArr.add(name);
                }
                break;
            }
        }
    }
}
