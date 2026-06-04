import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { HttpAgent } from "@ag-ui/client";
import type { NextRequest } from "next/server";

const runtime = new CopilotRuntime({
  agents: {
    recipe_agent: new HttpAgent({
      url:
        process.env.BACKEND_COPILOTKIT_URL ??
        "http://localhost:8000/copilotkit",
    }),
  },
});

const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
  runtime,
  endpoint: "/api/copilotkit",
});

export const handler = async (req: NextRequest) => {
  // copilotRuntimeNextJSAppRouterEndpoint uses single-route mode: its Hono handler
  // only accepts POST and throws 405 for GET. The runtime's handleListThreads also
  // returns 422 for HttpAgent-backed runtimes (only works with InMemoryAgentRunner
  // or CopilotKit Cloud). Intercept here and return the correct empty-list shape.
  if (req.method === "GET" && new URL(req.url).pathname.endsWith("/threads")) {
    return Response.json({ threads: [], nextCursor: null });
  }
  return handleRequest(req);
};
