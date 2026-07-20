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

import { AppColors } from "@/constants/theme";
import { summarizeTranscript } from "@/src/services/ai";
import { fetchTranscript } from "@/src/services/transcription";

/**
 * VideoLinkSearchPage
 * Accepts a YouTube link and presents its transcript and AI-generated summary.
 */
export default function VideoLinkSearchPage() {
  // Controlled input value (same idea as value + onChange on a web <input>).
  const [url, setUrl] = useState("");
  // True while the transcript request is in flight.
  const [loading, setLoading] = useState(false);
  // Readable error message to display, or null when there is none.
  const [error, setError] = useState<string | null>(null);
  // The fetched transcript text, or null before the first successful request.
  const [transcript, setTranscript] = useState<string | null>(null);
  // True while the AI backend is turning the transcript into a summary.
  const [summarizing, setSummarizing] = useState(false);
  // The AI-generated summary, or null before it is ready.
  const [summary, setSummary] = useState<string | null>(null);

  // Fetches the transcript and then asks the AI backend to summarize it.
  async function handleSubmit() {
    const trimmed = url.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setTranscript(null);
    setSummary(null);

    try {
      const result = await fetchTranscript(trimmed);
      setTranscript(result.text);

      setSummarizing(true);
      try {
        const aiSummary = await summarizeTranscript(result.text);
        setSummary(aiSummary);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to summarize.");
      } finally {
        setSummarizing(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["right", "bottom", "left"]}>
      {/* KeyboardAvoidingView moves the form above the software keyboard on iOS. */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Adicione aqui o link do YouTube</Text>

          <TextInput
            style={styles.input}
            placeholder="https://www.youtube.com/watch?v=..."
            placeholderTextColor={AppColors.textMuted}
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            editable={!loading}
          />

          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.button,
              (pressed || loading) && styles.buttonPressed,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={AppColors.onAccent} />
            ) : (
              <Text style={styles.buttonText}>Submit</Text>
            )}
          </Pressable>

          {error && <Text style={styles.error}>{error}</Text>}

          {transcript !== null && (
            <>
              {summarizing && (
                <View style={styles.summarizingRow}>
                  <ActivityIndicator color={AppColors.accent} />
                  <Text style={styles.summarizingText}>
                    Resumindo com IA...
                  </Text>
                </View>
              )}

              {summary !== null && (
                <View style={styles.summaryBox}>
                  <Text style={styles.summaryLabel}>Resumo (IA)</Text>
                  <Text style={styles.summaryText}>{summary}</Text>
                </View>
              )}

              <ScrollView
                style={styles.transcriptBox}
                contentContainerStyle={styles.transcriptContent}
              >
                <Text style={styles.transcriptText}>{transcript}</Text>
              </ScrollView>

              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.clearButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => {
                  setTranscript(null);
                  setSummary(null);
                  setUrl("");
                }}
              >
                <Text style={styles.clearButtonText}>Clean Textbox</Text>
              </Pressable>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Centralized styles keep the component readable and make the dark palette consistent.
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.background,
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
    color: AppColors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: AppColors.text,
    backgroundColor: AppColors.surface,
  },
  button: {
    minHeight: 48,
    backgroundColor: AppColors.accent,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: AppColors.onAccent,
    fontSize: 16,
    fontWeight: "700",
  },
  clearButton: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: AppColors.accent,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonText: {
    color: AppColors.accent,
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    color: AppColors.error,
    fontSize: 14,
  },
  summarizingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  summarizingText: {
    fontSize: 14,
    color: AppColors.accent,
  },
  summaryBox: {
    borderWidth: 1,
    borderColor: AppColors.accent,
    borderRadius: 12,
    backgroundColor: AppColors.accentMuted,
    padding: 14,
    gap: 6,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: AppColors.accent,
    textTransform: "uppercase",
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 22,
    color: AppColors.text,
  },
  transcriptBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 12,
    backgroundColor: AppColors.surface,
  },
  transcriptContent: {
    padding: 14,
  },
  transcriptText: {
    fontSize: 15,
    lineHeight: 22,
    color: AppColors.text,
  },
});
