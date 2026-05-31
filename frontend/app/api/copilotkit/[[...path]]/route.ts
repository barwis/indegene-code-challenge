// optional catch-all segment.

import { handleRequest } from "../handler";
import type { NextRequest } from "next/server";

export const GET = (req: NextRequest): Response | Promise<Response> => {
  const { pathname } = new URL(req.url);
  if (pathname.endsWith("/threads")) {
    return Response.json({ threads: [] });
  }
  return handleRequest(req);
};

export const POST = (req: NextRequest): Response | Promise<Response> =>
  handleRequest(req);
