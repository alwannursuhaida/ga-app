// made by al with love
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "dev-secret-ganti-di-production"
);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("ga_session")?.value;
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");

  if (!isDashboard) return NextResponse.next();

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    await jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
