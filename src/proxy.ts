import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Rutas /[locale]/admin/** salvo /admin/login
const ADMIN_PATH_RE = /^\/(es|en)\/admin(?!\/login\b)(\/.*)?$/;
// El ruso se dio de baja: links viejos /ru/... van a la misma página en español.
const REMOVED_LOCALE_RE = /^\/ru(\/.*)?$/;
// /admin sin prefijo de idioma (entrada directa, ej. escrita a mano en la barra de direcciones)
const BARE_ADMIN_RE = /^\/admin\/?$/;

function hasSessionCookie(request: NextRequest) {
  // Chequeo optimista (solo cookie presente, sin validar contra el servidor) para UX:
  // la verificación real ocurre en la DAL (verifySession) de cada Server Component/Action.
  return request.cookies.getAll().some((c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"));
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const removedLocale = pathname.match(REMOVED_LOCALE_RE);
  if (removedLocale) {
    return NextResponse.redirect(new URL(`/${routing.defaultLocale}${removedLocale[1] ?? ""}`, request.url), 308);
  }

  if (BARE_ADMIN_RE.test(pathname)) {
    const destination = hasSessionCookie(request) ? "dashboard" : "login";
    return NextResponse.redirect(new URL(`/${routing.defaultLocale}/admin/${destination}`, request.url));
  }

  if (ADMIN_PATH_RE.test(pathname)) {
    if (!hasSessionCookie(request)) {
      const locale = pathname.split("/")[1];
      return NextResponse.redirect(new URL(`/${locale}/admin/login`, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/admin", "/ru", "/(es|en|ru)/:path*"],
};
