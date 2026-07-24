import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";

import { AppColors } from "@/constants/theme";

type AnalysisActionButtonProps = {
  isSaved: boolean;
  onPress: () => void;
};

/**
 * AnalysisActionButton
 * Exposes the current save/delete action with an accessible icon button.
 */
export function AnalysisActionButton({
  isSaved,
  onPress,
}: AnalysisActionButtonProps) {
  const action = isSaved ? "delete" : "save";

  return (
    <Pressable
      accessibilityLabel={`${action} analysis`}
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons
        name={isSaved ? "trash-outline" : "save-outline"}
        size={22}
        color={isSaved ? AppColors.error : AppColors.accent}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.surfaceElevated,
  },
  pressed: {
    opacity: 0.7,
  },
});
