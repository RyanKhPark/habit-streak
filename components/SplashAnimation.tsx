import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  ClipPath,
  Defs,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";
import { useTimeBasedTheme } from "../hooks/useTimeBasedTheme";

const { width } = Dimensions.get("window");

interface SplashAnimationProps {
  onAnimationComplete: () => void;
}

export default function SplashAnimation({
  onAnimationComplete,
}: SplashAnimationProps) {
  const opacity = useSharedValue(0);
  const sweepProgress = useSharedValue(0);

  useEffect(() => {
    // Fade in, hold, then fade out
    opacity.value = withTiming(
      1,
      { duration: 800, easing: Easing.out(Easing.cubic) },
      () => {
        opacity.value = withSequence(
          withTiming(1, { duration: 1000 }), // hold for 1 second
          withTiming(
            0,
            { duration: 600, easing: Easing.in(Easing.cubic) },
            (finished) => {
              if (finished && onAnimationComplete) {
                setTimeout(onAnimationComplete, 100);
              }
            }
          )
        );
      }
    );

    // Start sweep animation - repeats every 3 seconds
    const startSweep = () => {
      sweepProgress.value = withTiming(
        1,
        {
          duration: 1000,
          easing: Easing.out(Easing.cubic),
        },
        () => {
          sweepProgress.value = 0;
        }
      );
    };

    // Initial sweep after logo is visible
    const initialSweepTimer = setTimeout(startSweep, 900);

    // Repeat sweep every 3 seconds
    const sweepInterval = setInterval(startSweep, 3000);

    // Fallback timer
    const fallbackTimer = setTimeout(() => {
      onAnimationComplete();
    }, 2600);

    return () => {
      clearTimeout(initialSweepTimer);
      clearTimeout(fallbackTimer);
      clearInterval(sweepInterval);
    };
  }, [onAnimationComplete, opacity, sweepProgress]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: interpolate(opacity.value, [0, 1], [0.8, 1]) }],
  }));

  // Animated style for the sweep overlay
  const sweepStyle = useAnimatedStyle(() => {
    const translateX = interpolate(sweepProgress.value, [0, 1], [-80, 160]);
    const opacity = interpolate(
      sweepProgress.value,
      [0, 0.2, 0.8, 1],
      [0, 0.8, 0.8, 0]
    );

    return {
      transform: [{ translateX }],
      opacity,
    };
  });

  const theme = useTimeBasedTheme();

  const baseW = width * 0.4;
  const baseH = (baseW * 28) / 43;

  return (
    <Animated.View
      style={[styles.container, { backgroundColor: theme.gradientColors[0] }]}
    >
      <Animated.View style={[logoStyle, styles.center]}>
        <View style={styles.logoWrapper}>
          {/* Base logo - always visible */}
          <Svg width={baseW} height={baseH} viewBox="0 0 43 28">
            <Defs>
              <ClipPath id="bgblur_0_59_5101_clip_path">
                <Path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M39.0593 3.49748C42.7888 7.6164 40.142 14.1262 35.1333 15.4764C32.1397 16.2835 28.4341 16.3186 25.7591 16.3231C25.8381 18.0012 26.3122 19.2521 27.1815 20.0759C28.0508 20.8844 29.347 21.2887 31.0697 21.2887C31.7018 21.2887 32.3025 21.2124 32.8715 21.0599C33.4562 20.8921 34.1202 20.6174 34.8629 20.2361C35.0684 20.1293 35.3688 19.9538 35.7639 19.7098C37.1547 18.8555 38.3244 18.4283 39.2727 18.4283C40.2051 18.4284 40.9718 18.6953 41.5723 19.2292C42.1729 19.7479 42.4732 20.4192 42.4732 21.2429C42.4732 22.9515 41.3351 24.4237 39.0593 25.6593C36.7992 26.895 34.0173 27.5128 30.714 27.5128C28.4223 27.5128 26.3991 27.139 24.6448 26.3916C22.8904 25.6441 21.5311 24.5838 20.567 23.2109C19.4448 24.6601 17.9906 25.7432 16.2047 26.4602C14.4345 27.162 12.2848 27.5128 9.75609 27.5128C4.26224 27.5128 0.574707 24.8437 0.574707 19.4168C0.574707 13.9899 4.62094 12.1447 9.82721 11.5863C10.3172 11.5253 10.9811 11.4567 11.8187 11.3804C15.517 11.0143 17.573 10.1709 17.573 8.85901C17.573 8.17259 17.4258 7.67998 16.8411 7.32911C16.2563 6.96301 15.4113 6.78681 13.8449 7.11086C6.70581 8.58775 5.49608 6.46636 5.2616 4.78158C5.02713 3.0968 6.24248 1.80309 7.86171 1.23268C9.1606 0.775124 11.0942 0.548573 13.8449 0.548573C15.7573 0.548594 17.4455 1.06022 18.8363 1.56363C20.2429 2.06706 21.4521 2.86038 22.4636 3.94345C23.5858 2.89089 24.8266 2.10517 26.1858 1.58651C30.9 -0.191578 35.5761 0.0125451 39.0593 3.49748ZM17.2716 15.4764C16.7026 15.7358 16.0782 15.957 15.3986 16.14C14.7348 16.3078 13.8891 16.4757 12.8618 16.6435C11.4869 16.857 10.0183 17.2152 9.51253 17.5965C9.02256 17.9626 8.77757 18.5042 8.77757 19.2212C8.77757 22.3651 14.4578 22.0137 16.1336 20.3963C16.9238 19.6335 17.319 18.3977 17.319 16.6892C17.319 16.3689 17.3111 16.1248 17.2953 15.957C17.2953 15.7739 17.2874 15.6137 17.2716 15.4764ZM26.9605 8.17805C26.1861 8.98657 25.7907 9.87013 25.7116 11.3346C25.7116 11.3346 32.2285 12.6019 33.394 10.7138C34.5594 8.82575 33.2014 7.66374 32.4792 7.25573C30.8016 6.30788 28.3716 6.73452 26.9605 8.17805Z"
                />
              </ClipPath>
              <LinearGradient
                id="paint0_linear_59_5101"
                x1="20.7688"
                y1="0.487304"
                x2="36.59"
                y2="28.0057"
                gradientUnits="userSpaceOnUse"
              >
                <Stop stopColor="#3A2B2B" />
                <Stop offset="1" stopColor="#DDD2C8" />
              </LinearGradient>
            </Defs>

            <Path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M39.0593 3.49748C42.7888 7.6164 40.142 14.1262 35.1333 15.4764C32.1397 16.2835 28.4341 16.3186 25.7591 16.3231C25.8381 18.0012 26.3122 19.2521 27.1815 20.0759C28.0508 20.8844 29.347 21.2887 31.0697 21.2887C31.7018 21.2887 32.3025 21.2124 32.8715 21.0599C33.4562 20.8921 34.1202 20.6174 34.8629 20.2361C35.0684 20.1293 35.3688 19.9538 35.7639 19.7098C37.1547 18.8555 38.3244 18.4283 39.2727 18.4283C40.2051 18.4284 40.9718 18.6953 41.5723 19.2292C42.1729 19.7479 42.4732 20.4192 42.4732 21.2429C42.4732 22.9515 41.3351 24.4237 39.0593 25.6593C36.7992 26.895 34.0173 27.5128 30.714 27.5128C28.4223 27.5128 26.3991 27.139 24.6448 26.3916C22.8904 25.6441 21.5311 24.5838 20.567 23.2109C19.4448 24.6601 17.9906 25.7432 16.2047 26.4602C14.4345 27.162 12.2848 27.5128 9.75609 27.5128C4.26224 27.5128 0.574707 24.8437 0.574707 19.4168C0.574707 13.9899 4.62094 12.1447 9.82721 11.5863C10.3172 11.5253 10.9811 11.4567 11.8187 11.3804C15.517 11.0143 17.573 10.1709 17.573 8.85901C17.573 8.17259 17.4258 7.67998 16.8411 7.32911C16.2563 6.96301 15.4113 6.78681 13.8449 7.11086C6.70581 8.58775 5.49608 6.46636 5.2616 4.78158C5.02713 3.0968 6.24248 1.80309 7.86171 1.23268C9.1606 0.775124 11.0942 0.548573 13.8449 0.548573C15.7573 0.548594 17.4455 1.06022 18.8363 1.56363C20.2429 2.06706 21.4521 2.86038 22.4636 3.94345C23.5858 2.89089 24.8266 2.10517 26.1858 1.58651C30.9 -0.191578 35.5761 0.0125451 39.0593 3.49748ZM17.2716 15.4764C16.7026 15.7358 16.0782 15.957 15.3986 16.14C14.7348 16.3078 13.8891 16.4757 12.8618 16.6435C11.4869 16.857 10.0183 17.2152 9.51253 17.5965C9.02256 17.9626 8.77757 18.5042 8.77757 19.2212C8.77757 22.3651 14.4578 22.0137 16.1336 20.3963C16.9238 19.6335 17.319 18.3977 17.319 16.6892C17.319 16.3689 17.3111 16.1248 17.2953 15.957C17.2953 15.7739 17.2874 15.6137 17.2716 15.4764ZM26.9605 8.17805C26.1861 8.98657 25.7907 9.87013 25.7116 11.3346C25.7116 11.3346 32.2285 12.6019 33.394 10.7138C34.5594 8.82575 33.2014 7.66374 32.4792 7.25573C30.8016 6.30788 28.3716 6.73452 26.9605 8.17805Z"
              fill="url(#paint0_linear_59_5101)"
              fillOpacity="0.1"
            />
          </Svg>

          {/* Masked sweep effect - only shows through logo shape */}
          <MaskedView
            style={[
              styles.maskedViewContainer,
              { width: baseW, height: baseH },
            ]}
            maskElement={
              <Svg width={baseW} height={baseH} viewBox="0 0 43 28">
                <Path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M39.0593 3.49748C42.7888 7.6164 40.142 14.1262 35.1333 15.4764C32.1397 16.2835 28.4341 16.3186 25.7591 16.3231C25.8381 18.0012 26.3122 19.2521 27.1815 20.0759C28.0508 20.8844 29.347 21.2887 31.0697 21.2887C31.7018 21.2887 32.3025 21.2124 32.8715 21.0599C33.4562 20.8921 34.1202 20.6174 34.8629 20.2361C35.0684 20.1293 35.3688 19.9538 35.7639 19.7098C37.1547 18.8555 38.3244 18.4283 39.2727 18.4283C40.2051 18.4284 40.9718 18.6953 41.5723 19.2292C42.1729 19.7479 42.4732 20.4192 42.4732 21.2429C42.4732 22.9515 41.3351 24.4237 39.0593 25.6593C36.7992 26.895 34.0173 27.5128 30.714 27.5128C28.4223 27.5128 26.3991 27.139 24.6448 26.3916C22.8904 25.6441 21.5311 24.5838 20.567 23.2109C19.4448 24.6601 17.9906 25.7432 16.2047 26.4602C14.4345 27.162 12.2848 27.5128 9.75609 27.5128C4.26224 27.5128 0.574707 24.8437 0.574707 19.4168C0.574707 13.9899 4.62094 12.1447 9.82721 11.5863C10.3172 11.5253 10.9811 11.4567 11.8187 11.3804C15.517 11.0143 17.573 10.1709 17.573 8.85901C17.573 8.17259 17.4258 7.67998 16.8411 7.32911C16.2563 6.96301 15.4113 6.78681 13.8449 7.11086C6.70581 8.58775 5.49608 6.46636 5.2616 4.78158C5.02713 3.0968 6.24248 1.80309 7.86171 1.23268C9.1606 0.775124 11.0942 0.548573 13.8449 0.548573C15.7573 0.548594 17.4455 1.06022 18.8363 1.56363C20.2429 2.06706 21.4521 2.86038 22.4636 3.94345C23.5858 2.89089 24.8266 2.10517 26.1858 1.58651C30.9 -0.191578 35.5761 0.0125451 39.0593 3.49748ZM17.2716 15.4764C16.7026 15.7358 16.0782 15.957 15.3986 16.14C14.7348 16.3078 13.8891 16.4757 12.8618 16.6435C11.4869 16.857 10.0183 17.2152 9.51253 17.5965C9.02256 17.9626 8.77757 18.5042 8.77757 19.2212C8.77757 22.3651 14.4578 22.0137 16.1336 20.3963C16.9238 19.6335 17.319 18.3977 17.319 16.6892C17.319 16.3689 17.3111 16.1248 17.2953 15.957C17.2953 15.7739 17.2874 15.6137 17.2716 15.4764ZM26.9605 8.17805C26.1861 8.98657 25.7907 9.87013 25.7116 11.3346C25.7116 11.3346 32.2285 12.6019 33.394 10.7138C34.5594 8.82575 33.2014 7.66374 32.4792 7.25573C30.8016 6.30788 28.3716 6.73452 26.9605 8.17805Z"
                  fill="white"
                />
              </Svg>
            }
          >
            <Animated.View
              style={[
                styles.sweepOverlay,
                { width: baseW, height: baseH },
                sweepStyle,
              ]}
            >
              <ExpoLinearGradient
                colors={["transparent", "rgba(255,255,255,0.2)", "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sweepGradient}
              />
            </Animated.View>
          </MaskedView>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  center: { alignItems: "center", justifyContent: "center" },
  logoWrapper: {
    position: "relative",
    overflow: "hidden",
  },
  maskedViewContainer: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  sweepOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  sweepGradient: {
    width: 50,
    height: "100%",
    transform: [{ skewX: "-15deg" }],
  },
});
