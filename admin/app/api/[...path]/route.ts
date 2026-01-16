import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "https://urban-rush.onrender.com";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api/, ""); // Remove /api prefix
  const backendPath = `${BACKEND_URL}${path}${url.search}`;

  const response = await fetch(backendPath, {
    method: request.method,
    headers: {
      ...Object.fromEntries(request.headers),
      host: new URL(BACKEND_URL).host, // Preserve original host if needed
    },
    body: request.body ? await request.text() : undefined,
    redirect: "manual",
  });

  const data = await response.text();

  return new NextResponse(data, {
    status: response.status,
    headers: response.headers,
  });
}

// Support other methods (POST, PUT, DELETE, etc.) — copy the GET pattern or use one handler
export const POST = GET;
export const PUT = GET;
export const DELETE = GET;
export const PATCH = GET;
