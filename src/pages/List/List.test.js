import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import List from "./List";

jest.mock("../../hooks", () => {
  const actual = jest.requireActual("../../hooks");
  return {
    ...actual,
    useDashboard: () => [
      { isLoading: false, isError: false, lists: [], itemsByListId: {} },
      jest.fn(),
    ],
  };
});

jest.mock("../../api/api", () => ({
  __esModule: true,
  default: {
    deleteCurrentSession: jest.fn(),
    createList: jest.fn(),
  },
}));

test("shows the empty state when the user has no lists", () => {
  const user = { $id: "user-1" };
  const dispatch = jest.fn();

  render(
    <MemoryRouter initialEntries={["/lists"]}>
      <Routes>
        <Route path="/lists" element={<List user={user} dispatch={dispatch} />} />
      </Routes>
    </MemoryRouter>,
  );

  expect(screen.getByText(/small things/i)).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /start a new list/i }),
  ).toBeInTheDocument();
});
