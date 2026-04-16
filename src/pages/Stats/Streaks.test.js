import { render, screen } from "@testing-library/react";
import Streaks from "./Streaks";

test("renders current and longest streak numbers and labels", () => {
  render(<Streaks current={5} longest={12} />);
  expect(screen.getByText("5")).toBeInTheDocument();
  expect(screen.getByText("12")).toBeInTheDocument();
  expect(screen.getByText(/current streak/i)).toBeInTheDocument();
  expect(screen.getByText(/longest streak/i)).toBeInTheDocument();
});
