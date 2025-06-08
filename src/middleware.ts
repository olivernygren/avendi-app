import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest } from "next/server";
import { updateSession } from "./utils/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // 1. Handle Supabase session update.
  const supabaseResponse = await updateSession(request);

  const isSupabaseRedirect =
    supabaseResponse.status >= 300 &&
    supabaseResponse.status < 400 &&
    supabaseResponse.headers.has("location");

  if (isSupabaseRedirect) {
    return supabaseResponse;
  }

  // 3. If Supabase did not redirect, proceed with `next-intl`.
  const i18nResponse = intlMiddleware(request);

  // 4. Merge headers from `supabaseResponse` onto `i18nResponse`.
  supabaseResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      i18nResponse.headers.append(key, value);
    }
  });
  return i18nResponse;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
