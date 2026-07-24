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

import { AnalysisActionButton } from "@/components/analysis-action-button";
import { AnalysisStatusLabel } from "@/components/analysis-status-label";
import { AppColors } from "@/constants/theme";
import {
  ContentAnalysis,
  ContentTopic,
  IMPORTANCE_LEVELS,
  summarizeTranscript,
  TopicImportance,
} from "@/src/services/ai";
import { fetchTranscript } from "@/src/services/transcription";

const IMPORTANCE_COLORS: Record<TopicImportance, string> = {
  high: "#FF818C",
  medium: "#F5C76B",
  low: "#72C7A5",
};

/**
 * TopicCard
 * Presents one AI-extracted topic with a visual importance indicator.
 */
function TopicCard({ topic }: { topic: ContentTopic }) {
  const importanceColor = IMPORTANCE_COLORS[topic.importance];

  return (
    <View style={[styles.topicCard, { borderLeftColor: importanceColor }]}>
      <View style={styles.topicHeader}>
        <Text style={styles.topicTitle}>{topic.title}</Text>
        <View
          style={[styles.importanceBadge, { backgroundColor: importanceColor }]}
        >
          <Text style={styles.importanceText}>{topic.importance}</Text>
        </View>
      </View>
      <Text style={styles.topicContent}>{topic.content}</Text>
    </View>
  );
}

/**
 * TopicGroup
 * Groups related topic cards under one consistent importance level.
 */
function TopicGroup({
  importance,
  topics,
}: {
  importance: TopicImportance;
  topics: ContentTopic[];
}) {
  const matchingTopics = topics.filter(
    (topic) => topic.importance === importance,
  );
  if (matchingTopics.length === 0) return null;

  return (
    <View style={styles.topicGroup}>
      <Text style={styles.topicGroupTitle}>{importance} importance</Text>
      {matchingTopics.map((topic) => (
        <TopicCard key={topic.title} topic={topic} />
      ))}
    </View>
  );
}

/**
 * ContentAnalysisView
 * Maps Gemini's structured fields to dedicated native UI sections.
 */
function ContentAnalysisView({
  analysis,
  onStatusChange,
}: {
  analysis: ContentAnalysis;
  onStatusChange: (text: string) => void;
}) {
  const [isSaved, setIsSaved] = useState(false);

  // Updates only the local UI until analysis persistence is implemented.
  function handleAnalysisAction() {
    const nextIsSaved = !isSaved;
    setIsSaved(nextIsSaved);
    onStatusChange(nextIsSaved ? "Analysis saved" : "Analysis deleted");
  }

  return (
    <View style={styles.analysisBox}>
      <View style={styles.analysisHeader}>
        <Text style={styles.analysisTitle}>{analysis.title}</Text>
        <AnalysisActionButton
          isSaved={isSaved}
          onPress={handleAnalysisAction}
        />
      </View>
      <Text style={styles.analysisSubtitle}>{analysis.subtitle}</Text>

      <View style={styles.metadataRow}>
        <View style={styles.metadataBadge}>
          <Text style={styles.metadataLabel}>Theme</Text>
          <Text style={styles.metadataValue}>{analysis.theme}</Text>
        </View>
        <View style={styles.metadataBadge}>
          <Text style={styles.metadataLabel}>Genre</Text>
          <Text style={styles.metadataValue}>{analysis.genre}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Key Topics</Text>
      {IMPORTANCE_LEVELS.map((importance) => (
        <TopicGroup
          key={importance}
          importance={importance}
          topics={analysis.topics}
        />
      ))}
    </View>
  );
}

/**
 * VideoLinkSearchPage
 * Accepts a YouTube link and presents its transcript and structured AI analysis.
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
  // Keeps long transcript text collapsed until the user explicitly requests it.
  const [isTranscriptVisible, setIsTranscriptVisible] = useState(false);
  // True while the AI backend is turning the transcript into a summary.
  const [summarizing, setSummarizing] = useState(false);
  // Structured AI analysis, or null before it is ready.
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  // Temporary feedback shown by the screen-level animated status label.
  const [analysisStatus, analysisSaveStatus] = useState<string | null>(null);

  // Fetches the transcript and then asks the AI backend to summarize it.
  async function handleSubmit() {
    const trimmed = url.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setTranscript(null);
    setIsTranscriptVisible(false);
    setAnalysis(null);
    analysisSaveStatus(null);

    try {
      const transcriptText = await fetchTranscript(trimmed);
      setTranscript(transcriptText);

      setSummarizing(true);
      try {
        const contentAnalysis = await summarizeTranscript(transcriptText);
        setAnalysis(contentAnalysis);
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
          <Text style={styles.title}>Add a YouTube link</Text>

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
                    Summarizing with AI...
                  </Text>
                </View>
              )}

              <ScrollView
                style={styles.results}
                contentContainerStyle={styles.resultsContent}
              >
                {analysis !== null && (
                  <ContentAnalysisView
                    analysis={analysis}
                    onStatusChange={analysisSaveStatus}
                  />
                )}
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.clearButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() => setIsTranscriptVisible((visible) => !visible)}
                >
                  <Text style={styles.clearButtonText}>
                    {isTranscriptVisible
                      ? "Hide transcript"
                      : "Read full transcript"}
                  </Text>
                </Pressable>
                {isTranscriptVisible && (
                  <View style={styles.transcriptBox}>
                    <Text style={styles.transcriptLabel}>
                      Original Transcript
                    </Text>
                    <Text style={styles.transcriptText}>{transcript}</Text>
                  </View>
                )}
              </ScrollView>

              {isTranscriptVisible && (
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.clearButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() => {
                    setTranscript(null);
                    setIsTranscriptVisible(false);
                    setAnalysis(null);
                    analysisSaveStatus(null);
                    setUrl("");
                  }}
                >
                  <Text style={styles.clearButtonText}>Clear</Text>
                </Pressable>
              )}
            </>
          )}
        </View>
      </KeyboardAvoidingView>
      <AnalysisStatusLabel text={analysisStatus} />
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
  results: {
    flex: 1,
  },
  resultsContent: {
    gap: 16,
    paddingBottom: 4,
  },
  analysisBox: {
    borderWidth: 1,
    borderColor: AppColors.accent,
    borderRadius: 12,
    backgroundColor: AppColors.accentMuted,
    padding: 14,
    gap: 12,
  },
  analysisHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  analysisTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "700",
    color: AppColors.text,
  },
  analysisSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: AppColors.textMuted,
  },
  metadataRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metadataBadge: {
    flexGrow: 1,
    borderRadius: 8,
    backgroundColor: AppColors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 2,
  },
  metadataLabel: {
    color: AppColors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  metadataValue: {
    color: AppColors.text,
    fontSize: 14,
    textTransform: "capitalize",
  },
  sectionTitle: {
    color: AppColors.accent,
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  topicGroup: {
    gap: 8,
  },
  topicGroupTitle: {
    color: AppColors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  topicCard: {
    borderLeftWidth: 4,
    borderRadius: 8,
    backgroundColor: AppColors.surfaceElevated,
    padding: 12,
    gap: 8,
  },
  topicHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  topicTitle: {
    flex: 1,
    color: AppColors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  topicContent: {
    color: AppColors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  importanceBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  importanceText: {
    color: AppColors.onAccent,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  transcriptBox: {
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 12,
    backgroundColor: AppColors.surface,
    padding: 14,
    gap: 8,
  },
  transcriptLabel: {
    color: AppColors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  transcriptText: {
    fontSize: 15,
    lineHeight: 22,
    color: AppColors.text,
  },
});
