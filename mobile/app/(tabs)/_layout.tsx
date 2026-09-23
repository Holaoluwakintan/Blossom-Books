import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";

export default function TabsLayout() {
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted, tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 64, paddingBottom: 8, paddingTop: 8 } }}>
    <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} /> }} />
    <Tabs.Screen name="discover" options={{ title: "Discover", tabBarIcon: ({ color, size }) => <Ionicons name="search-outline" color={color} size={size} /> }} />
    <Tabs.Screen name="library" options={{ title: "Library", tabBarIcon: ({ color, size }) => <Ionicons name="bookmark-outline" color={color} size={size} /> }} />
    <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} /> }} />
  </Tabs>;
}
