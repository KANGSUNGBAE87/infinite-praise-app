type SupabaseFunctionConfig = {
  endpoint: string;
  headers: Record<string, string>;
};

function getPublicEnv(name: keyof ImportMetaEnv) {
  return import.meta.env[name]?.trim();
}

export function getSupabaseFunctionConfig(functionName: string): SupabaseFunctionConfig | null {
  const supabaseUrl = getPublicEnv("VITE_SUPABASE_URL")?.replace(/\/$/, "");
  const anonKey = getPublicEnv("VITE_SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) return null;

  return {
    endpoint: `${supabaseUrl}/functions/v1/${functionName}`,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  };
}
