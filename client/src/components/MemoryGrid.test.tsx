import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import MemoryGrid from "./MemoryGrid";
import { Memory } from "../types/shared";

const MEMORIES: Memory[] = [
  {
    _id: "1",
    userId: "user1",
    title: "Memory One",
    description: "Desc one",
    image: "data:image/png;base64,a",
    location: "NYC",
    mood: "Nostalgic",
    dateCreated: "2024-01-01T00:00:00.000Z",
    latitude: null,
    longitude: null,
  },
  {
    _id: "2",
    userId: "user1",
    title: "Memory Two",
    description: "Desc two",
    image: "data:image/png;base64,b",
    location: "LA",
    mood: "Travel",
    dateCreated: "2024-02-01T00:00:00.000Z",
    latitude: null,
    longitude: null,
  },
];

describe("MemoryGrid", () => {
  it("renders all memory cards", () => {
    render(
      <MemoryRouter>
        <MemoryGrid
          memories={MEMORIES}
          onDelete={jest.fn()}
          onEdit={jest.fn()}
        />
      </MemoryRouter>
    );
    expect(screen.getByText("Memory One")).toBeInTheDocument();
    expect(screen.getByText("Memory Two")).toBeInTheDocument();
  });

  it("shows empty state message when no memories", () => {
    render(
      <MemoryRouter>
        <MemoryGrid memories={[]} onDelete={jest.fn()} onEdit={jest.fn()} />
      </MemoryRouter>
    );
    expect(screen.getByText(/No memories yet/i)).toBeInTheDocument();
  });

  it("renders correct number of cards", () => {
    render(
      <MemoryRouter>
        <MemoryGrid
          memories={MEMORIES}
          onDelete={jest.fn()}
          onEdit={jest.fn()}
        />
      </MemoryRouter>
    );
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(2);
  });
});
