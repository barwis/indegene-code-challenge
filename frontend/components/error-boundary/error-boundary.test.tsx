import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorBoundary } from "./error-boundary";

let shouldThrow = false;

const RecoverableChild = () => {
  if (shouldThrow) throw new Error("test error");
  return <div>child content</div>;
};

describe("ErrorBoundary", () => {
  beforeEach(() => {
    shouldThrow = false;
  });

  describe("when children render normally", () => {
    it("should render children", () => {
      render(
        <ErrorBoundary>
          <RecoverableChild />
        </ErrorBoundary>,
      );
      expect(screen.getByText("child content")).toBeInTheDocument();
    });

    it("should render the aside alongside children", () => {
      render(
        <ErrorBoundary aside={<div>aside content</div>}>
          <RecoverableChild />
        </ErrorBoundary>,
      );
      expect(screen.getByText("child content")).toBeInTheDocument();
      expect(screen.getByText("aside content")).toBeInTheDocument();
    });
  });

  describe("when a child throws", () => {
    beforeEach(() => {
      shouldThrow = true;
    });

    it("should render the fallback instead of a blank screen", () => {
      render(
        <ErrorBoundary>
          <RecoverableChild />
        </ErrorBoundary>,
      );
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it("should show a Start over button", () => {
      render(
        <ErrorBoundary>
          <RecoverableChild />
        </ErrorBoundary>,
      );
      expect(
        screen.getByRole("button", { name: "Start over" }),
      ).toBeInTheDocument();
    });

    it("should render the aside even when showing the fallback", () => {
      render(
        <ErrorBoundary aside={<div>aside content</div>}>
          <RecoverableChild />
        </ErrorBoundary>,
      );
      expect(screen.getByText("aside content")).toBeInTheDocument();
    });

    it("should not render children when showing the fallback", () => {
      render(
        <ErrorBoundary>
          <RecoverableChild />
        </ErrorBoundary>,
      );
      expect(screen.queryByText("child content")).not.toBeInTheDocument();
    });
  });

  describe("when Start over is clicked", () => {
    it("should recover and render children when they no longer throw", async () => {
      shouldThrow = true;
      const user = userEvent.setup();
      render(
        <ErrorBoundary>
          <RecoverableChild />
        </ErrorBoundary>,
      );
      shouldThrow = false;
      await user.click(screen.getByRole("button", { name: "Start over" }));
      expect(screen.getByText("child content")).toBeInTheDocument();
    });

    it("should call onReset when recovering", async () => {
      shouldThrow = true;
      const onReset = vi.fn();
      const user = userEvent.setup();
      render(
        <ErrorBoundary onReset={onReset}>
          <RecoverableChild />
        </ErrorBoundary>,
      );
      shouldThrow = false;
      await user.click(screen.getByRole("button", { name: "Start over" }));
      expect(screen.getByText("child content")).toBeInTheDocument();
    });
  });
});
