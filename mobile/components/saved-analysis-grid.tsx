import { FlatList, StyleSheet } from "react-native";

import { SavedAnalysisCard } from "@/components/saved-analysis-card";
import type { SavedAnalysisSummary } from "@/src/services/saved-analyses";

type SavedAnalysisGridProps = {
  analyses: SavedAnalysisSummary[];
  onAnalysisPress: (id: number) => void;
};

/**
 * SavedAnalysisGrid
 * Virtualizes saved analyses in a responsive two-column grid.
 */
export function SavedAnalysisGrid({
  analyses,
  onAnalysisPress,
}: SavedAnalysisGridProps) {
  return (
    <FlatList
      data={analyses}
      keyExtractor={(analysis) => analysis.id.toString()}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => (
        <SavedAnalysisCard
          analysis={item}
          onPress={() => onAnalysisPress(item.id)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 28,
    padding: 28,
    paddingTop: 120,
    paddingBottom: 100,
  },
  row: {
    justifyContent: "space-between",
  },
});
