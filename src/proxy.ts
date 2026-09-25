import { NextResponse, type NextRequest } from "next/server";
import { decrypt, SESSION_COOKIE } from "@/lib/session";

// Optimistic checks from the cookie alone (no database). Pages still verify
// the user through the data access layer in src/lib/dal.ts.
const protectedPrefixes = ["/dashboard", "/client", "/freelancer"];
const authPages = ["/login", "/signup"];

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtected = protectedPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
  const isAuthPage = authPages.includes(path);
  if (!isProtected && !isAuthPage) return NextResponse.next();

  const session = await decrypt(request.cookies.get(SESSION_COOKIE)?.value);

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
