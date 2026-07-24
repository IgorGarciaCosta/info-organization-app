import { Pressable, StyleSheet, Text, View } from "react-native";

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
          backgroundColor: analysis.color,
          transform: [
            { rotate: `${analysis.rotation}deg` },
            { scale: pressed ? 0.97 : 1 },
          ],
        },
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.fold,
          { borderLeftColor: darkenHexColor(analysis.color) },
        ]}
      />
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
    borderRadius: 5,
    overflow: "hidden",
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
  fold: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderTopWidth: 28,
    borderLeftWidth: 28,
    borderTopColor: "rgba(0, 0, 0, 0.71)",
    borderLeftColor: "transparent",
    borderBottomLeftRadius: 5,
  },
  title: {
    color: "#252525",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
    textAlign: "center",
  },
});
