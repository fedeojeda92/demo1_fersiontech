import { loginAction } from "@/lib/actions/auth";
import LoginForm from "@/components/admin/LoginForm";

export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const boundLoginAction = loginAction.bind(null, locale);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-mesh-subtle">
      <div className="w-full max-w-md glass-card rounded-2xl p-8">
        <h1 className="font-heading text-2xl text-gradient-gold mb-1">
          Panel de administración
        </h1>
        <p className="text-smoke text-sm mb-6">FS Inmobiliaria</p>
        <LoginForm action={boundLoginAction} />
      </div>
    </div>
  );
}
