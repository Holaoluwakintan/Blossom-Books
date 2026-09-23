import Constants from "expo-constants";

export type Story = {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  category: string;
  coverUrl: string | null;
  authorName: string;
  estimatedMinutes: number;
  reviewCount: number;
  rating: string | null;
};

const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? Constants.expoConfig?.extra?.apiUrl ?? "http://localhost:3000";

function encodeInput(input: unknown) {
  return encodeURIComponent(JSON.stringify({ json: input }));
}

export async function listStories(input: { query?: string; category?: string; limit?: number; offset?: number } = {}) {
  const response = await fetch(`${baseUrl}/api/trpc/stories.list?input=${encodeInput(input)}`, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Could not load stories (${response.status})`);
  const payload = await response.json() as { result?: { data?: { json?: Story[] } } };
  return payload.result?.data?.json ?? [];
}

export async function getStory(slug: string) {
  const response = await fetch(`${baseUrl}/api/trpc/stories.bySlug?input=${encodeInput({ slug })}`, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Could not load story (${response.status})`);
  const payload = await response.json() as { result?: { data?: { json?: Story } } };
  return payload.result?.data?.json;
}
