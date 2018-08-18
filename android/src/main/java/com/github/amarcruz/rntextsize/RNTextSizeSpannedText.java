package com.github.amarcruz.rntextsize;

import android.annotation.TargetApi;
import android.content.res.AssetManager;
import android.graphics.Typeface;
import android.os.Build;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.text.Spannable;
import android.text.SpannableStringBuilder;
import android.text.TextPaint;
import android.text.style.AbsoluteSizeSpan;
import android.text.style.MetricAffectingSpan;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.PixelUtil;
import com.facebook.react.views.text.ReactFontManager;

final class RNTextSizeSpannedText {

    private RNTextSizeSpannedText() {
    }

    static Spannable spannedFromSpecsAndText(
            @NonNull final ReactApplicationContext context,
            @NonNull final RNTextSizeConf conf,
            @NonNull final String text
    ) {

        final SpannableStringBuilder sb = new SpannableStringBuilder(text);
        final int end = text.length();

        // Actual order of calling {@code execute} does NOT matter,
        // but the {@code priority} DOES matter (higher numbers go first).
        int priority = -1;

        // Lowest priority
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            if (!Float.isNaN(conf.letterSpacing)) {
                final float letterSpacing = conf.allowFontScaling
                        ? PixelUtil.toPixelFromSP(conf.letterSpacing)
                        : PixelUtil.toPixelFromDIP(conf.letterSpacing);
                priority++;
                setSpanOperation(
                        sb,
                        end,
                        priority,
                        new CustomLetterSpacingSpan(letterSpacing));
            }
        }

        final int fontSize = (int) Math.ceil(
                conf.allowFontScaling
                        ? PixelUtil.toPixelFromSP(conf.fontSize)
                        : Math.ceil(PixelUtil.toPixelFromDIP(conf.fontSize)
                ));
        priority++;
        setSpanOperation(sb, end, priority, new AbsoluteSizeSpan(fontSize));

        if (conf.fontFamily != null || conf.has("fontStyle") || conf.has("fontWeight")) {
            priority++;
            setSpanOperation(
                    sb,
                    end,
                    priority,
                    new CustomStyleSpan(conf.fontStyle, conf.fontFamily, context.getAssets()));
        }

        return sb;
    }

    private static void setSpanOperation(
            SpannableStringBuilder sb,
            int end,
            int priority,
            Object span
    ) {
        // Here all spans will automatically extend from the start to the end of the text.
        int spanFlags = Spannable.SPAN_INCLUSIVE_INCLUSIVE;
        spanFlags |= (priority << Spannable.SPAN_PRIORITY_SHIFT) & Spannable.SPAN_PRIORITY;

        sb.setSpan(span, 0, end, spanFlags);
    }

    /**
     * A {@link MetricAffectingSpan} that allows to set the letter spacing
     * on the selected text span.
     *
     * The letter spacing is specified in pixels, which are converted to
     * ems at paint time; this span must therefore be applied after any
     * spans affecting font size.
     */
    @TargetApi(Build.VERSION_CODES.LOLLIPOP)
    private static class CustomLetterSpacingSpan extends MetricAffectingSpan {

        private final float mLetterSpacing;

        CustomLetterSpacingSpan(float letterSpacing) {
            mLetterSpacing = letterSpacing;
        }

        @Override
        public void updateDrawState(TextPaint paint) {
            apply(paint);
        }

        @Override
        public void updateMeasureState(TextPaint paint) {
            apply(paint);
        }

        private void apply(TextPaint paint) {
            // mLetterSpacing and paint.getTextSize() are both in pixels,
            // yielding an accurate em value.
            paint.setLetterSpacing(mLetterSpacing / paint.getTextSize());
        }
    }

    private static class CustomStyleSpan extends MetricAffectingSpan {

        /**
         * A {@link MetricAffectingSpan} that allows to change the style of the displayed font.
         * CustomStyleSpan will try to load the fontFamily with the right style and weight from the
         * assets. The custom fonts will have to be located in the res/assets folder of the application.
         * The supported custom fonts extensions are .ttf and .otf. For each font family the bold,
         * italic and bold_italic variants are supported. Given a "family" font family the files in the
         * assets/fonts folder need to be family.ttf(.otf) family_bold.ttf(.otf) family_italic.ttf(.otf)
         * and family_bold_italic.ttf(.otf). If the right font is not found in the assets folder
         * CustomStyleSpan will fallback on the most appropriate default typeface depending on the style.
         * Fonts are retrieved and cached using the {@link ReactFontManager}
         */

        private final AssetManager mAssetManager;
        private final int mStyle;
        @Nullable
        private final String mFontFamily;

        CustomStyleSpan(
                int fontStyle,
                @Nullable String fontFamily,
                AssetManager assetManager) {
            mStyle = fontStyle;
            mFontFamily = fontFamily;
            mAssetManager = assetManager;
        }

        @Override
        public void updateDrawState(TextPaint ds) {
            apply(ds, mStyle, mFontFamily, mAssetManager);
        }

        @Override
        public void updateMeasureState(TextPaint paint) {
            apply(paint, mStyle, mFontFamily, mAssetManager);
        }

        /**
         * Returns {@link Typeface#NORMAL} or {@link Typeface#ITALIC}.
         */
        public int getStyle() {
            return mStyle;
        }

        /**
         * Returns the font family set for this StyleSpan.
         */
        public @Nullable String getFontFamily() {
            return mFontFamily;
        }

        private static void apply(
                TextPaint paint,
                int style,
                @Nullable String family,
                AssetManager assetManager
        ) {
            Typeface typeface = paint.getTypeface();

            if (typeface == null && family != null) {
                typeface = ReactFontManager.getInstance().getTypeface(family, style, assetManager);
            }

            if (typeface != null) {
                paint.setTypeface(typeface);
            } else {
                paint.setTypeface(Typeface.defaultFromStyle(style));
            }
        }

    }
}
