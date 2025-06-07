// import createMiddleware from "next-intl/middleware";
// import { routing } from "./i18n/routing";
// // import { NextRequest } from "next/server";
// // import { updateSession } from "./utils/supabase/middleware";

// // export async function middleware(request: NextRequest) {
// //   return await updateSession(request);
// // }

// export default createMiddleware(routing);

// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// };

// filepath: /Users/oliver/Desktop/kodprojekt/avendi-app/src/middleware.ts
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing"; // Ensure this path and export are correct
import { NextRequest, NextResponse } from "next/server"; // Make sure NextResponse is imported
import { updateSession } from "./utils/supabase/middleware"; // Ensure this path is correct

// Initialize next-intl middleware
const intlMiddleware = createIntlMiddleware(routing);

export default async function middleware(request: NextRequest) {
  console.log(
    `[Middleware] Path: ${request.nextUrl.pathname}${request.nextUrl.search}`
  );

  // 1. Handle Supabase session update.
  const supabaseResponse = await updateSession(request);
  console.log(
    `[Middleware] Supabase response status: ${
      supabaseResponse.status
    }, location: ${supabaseResponse.headers.get("location")}`
  );

  const isSupabaseRedirect =
    supabaseResponse.status >= 300 &&
    supabaseResponse.status < 400 &&
    supabaseResponse.headers.has("location");

  if (isSupabaseRedirect) {
    console.log(
      `[Middleware] Supabase redirecting to: ${supabaseResponse.headers.get(
        "location"
      )}`
    );
    return supabaseResponse;
  }

  // 3. If Supabase did not redirect, proceed with `next-intl`.
  const i18nResponse = intlMiddleware(request);
  console.log(
    `[Middleware] i18n response status: ${
      i18nResponse.status
    }, location: ${i18nResponse.headers.get("location")}`
  );

  // 4. Merge headers from `supabaseResponse` onto `i18nResponse`.
  supabaseResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      i18nResponse.headers.append(key, value);
    }
  });
  console.log(
    `[Middleware] Final response status: ${
      i18nResponse.status
    }, location: ${i18nResponse.headers.get("location")}`
  );
  return i18nResponse;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
