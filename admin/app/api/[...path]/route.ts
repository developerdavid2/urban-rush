import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api/, ""); // remove /api prefix
  const backendUrl = `https://urban-rush.onrender.com${path}${url.search}`;

  const response = await fetch(backendUrl, {
    method: req.method,
    headers: req.headers,
    body: req.body ? await req.text() : undefined,
  });

  const data = await response.text();
  return new NextResponse(data, {
    status: response.status,
    headers: response.headers,
  });
}
