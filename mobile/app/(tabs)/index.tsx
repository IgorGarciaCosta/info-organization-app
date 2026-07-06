import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { fetchTranscript } from "@/src/services/transcription";

/**
 * HomeScreen
 * Single entry screen of the app: the user pastes a YouTube link, taps Submit,
 * and the fetched transcript is shown in a scrollable box below. All network
 * state (loading / error / result) is handled locally with useState, exactly
 * like you would in a React web component.
 */
export default function HomeScreen() {
  // Controlled input value (same idea as value + onChange on a web <input>).
  const [url, setUrl] = useState("");
  // True while the request is in flight: used to show a spinner and disable the button.
  const [loading, setLoading] = useState(false);
  // Readable error message to display, or null when there is none.
  const [error, setError] = useState<string | null>(null);
  // The fetched transcript text, or null before the first successful request.
  const [transcript, setTranscript] = useState<string | null>(null);

  // Runs when the user taps Submit: calls the backend and updates screen state.
  async function handleSubmit() {
    const trimmed = url.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setTranscript(null);

    try {
      const result = await fetchTranscript(trimmed);
      setTranscript(result.text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Pushes the content up when the keyboard opens (mostly relevant on iOS). */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Adicione aqui o link do YouTube</Text>

          <TextInput
            style={styles.input}
            placeholder="https://www.youtube.com/watch?v=..."
            placeholderTextColor="#9BA1A6"
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            editable={!loading}
          />

          <Pressable
            style={({ pressed }) => [
              styles.button,
              (pressed || loading) && styles.buttonPressed,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Submit</Text>
            )}
          </Pressable>

          {/* Error message, only rendered when there is one. */}
          {error && <Text style={styles.error}>{error}</Text>}

          {/* Scrollable transcript box, only rendered after a successful fetch. */}
          {transcript !== null && (
            <ScrollView
              style={styles.transcriptBox}
              contentContainerStyle={styles.transcriptContent}
            >
              <Text style={styles.transcriptText}>{transcript}</Text>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Centralized styles keep the component readable and the styles reusable.
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#11181C",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D0D7DE",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#11181C",
  },
  button: {
    backgroundColor: "#0a7ea4",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    color: "#D14343",
    fontSize: 14,
  },
  transcriptBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D0D7DE",
    borderRadius: 10,
    backgroundColor: "#F6F8FA",
  },
  transcriptContent: {
    padding: 14,
  },
  transcriptText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#11181C",
  },
});
