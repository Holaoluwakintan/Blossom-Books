import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { colors, spacing } from "@/constants/theme";

export default function LibraryScreen() { return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><View style={styles.content}><Text style={styles.kicker}>YOUR LIBRARY</Text><Text style={styles.title}>Keep stories close.</Text><Text style={styles.body}>Sign in to sync saved stories and reading progress across your devices.</Text><Link href="/profile" style={styles.button}>Open profile</Link><Text style={styles.note}>Saved-story synchronization will use the same Blossom reader API as the web app.</Text></View></ScreenContainer>; }
const styles = StyleSheet.create({ content: { paddingTop: spacing.xl }, kicker: { color: colors.primary, fontSize: 11, fontWeight: "700", letterSpacing: 2 }, title: { color: colors.foreground, fontSize: 32, fontWeight: "700", marginTop: 10 }, body: { color: colors.muted, fontSize: 16, lineHeight: 24, marginTop: 16 }, button: { alignSelf: "flex-start", backgroundColor: colors.primaryDark, borderRadius: 10, color: "white", fontWeight: "700", marginTop: 24, overflow: "hidden", paddingHorizontal: 18, paddingVertical: 13 }, note: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 24 } });
