import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
export const signUp = async (email: string, password: string) => {
  const supabase = createClientComponentClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { data, error };
};



export const logIn = async (email: string, password: string) => {
  const supabase = createClientComponentClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};

export const logOut = async () => {
  const supabase = createClientComponentClient();
  await supabase.auth.signOut();
};