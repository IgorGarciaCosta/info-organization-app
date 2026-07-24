import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SavedAnalysisGrid } from "@/components/saved-analysis-grid";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { AppColors } from "@/constants/theme";
import {
  listSavedAnalyses,
  type SavedAnalysisSummary,
} from "@/src/services/saved-analyses";

/**
 * HomeScreen
 * Lists saved analyses and keeps one clear action to add a video link.
 */
export default function HomeScreen() {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<SavedAnalysisSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reloads local records whenever the user returns from an analysis screen.
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadAnalyses() {
        try {
          const savedAnalyses = await listSavedAnalyses();
          if (isActive) {
            setAnalyses(savedAnalyses);
            setError(null);
          }
        } catch (cause) {
          if (isActive) {
            setError(
              cause instanceof Error
                ? cause.message
                : "Failed to load saved analyses.",
            );
          }
        } finally {
          if (isActive) setLoading(false);
        }
      }

      setLoading(true);
      void loadAnalyses();
      return () => {
        isActive = false;
      };
    }, []),
  );

  // Opens a saved item through the same screen used for a fresh analysis.
  function openAnalysis(id: number) {
    router.push({
      pathname: "/video-link-search",
      params: { id: id.toString() },
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.heading}>My Analysis</Text>
      {loading ? (
        <View style={styles.messageContainer}>
          <ActivityIndicator color={AppColors.accent} />
        </View>
      ) : error !== null ? (
        <View style={styles.messageContainer}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : analyses.length === 0 ? (
        <View style={styles.messageContainer}>
          <Text style={styles.message}>Nothing to see here</Text>
        </View>
      ) : (
        <SavedAnalysisGrid analyses={analyses} onAnalysisPress={openAnalysis} />
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open video link search"
        accessibilityHint="Navigates to the page where you can paste a YouTube link"
        onPress={() => router.navigate("/video-link-search")}
        style={({ pressed }) => [
          styles.floatingButton,
          pressed && styles.floatingButtonPressed,
        ]}
      >
        <IconSymbol
          name="doc.on.clipboard"
          size={27}
          color={AppColors.onAccent}
          weight="semibold"
        />
      </Pressable>
    </SafeAreaView>
  );
}

// Centralized styles keep layout details outside the component tree.
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  messageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    color: AppColors.text,
    fontSize: 26,
    fontWeight: "700",
    paddingTop: 30,
    paddingLeft: 30,
  },
  message: {
    color: AppColors.textMuted,
    fontSize: 18,
    fontWeight: "500",
  },
  error: {
    color: AppColors.error,
    fontSize: 15,
    textAlign: "center",
  },
  floatingButton: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.accent,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
});
