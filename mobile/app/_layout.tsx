import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AppColors } from "@/constants/theme";

export const unstable_settings = {
  initialRouteName: "index",
};

const appTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: AppColors.accent,
    background: AppColors.background,
    card: AppColors.surface,
    text: AppColors.text,
    border: AppColors.border,
    notification: AppColors.error,
  },
};

/**
 * RootLayout
 * Keeps the app permanently dark and provides native stack navigation between screens.
 */
export default function RootLayout() {
  return (
    <ThemeProvider value={appTheme}>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: AppColors.background },
          headerStyle: { backgroundColor: AppColors.background },
          headerTintColor: AppColors.text,
          headerShadowVisible: false,
          statusBarStyle: "light",
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="video-link-search"
          options={{
            title: "",
            headerBackButtonDisplayMode: "minimal",
          }}
        />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
