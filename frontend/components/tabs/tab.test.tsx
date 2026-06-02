import { render } from "@testing-library/react";
import { Tab } from "./tab";

describe("Tab", () => {
  it("should always render nothing regardless of props", () => {
    const { container } = render(
      <Tab tabId="test" tabTitle="My Tab">
        <span>content</span>
      </Tab>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
