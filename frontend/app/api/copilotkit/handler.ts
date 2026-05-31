import { CopilotRuntime, copilotRuntimeNextJSAppRouterEndpoint } from "@copilotkit/runtime";
import { HttpAgent } from "@ag-ui/client";

const runtime = new CopilotRuntime({
  agents: {
    recipe_agent: new HttpAgent({
      url: `http://localhost:${process.env.BACKEND_PORT ?? 8000}/copilotkit`,
    }),
  },
});

export const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
  runtime,
  endpoint: "/api/copilotkit",
});
