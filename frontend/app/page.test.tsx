import { screen } from "@testing-library/react";
import renderWithProviders from "./test-utils/renderWithProviders";
import Home from "./page";

describe("Home", () => {
  it("should render without crashing", () => {
    renderWithProviders(<Home />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
