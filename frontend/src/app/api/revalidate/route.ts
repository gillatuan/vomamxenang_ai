import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

type Scope = "ALL" | "PRODUCT" | "POST" | "PATH";
const publicPaths = ["/", "/products", "/blog", "/about", "/sitemap.xml"];

export async function POST(request: NextRequest) {
  const secret = process.env.FRONTEND_REVALIDATION_SECRET;
  if (!secret || request.headers.get("x-revalidation-secret") !== secret) return NextResponse.json({ message: "Unauthorized cache revalidation request." }, { status: 401 });
  const body = await request.json().catch(() => null) as { scope?: Scope; id?: string; path?: string } | null;
  if (!body?.scope) return NextResponse.json({ message: "A cache scope is required." }, { status: 400 });
  const paths = body.scope === "ALL" ? publicPaths
    : body.scope === "PRODUCT" && body.id ? ["/products", `/products/${body.id}`, "/sitemap.xml"]
    : body.scope === "POST" && body.id ? ["/blog", `/blog/${body.id}`, "/sitemap.xml"]
    : body.scope === "PATH" && body.path?.startsWith("/") ? [body.path]
    : [];
  if (!paths.length) return NextResponse.json({ message: "Invalid cache purge request." }, { status: 400 });
  paths.forEach((path) => revalidatePath(path));
  return NextResponse.json({ revalidated: true, paths });
}
