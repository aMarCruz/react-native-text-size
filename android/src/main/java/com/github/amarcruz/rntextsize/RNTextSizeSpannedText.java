package com.github.amarcruz.rntextsize;

import android.annotation.TargetApi;
import android.graphics.Typeface;
import android.os.Build;
import android.text.Spannable;
import android.text.TextPaint;
import android.text.style.AbsoluteSizeSpan;
import android.text.style.MetricAffectingSpan;

import com.facebook.react.bridge.ReactApplicationContext;

import javax.annotation.Nonnull;

final class RNTextSizeSpannedText {

    RNTextSizeSpannedText() {}

    static Spannable spannedFromSpecsAndText(
            @Nonnull final ReactApplicationContext context,
            @Nonnull final RNTextSizeConf conf,
            @Nonnull final Spannable text
    ) {

        //final SpannableString str = new SpannableString(text);
        final int end = text.length();

        // Actual order of calling {@code execute} does NOT matter,
        // but the {@code priority} DOES matter (higher numbers go first).
        int priority = -1;

        // Lowest priority
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            if (!Float.isNaN(conf.letterSpacing)) {
                final float letterSpacing = conf.scale(conf.letterSpacing);
                priority++;
                setSpanOperation(text, end, priority,
                        new CustomLetterSpacingSpan(letterSpacing));
            }
        }

        final int fontSize = (int) Math.ceil(conf.scale(conf.fontSize));
        priority++;
        setSpanOperation(text, end, priority, new AbsoluteSizeSpan(fontSize));

        if (conf.fontFamily != null || conf.has("fontStyle") || conf.has("fontWeight")) {
            priority++;
            setSpanOperation(text, end, priority,
                    new CustomStyleSpan(RNTextSizeConf.getFont(context, conf.fontFamily, conf.fontStyle)));
        }

        return text;
    }

    private static void setSpanOperation(
            Spannable str,
            int end,
            int priority,
            Object span
    ) {
        // Here all spans will automatically extend from the start to the end of the text.
        int spanFlags = Spannable.SPAN_INCLUSIVE_INCLUSIVE;
        spanFlags |= (priority << Spannable.SPAN_PRIORITY_SHIFT) & Spannable.SPAN_PRIORITY;

        str.setSpan(span, 0, end, spanFlags);
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
        public void updateMeasureState(@Nonnull TextPaint paint) {
            apply(paint);
        }

        private void apply(TextPaint paint) {
            paint.setLetterSpacing(mLetterSpacing / paint.getTextSize());
        }
    }

    /**
     * Try to load the fontFamily with the right style and weight from the
     * assets.
     */
    private static class CustomStyleSpan extends MetricAffectingSpan {

        private final Typeface mTypeface;

        CustomStyleSpan(final Typeface typeface) {
            mTypeface = typeface;
        }

        @Override
        public void updateDrawState(TextPaint ds) {
            apply(ds, mTypeface);
        }

        @Override
        public void updateMeasureState(@Nonnull TextPaint paint) {
            apply(paint, mTypeface);
        }

        private static void apply(TextPaint paint, final Typeface typeface) {
            paint.setTypeface(typeface);
        }

    }
}
