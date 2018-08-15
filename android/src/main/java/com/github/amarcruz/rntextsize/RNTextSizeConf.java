package com.github.amarcruz.rntextsize;

import android.annotation.TargetApi;
import android.graphics.Typeface;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.text.Layout;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.JSApplicationIllegalArgumentException;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.modules.systeminfo.ReactNativeVersion;

import java.util.Map;

final class RNTextSizeConf {
    private static final float DEF_FONTSIZE = 14.0f;
    private static final int rnVersion;
    private static final ReadableMap emptySpecs;

    static {
        emptySpecs = Arguments.createMap();

        int version = 0;
        try {
            Map<String, Object> rnv = ReactNativeVersion.VERSION;
            version = ((int) rnv.get("major") << 16) | (int) rnv.get("minor");
        } catch (Exception ignore) {
        }
        rnVersion = version;
    }

    @NonNull
    static RNTextSizeConf empty() {
        return new RNTextSizeConf(emptySpecs, false);
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

        int _fontStyle = "italic".equals(getString("fontStyle")) ? Typeface.ITALIC : Typeface.NORMAL;
        switch (getNonNullString("fontWeight")) {
            case "bold":
            case "900":
            case "800":
            case "700":
            case "600":
            case "500":
                _fontStyle |= Typeface.BOLD;
                break;
        }

        allowFontScaling = forText && getBooleanOrTrue("allowFontScaling");
        fontFamily = getString("fontFamily");
        fontSize = getFontSizeOrDefault();
        fontStyle = _fontStyle;
        includeFontPadding = forText && getBooleanOrTrue("includeFontPadding");

        // letterSpacing is supported in RN 0.55+
        letterSpacing = supportLetterSpacing() ? getFloatOrNaN("letterSpacing") : Float.NaN;
    }

    float getFloatOrNaN(@NonNull final String name) {
        return mOpts.hasKey(name) ? (float) mOpts.getDouble(name) : Float.NaN;
    }

    @Nullable
    String getString(@NonNull final String name) {
        return mOpts.hasKey(name)
                ? mOpts.getString(name) : null;
    }

    // letterSpacing is supported in RN 0.55+
    static boolean supportLetterSpacing() {
        return rnVersion >= 55;
    }

    @NonNull
    private String getNonNullString(@NonNull final String name) {
        if (mOpts.hasKey(name)) {
            final String str = mOpts.getString(name);

            if (str != null) {
                return str;
            }
        }
        return "";
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

    private boolean getBooleanOrTrue(@NonNull final String name) {
        return !mOpts.hasKey(name) || mOpts.getBoolean(name);
    }
}
