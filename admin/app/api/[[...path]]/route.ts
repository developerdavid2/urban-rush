// admin/app/api/[[...path]]/route.ts   ← or [...path]/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "https://urban-rush.onrender.com";

export async function allMethods(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Remove /api prefix
  let path = pathname.replace(/^\/api/, "");

  // If path is empty (for optional catch-all), proxy to backend root or handle as needed
  if (path === "" || path === "/") path = "/health"; // optional: default to health if plain /api

  const targetUrl = `${BACKEND_URL}${path}${url.search}`;

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        ...Object.fromEntries(request.headers),
        host: new URL(BACKEND_URL).host,
      },
      body: request.body ? await request.text() : undefined,
      redirect: "manual",
    });

    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Proxy failed" }, { status: 502 });
  }
}

// Assign all methods
export const GET = allMethods;
export const POST = allMethods;
export const PUT = allMethods;
export const DELETE = allMethods;
export const PATCH = allMethods;
export const HEAD = allMethods;
export const OPTIONS = allMethods;
