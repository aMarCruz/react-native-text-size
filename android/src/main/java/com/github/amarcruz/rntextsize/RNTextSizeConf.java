package com.github.amarcruz.rntextsize;

import android.annotation.TargetApi;
import android.graphics.Typeface;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.text.Layout;

import com.facebook.react.bridge.JSApplicationIllegalArgumentException;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.modules.systeminfo.ReactNativeVersion;

import java.util.Map;

final class RNTextSizeConf {
    private static final float DEF_FONTSIZE = 14.0f;
    private static final int reactNativeVersion;

    static {
        int version = 0;
        try {
            Map<String, Object> rnv = ReactNativeVersion.VERSION;
            version = ((int) rnv.get("major") << 16) | (int) rnv.get("minor");
        } catch (Exception ignore) {
        }
        reactNativeVersion = version;
    }

    // letterSpacing is supported in RN 0.55+
    static boolean supportLetterSpacing() {
        return reactNativeVersion >= 55;
    }

    static float getDefaultFontSize() {
        return DEF_FONTSIZE;
    }

    private final ReadableMap mOpts;

    final String fontFamily;
    final float fontSize;
    final int fontStyle;
    final boolean allowFontScaling;
    final boolean includeFontPadding;
    final float letterSpacing;

    /**
     * Proccess the user specs. Set both `allowFontScaling` & `includeFontPadding` to the user
     * value or the default `true` only if we have the `forText` flag.
     *
     * @param options User options
     * @param forText This will be used for measure text?
     */
    RNTextSizeConf(@NonNull final ReadableMap options, final boolean forText) {
        mOpts = options;

        allowFontScaling = forText && getBooleanOrTrue("allowFontScaling");
        fontFamily = getString("fontFamily");
        fontSize = getFontSizeOrDefault();
        fontStyle = getFontStyle();
        includeFontPadding = forText && getBooleanOrTrue("includeFontPadding");

        // letterSpacing is supported in RN 0.55+
        letterSpacing = supportLetterSpacing() ? getFloatOrNaN("letterSpacing") : Float.NaN;
    }

    boolean has(@NonNull final String name) {
        return mOpts.hasKey(name);
    }

    float getFloatOrNaN(@NonNull final String name) {
        return mOpts.hasKey(name) ? (float) mOpts.getDouble(name) : Float.NaN;
    }

    @Nullable
    String getString(@NonNull final String name) {
        return mOpts.hasKey(name)
                ? mOpts.getString(name) : null;
    }

    @TargetApi(23)
    int getTextBreakStrategy() {
        final String textBreakStrategy = getString("textBreakStrategy");

        if (textBreakStrategy != null) {
            switch (textBreakStrategy) {
                case "balanced":
                    return Layout.BREAK_STRATEGY_BALANCED;
                case "highQuality":
                    return Layout.BREAK_STRATEGY_HIGH_QUALITY;
                case "simple":
                    return Layout.BREAK_STRATEGY_SIMPLE;
                default:
                    throw new JSApplicationIllegalArgumentException(
                            "Invalid textBreakStrategy: " + textBreakStrategy);
            }
        }
        return Layout.BREAK_STRATEGY_HIGH_QUALITY;
    }

    private float getFontSizeOrDefault() {
        if (mOpts.hasKey("fontSize")) {
            final float num = (float) mOpts.getDouble("fontSize");

            if (num > 0f) {
                return num;
            }
        }
        return DEF_FONTSIZE;
    }

    private int getFontStyle() {
        int style = "italic".equals(getString("fontStyle")) ? Typeface.ITALIC : Typeface.NORMAL;

        final String weight = getString("fontWeight");
        if (weight != null) {
            switch (weight) {
                case "bold":
                case "900":
                case "800":
                case "700":
                case "600":
                case "500":
                    style |= Typeface.BOLD;
                    break;
            }
        }
        return style;
    }

    boolean getBooleanOrTrue(@NonNull final String name) {
        return !mOpts.hasKey(name) || mOpts.getBoolean(name);
    }
}
