import { describe, it, expect, vi } from "vitest";

vi.mock("@copilotkit/runtime", () => ({
  CopilotRuntime: vi.fn(),
  copilotRuntimeNextJSAppRouterEndpoint: vi.fn().mockReturnValue({
    handleRequest: vi.fn().mockResolvedValue(new Response("ok", { status: 200 })),
  }),
}));

vi.mock("@ag-ui/client", () => ({
  HttpAgent: vi.fn(),
}));

import { GET, POST } from "./[[...path]]/route";
import { CopilotRuntime, copilotRuntimeNextJSAppRouterEndpoint } from "@copilotkit/runtime";
import { HttpAgent } from "@ag-ui/client";

const getHandleRequest = () =>
  vi.mocked(copilotRuntimeNextJSAppRouterEndpoint).mock.results[0].value
    .handleRequest as ReturnType<typeof vi.fn>;

describe("/api/copilotkit route", () => {
  describe("runtime initialisation", () => {
    it("should construct HttpAgent pointing to the backend copilotkit URL", () => {
      expect(HttpAgent).toHaveBeenCalledWith(
        expect.objectContaining({ url: expect.stringContaining("/copilotkit") }),
      );
    });

    it("should construct CopilotRuntime with recipe_agent", () => {
      expect(CopilotRuntime).toHaveBeenCalledWith(
        expect.objectContaining({
          agents: expect.objectContaining({ recipe_agent: expect.anything() }),
        }),
      );
    });

    it("should wire copilotRuntimeNextJSAppRouterEndpoint with endpoint /api/copilotkit", () => {
      expect(copilotRuntimeNextJSAppRouterEndpoint).toHaveBeenCalledWith(
        expect.objectContaining({ endpoint: "/api/copilotkit" }),
      );
    });
  });

  describe("optional catch-all route (GET + POST /api/copilotkit and /api/copilotkit/*)", () => {
    it("should export GET and POST handlers", () => {
      expect(typeof GET).toBe("function");
      expect(typeof POST).toBe("function");
    });

    it("GET /api/copilotkit delegates to handleRequest", async () => {
      const req = new Request("http://localhost:3001/api/copilotkit");
      await GET(req as never);
      expect(getHandleRequest()).toHaveBeenCalledWith(req);
    });

    it("POST /api/copilotkit delegates to handleRequest", async () => {
      const req = new Request("http://localhost:3001/api/copilotkit", { method: "POST" });
      await POST(req as never);
      expect(getHandleRequest()).toHaveBeenCalledWith(req);
    });

    it("GET /threads returns empty threads list without calling handleRequest", async () => {
      const req = new Request(
        "http://localhost:3001/api/copilotkit/threads?agentId=recipe_agent",
      );
      const res = await GET(req as never);
      const body = await (res as Response).json();
      expect(body).toEqual({ threads: [] });
      expect(getHandleRequest()).not.toHaveBeenCalledWith(req);
    });

    it("GET non-threads paths delegate to handleRequest", async () => {
      const req = new Request("http://localhost:3001/api/copilotkit/info");
      await GET(req as never);
      expect(getHandleRequest()).toHaveBeenCalledWith(req);
    });
  });
});
