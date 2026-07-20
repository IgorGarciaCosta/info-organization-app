import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { AppColors } from "@/constants/theme";

/**
 * HomeScreen
 * Presents an intentionally empty landing page with one clear action to add a video link.
 */
export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.messageContainer}>
        <Text style={styles.message}>Nothing to see here</Text>
      </View>

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
  message: {
    color: AppColors.textMuted,
    fontSize: 18,
    fontWeight: "500",
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
