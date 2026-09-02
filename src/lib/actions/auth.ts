"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentAgent } from "@/lib/dal";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginState = { error: string } | undefined;

export async function loginAction(
  locale: string,
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Ingresá un email y una contraseña válidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "Email o contraseña incorrectos." };
  }

  redirect(`/${locale}/admin/dashboard`);
}

export async function logoutAction(locale: string, _formData: FormData) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/${locale}/admin/login`);
}

export async function disconnectGoogleCalendarAction(locale: string): Promise<void> {
  const agent = await getCurrentAgent(locale);
  const supabase = await createClient();

  await supabase
    .from("agents")
    .update({ google_refresh_token: null, google_email: null, google_connected_at: null })
    .eq("id", agent.id);

  revalidatePath(`/${locale}/admin/agenda`);
}
