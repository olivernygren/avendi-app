// import { createServerClient } from "@supabase/ssr";
// import { NextResponse, type NextRequest } from "next/server";

// export async function updateSession(request: NextRequest) {
//   let supabaseResponse = NextResponse.next({
//     request,
//   });

//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return request.cookies.getAll();
//         },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value }) =>
//             request.cookies.set(name, value)
//           );
//           supabaseResponse = NextResponse.next({
//             request,
//           });
//           cookiesToSet.forEach(({ name, value, options }) =>
//             supabaseResponse.cookies.set(name, value, options)
//           );
//         },
//       },
//     }
//   );

//   // Do not run code between createServerClient and
//   // supabase.auth.getUser(). A simple mistake could make it very hard to debug
//   // issues with users being randomly logged out.

//   // IMPORTANT: DO NOT REMOVE auth.getUser()

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (
//     !user &&
//     !request.nextUrl.pathname.startsWith("/login") &&
//     !request.nextUrl.pathname.startsWith("/auth")
//   ) {
//     // no user, potentially respond by redirecting the user to the login page
//     const url = request.nextUrl.clone();
//     url.pathname = "/login";
//     return NextResponse.redirect(url);
//   }

//   // IMPORTANT: You *must* return the supabaseResponse object as it is.
//   // If you're creating a new response object with NextResponse.next() make sure to:
//   // 1. Pass the request in it, like so:
//   //    const myNewResponse = NextResponse.next({ request })
//   // 2. Copy over the cookies, like so:
//   //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
//   // 3. Change the myNewResponse object to fit your needs, but avoid changing
//   //    the cookies!
//   // 4. Finally:
//   //    return myNewResponse
//   // If this is not done, you may be causing the browser and server to go out
//   // of sync and terminate the user's session prematurely!

//   return supabaseResponse;
// }

// Filepath: src/utils/supabase/middleware.ts (This is where you'd make changes)
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing"; // Assuming your routing config is accessible

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Define your base public paths
  const basePublicPaths = ["/login", "/auth/callback"]; // Add any other public paths like /signup, /password-reset

  // Generate locale-prefixed public paths
  const allPublicPaths = [...basePublicPaths];
  if (routing && routing.locales) {
    // Check if routing and locales are defined
    routing.locales.forEach((locale) => {
      basePublicPaths.forEach((basePath) => {
        allPublicPaths.push(`/${locale}${basePath}`);
      });
    });
  }
  // Also consider paths that might not be prefixed if prefixDefault is false for the default locale
  // This depends heavily on your next-intl routing.locales and pathnames configuration.

  const isPublicPath = allPublicPaths.some(
    (publicPath) =>
      pathname === publicPath || pathname.startsWith(publicPath + "/")
  );

  if (!user && !isPublicPath) {
    // User is not authenticated and not on a public path, redirect to login.
    // Construct the login URL respecting the current or default locale.
    const currentLocale =
      routing.locales.find((loc) => pathname.startsWith(`/${loc}`)) ||
      routing.defaultLocale;
    const loginUrl = new URL(`/${currentLocale}/login`, request.url).toString(); // Adjust if your login path is different

    return NextResponse.redirect(loginUrl);
  }

  if (
    user &&
    (pathname === "/login" ||
      (routing &&
        routing.locales &&
        routing.locales.some((loc) => pathname === `/${loc}/login`)))
  ) {
    // User is authenticated and on a login page, redirect to a default authenticated page (e.g., dashboard)
    // Also respect locale for the redirect target.
    const currentLocale =
      routing.locales.find((loc) => pathname.startsWith(`/${loc}`)) ||
      routing.defaultLocale;
    const homeUrl = new URL(`/${currentLocale}/`, request.url).toString(); // Or e.g., /${currentLocale}/dashboard

    return NextResponse.redirect(homeUrl);
  }

  // If no redirect is needed by Supabase logic, return the initial supabaseResponse
  // which allows next-intl to process.
  return supabaseResponse;
}
