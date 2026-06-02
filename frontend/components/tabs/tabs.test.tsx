import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tab } from "./tab";
import { Tabs } from "./tabs";

const renderTabs = (defaultActiveTab?: string) =>
  render(
    <Tabs ariaLabel="Test sections" defaultActiveTab={defaultActiveTab}>
      <Tab tabId="first" tabTitle="First">
        <p>First panel content</p>
      </Tab>
      <Tab tabId="second" tabTitle="Second">
        <p>Second panel content</p>
      </Tab>
      <Tab tabId="third" tabTitle="Third">
        <p>Third panel content</p>
      </Tab>
    </Tabs>,
  );

describe("Tabs", () => {
  describe("tab buttons", () => {
    it("should render a button for each Tab child", () => {
      renderTabs();
      expect(screen.getByRole("tab", { name: "First" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Second" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Third" })).toBeInTheDocument();
    });

    it("should render a tablist with the provided ariaLabel", () => {
      renderTabs();
      expect(
        screen.getByRole("tablist", { name: "Test sections" }),
      ).toBeInTheDocument();
    });

    it("should give each tab button a 50px minimum height", () => {
      renderTabs();
      screen
        .getAllByRole("tab")
        .forEach((tab) => expect(tab).toHaveClass("min-h-[50px]"));
    });

    it("should use tabId as button text when tabTitle is omitted", () => {
      render(
        <Tabs>
          <Tab tabId="steps">
            <p>content</p>
          </Tab>
        </Tabs>,
      );
      expect(screen.getByRole("tab", { name: "steps" })).toBeInTheDocument();
    });

    it("should always apply the capitalize class to tab buttons", () => {
      renderTabs();
      screen
        .getAllByRole("tab")
        .forEach((tab) => expect(tab).toHaveClass("capitalize"));
    });
  });

  describe("default active tab", () => {
    it("should activate the first tab by default when defaultActiveTab is omitted", () => {
      renderTabs();
      expect(screen.getByRole("tab", { name: "First" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
      expect(screen.getByRole("tab", { name: "Second" })).toHaveAttribute(
        "aria-selected",
        "false",
      );
    });

    it("should fall back to the first tab when defaultActiveTab does not match any tabId", () => {
      renderTabs("nonexistent");
      expect(screen.getByRole("tab", { name: "First" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });

    it("should activate the specified tab when defaultActiveTab is provided", () => {
      renderTabs("second");
      expect(screen.getByRole("tab", { name: "Second" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
      expect(screen.getByRole("tab", { name: "First" })).toHaveAttribute(
        "aria-selected",
        "false",
      );
    });
  });

  describe("panel visibility", () => {
    it("should show the first panel by default", () => {
      renderTabs();
      expect(
        screen.getByRole("tabpanel", { name: "First" }),
      ).not.toHaveAttribute("hidden");
    });

    it("should hide non-active panels", () => {
      renderTabs();
      expect(screen.getByText("Second panel content")).not.toBeVisible();
      expect(screen.getByText("Third panel content")).not.toBeVisible();
    });

    it("should show the panel matching defaultActiveTab", () => {
      renderTabs("third");
      expect(
        screen.getByRole("tabpanel", { name: "Third" }),
      ).not.toHaveAttribute("hidden");
      expect(screen.getByText("First panel content")).not.toBeVisible();
    });
  });

  describe("tab switching", () => {
    it("should mark clicked tab as selected", async () => {
      const user = userEvent.setup();
      renderTabs();
      await user.click(screen.getByRole("tab", { name: "Second" }));
      expect(screen.getByRole("tab", { name: "Second" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
      expect(screen.getByRole("tab", { name: "First" })).toHaveAttribute(
        "aria-selected",
        "false",
      );
    });

    it("should show the clicked tab's panel", async () => {
      const user = userEvent.setup();
      renderTabs();
      await user.click(screen.getByRole("tab", { name: "Second" }));
      expect(
        screen.getByRole("tabpanel", { name: "Second" }),
      ).not.toHaveAttribute("hidden");
      expect(screen.getByText("First panel content")).not.toBeVisible();
    });

    it("should hide the previously active panel's content", async () => {
      const user = userEvent.setup();
      renderTabs();
      await user.click(screen.getByRole("tab", { name: "Second" }));
      expect(screen.getByText("First panel content")).not.toBeVisible();
    });
  });

  describe("ARIA wiring", () => {
    it("should wire aria-controls on each tab to the matching panel id", () => {
      renderTabs();
      const tab = screen.getByRole("tab", { name: "First" });
      const panelId = tab.getAttribute("aria-controls");
      expect(panelId).toBeTruthy();
      expect(document.getElementById(panelId!)).toHaveAttribute(
        "role",
        "tabpanel",
      );
    });

    it("should wire aria-labelledby on each panel to the matching tab id", () => {
      renderTabs();
      const panel = screen.getByRole("tabpanel", { name: "First" });
      const tabId = panel.getAttribute("aria-labelledby");
      expect(tabId).toBeTruthy();
      expect(document.getElementById(tabId!)).toHaveAttribute("role", "tab");
    });

    it("should use unique ids when two Tabs instances are on the same page", () => {
      render(
        <>
          <Tabs>
            <Tab tabId="a" tabTitle="A">
              content
            </Tab>
          </Tabs>
          <Tabs>
            <Tab tabId="a" tabTitle="A">
              content
            </Tab>
          </Tabs>
        </>,
      );
      const [tab1, tab2] = screen.getAllByRole("tab", { name: "A" });
      expect(tab1.id).not.toBe(tab2.id);
    });
  });
});
