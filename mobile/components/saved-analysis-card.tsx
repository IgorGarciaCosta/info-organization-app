import { Pressable, StyleSheet, Text } from "react-native";
import Svg, { Path } from "react-native-svg";

import type { SavedAnalysisSummary } from "@/src/services/saved-analyses";

type SavedAnalysisCardProps = {
  analysis: SavedAnalysisSummary;
  onPress: () => void;
};

/**
 * darkenHexColor
 * Preserves a post-it hue while reducing each RGB channel for its folded edge.
 */
function darkenHexColor(color: string, amount = 0.18) {
  const value = color.replace("#", "");
  const darken = (channel: string) =>
    Math.round(parseInt(channel, 16) * (1 - amount))
      .toString(16)
      .padStart(2, "0");

  return `#${darken(value.slice(0, 2))}${darken(value.slice(2, 4))}${darken(value.slice(4, 6))}`;
}

/**
 * SavedAnalysisCard
 * Presents one saved analysis as a square, tappable home item.
 */
export function SavedAnalysisCard({
  analysis,
  onPress,
}: SavedAnalysisCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open analysis ${analysis.title}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          transform: [
            { rotate: `${analysis.rotation}deg` },
            { scale: pressed ? 0.97 : 1 },
          ],
        },
        pressed && styles.pressed,
      ]}
    >
      <Svg
        pointerEvents="none"
        preserveAspectRatio="none"
        style={StyleSheet.absoluteFill}
        viewBox="0 0 100 100"
      >
        {/* The paper path omits the outer top-right triangle, making it truly transparent. */}
        <Path
          d="M5 0 H82 L100 18 V95 Q100 100 95 100 H5 Q0 100 0 95 V5 Q0 0 5 0 Z"
          fill={analysis.color}
        />
        {/* The quadratic curve rounds the fold's inner corner by five units. */}
        <Path
          d="M82 0 V13 Q82 18 87 18 H100 Z"
          fill={darkenHexColor(analysis.color)}
        />
      </Svg>
      <Text numberOfLines={4} style={styles.title}>
        {analysis.title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  pressed: {
    opacity: 0.75,
  },
  title: {
    width: "100%",
    color: "#252525",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
    textAlign: "center",
    paddingRight: 30,
    paddingBottom: 30,
  },
});
