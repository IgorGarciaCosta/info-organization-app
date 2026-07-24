import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { AppColors } from "@/constants/theme";

type AnalysisStatusLabelProps = {
  text: string | null;
};

/**
 * AnalysisStatusLabel
 * Briefly presents action feedback above the bottom edge of the screen.
 */
export function AnalysisStatusLabel({ text }: AnalysisStatusLabelProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (text === null) return;

    setIsVisible(true);
    opacity.setValue(0);

    const animation = Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished) setIsVisible(false);
    });

    return () => animation.stop();
  }, [opacity, text]);

  if (!isVisible || text === null) return null;

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      pointerEvents="none"
      style={[styles.position, { opacity }]}
    >
      <View style={styles.label}>
        <Text style={styles.text}>{text}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  position: {
    position: "absolute",
    right: 20,
    bottom: 60,
    left: 20,
    zIndex: 10,
    alignItems: "center",
  },
  label: {
    borderRadius: 999,
    backgroundColor: "rgba(206, 220, 226, 0.06)",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  text: {
    color: AppColors.text,
    fontSize: 14,
    fontWeight: "600",
  },
});
