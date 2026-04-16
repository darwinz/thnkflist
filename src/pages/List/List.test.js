import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import List from "./List";

jest.mock("../../hooks", () => {
  const actual = jest.requireActual("../../hooks");
  return {
    ...actual,
    useLists: () => [
      { isLoading: false, isError: false, lists: [] },
      jest.fn(),
    ],
    useCurrentList: () => [
      { isLoading: false, isError: false, currentListId: null },
      jest.fn(),
    ],
    useList: () => [
      { isLoading: false, isError: false, list: null, items: [] },
      jest.fn(),
    ],
  };
});

jest.mock("../../api/api", () => ({
  __esModule: true,
  default: {
    deleteCurrentSession: jest.fn(),
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

  expect(screen.getByText(/start your first list/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /thnkflist/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /stats/i })).toBeInTheDocument();
});
