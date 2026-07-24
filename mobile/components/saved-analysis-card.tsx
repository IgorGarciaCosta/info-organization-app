import { Pressable, StyleSheet, Text } from "react-native";

import { AppColors } from "@/constants/theme";
import type { SavedAnalysisSummary } from "@/src/services/saved-analyses";

type SavedAnalysisCardProps = {
  analysis: SavedAnalysisSummary;
  onPress: () => void;
};

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
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
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
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.surface,
    padding: 16,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  title: {
    color: AppColors.text,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
    textAlign: "center",
  },
});
