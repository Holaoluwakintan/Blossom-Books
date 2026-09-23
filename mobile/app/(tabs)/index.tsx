import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { colors, spacing } from "@/constants/theme";
import { listStories, type Story } from "@/lib/api";

export default function HomeScreen() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  useEffect(() => { listStories({ limit: 20 }).then(setStories).catch((err) => setError(err instanceof Error ? err.message : "Could not load stories")).finally(() => setLoading(false)); }, []);
  return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><FlatList data={stories} keyExtractor={(item) => String(item.id)} contentContainerStyle={styles.content} ListHeaderComponent={<View><Text style={styles.kicker}>BLOSSOM STORIES</Text><Text style={styles.title}>Make room for a good story.</Text><Text style={styles.subtitle}>Thoughtful Christian stories for the quiet moments that matter.</Text><Text style={styles.sectionTitle}>Freshly published</Text></View>} ListEmptyComponent={loading ? <ActivityIndicator color={colors.primary} /> : <View style={styles.empty}><Text style={styles.emptyTitle}>{error ? "Could not load stories" : "No published stories yet"}</Text><Text style={styles.emptyText}>{error ?? "Check back soon for the first Blossom story."}</Text></View>} renderItem={({ item }) => <StoryCard story={item} />} /> </ScreenContainer>;
}

function StoryCard({ story }: { story: Story }) {
  return <Link href={{ pathname: "/story/[slug]", params: { slug: story.slug } }} asChild><Pressable style={({ pressed }) => [styles.card, pressed && { opacity: .82 }]}><Image source={story.coverUrl ? { uri: story.coverUrl } : undefined} style={styles.cover} /><View style={styles.cardBody}><Text style={styles.category}>{story.category}</Text><Text style={styles.cardTitle}>{story.title}</Text><Text style={styles.author}>By {story.authorName}</Text><Text numberOfLines={2} style={styles.description}>{story.description}</Text><Text style={styles.meta}>{story.estimatedMinutes} min read · {story.reviewCount} reviews</Text></View></Pressable></Link>;
}

const styles = StyleSheet.create({ content: { paddingTop: spacing.lg, paddingBottom: 36 }, kicker: { color: colors.primary, fontSize: 11, fontWeight: "700", letterSpacing: 2 }, title: { color: colors.foreground, fontSize: 34, fontWeight: "700", lineHeight: 39, marginTop: 10 }, subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 12, marginBottom: 28 }, sectionTitle: { color: colors.foreground, fontSize: 22, fontWeight: "700", marginBottom: 14 }, card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, flexDirection: "row", marginBottom: 14, overflow: "hidden" }, cover: { backgroundColor: colors.peach, height: 180, width: 116 }, cardBody: { flex: 1, padding: 14 }, category: { color: colors.primary, fontSize: 10, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }, cardTitle: { color: colors.foreground, fontSize: 20, fontWeight: "700", lineHeight: 23, marginTop: 6 }, author: { color: colors.muted, fontSize: 12, marginTop: 4 }, description: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 12 }, meta: { color: colors.muted, fontSize: 11, marginTop: 12 }, empty: { alignItems: "center", backgroundColor: colors.surface, borderRadius: 16, padding: 24 }, emptyTitle: { color: colors.foreground, fontSize: 18, fontWeight: "700" }, emptyText: { color: colors.muted, fontSize: 14, marginTop: 8, textAlign: "center" } });
