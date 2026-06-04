import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { mockUseRecipeContext } from "@test-utils/recipe-context-mock";
import { ChatDrawer } from "./chat-drawer";

vi.mock("@context/recipe-context");
vi.mock("@components", () => ({
  ChatPanel: () => <div data-testid="chat-panel" />,
}));
vi.mock("./use-drawer-drag", () => ({
  useDrawerDrag: ({ isOpen, onOpen, onClose }: { isOpen: boolean; onOpen: () => void; onClose: () => void }) => ({
    drawerRef: { current: null },
    isDragging: false,
    drawerStyle: {},
    onPointerDown: vi.fn(),
    onPointerMove: vi.fn(),
    onPointerUp: vi.fn(),
    onPointerCancel: vi.fn(),
    // expose toggle helpers so tests can invoke them directly
    _onOpen: onOpen,
    _onClose: onClose,
    _isOpen: isOpen,
  }),
}));

const renderDrawer = (isChatOpen = false) => {
  const openChat = vi.fn();
  const closeChat = vi.fn();
  mockUseRecipeContext({ isChatOpen, openChat, closeChat });
  render(<ChatDrawer />);
  return { openChat, closeChat };
};

describe("ChatDrawer", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("dialog element", () => {
    it("renders the dialog", () => {
      renderDrawer();
      expect(screen.getByRole("dialog", { hidden: true })).toBeInTheDocument();
    });

    it("sets aria-modal to false when closed", () => {
      renderDrawer(false);
      expect(screen.getByRole("dialog", { hidden: true })).toHaveAttribute("aria-modal", "false");
    });

    it("sets aria-modal to true when open", () => {
      renderDrawer(true);
      expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    });
  });

  describe("handle", () => {
    it("labels handle as 'Open assistant' when closed", () => {
      renderDrawer(false);
      expect(screen.getByRole("button", { name: /open assistant/i, hidden: true })).toBeInTheDocument();
    });

    it("labels handle as 'Close assistant' when open", () => {
      renderDrawer(true);
      expect(screen.getByTestId("drawer-handle")).toHaveAttribute("aria-label", "Close assistant");
    });

    it("calls openChat when Enter is pressed on handle while closed", async () => {
      const user = userEvent.setup();
      const { openChat } = renderDrawer(false);
      screen.getByTestId("drawer-handle").focus();
      await user.keyboard("{Enter}");
      expect(openChat).toHaveBeenCalledOnce();
    });

    it("calls closeChat when Enter is pressed on handle while open", async () => {
      const user = userEvent.setup();
      const { closeChat } = renderDrawer(true);
      screen.getByTestId("drawer-handle").focus();
      await user.keyboard("{Enter}");
      expect(closeChat).toHaveBeenCalledOnce();
    });

    it("calls openChat when Space is pressed on handle while closed", async () => {
      const user = userEvent.setup();
      const { openChat } = renderDrawer(false);
      screen.getByTestId("drawer-handle").focus();
      await user.keyboard(" ");
      expect(openChat).toHaveBeenCalledOnce();
    });
  });

  describe("close button", () => {
    it("renders the close button when open", () => {
      renderDrawer(true);
      expect(screen.getByTestId("drawer-close")).toBeInTheDocument();
    });

    it("calls closeChat when close button is clicked", async () => {
      const user = userEvent.setup();
      const { closeChat } = renderDrawer(true);
      await user.click(screen.getByTestId("drawer-close"));
      expect(closeChat).toHaveBeenCalled();
    });
  });

  describe("chat panel", () => {
    it("renders ChatPanel", () => {
      renderDrawer(true);
      expect(screen.getByTestId("chat-panel")).toBeInTheDocument();
    });
  });
});
