// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/clerk-sdk-node";

// Define admin routes (everything under /admin EXCEPT sign-in)
const isAdminProtectedRoute = createRouteMatcher([
  "/admin((?!/sign-in).*)", // Protects /admin, /admin/dashboard, /admin/products, etc.
  // But excludes /admin/sign-in
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();

  // 1. If route is NOT admin-protected → skip (public or sign-in)
  if (!isAdminProtectedRoute(req)) {
    return NextResponse.next();
  }

  // 2. Admin-protected route → require login
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // 3. Signed in → check role
  try {
    const user = await clerkClient.users.getUser(userId);
    const role = user.publicMetadata?.role as string | undefined;

    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  } catch (error) {
    console.error("Error checking admin role:", error);
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 4. Admin → allow
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Run middleware on all routes under /admin
    "/admin/:path*",
    // Clerk needs this for auth pages (sign-in, etc.)
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
