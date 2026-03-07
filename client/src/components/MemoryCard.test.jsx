import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import MemoryCard from "./MemoryCard.jsx";

const MEMORY = {
  _id: "abc123",
  title: "Beach Day",
  description: "Fun in the sun",
  image: "data:image/png;base64,abc",
  location: "San Diego, CA",
  mood: "Travel",
  dateCreated: "2024-06-15T00:00:00.000Z",
};

describe("MemoryCard", () => {
  it("renders title, mood, location, and description", () => {
    render(
      <MemoryCard memory={MEMORY} onDelete={jest.fn()} onEdit={jest.fn()} />
    );
    expect(screen.getByText("Beach Day")).toBeInTheDocument();
    expect(screen.getByText("Travel")).toBeInTheDocument();
    expect(screen.getByText(/San Diego/)).toBeInTheDocument();
    expect(screen.getByText("Fun in the sun")).toBeInTheDocument();
  });

  it("renders image with alt text from description", () => {
    render(
      <MemoryCard memory={MEMORY} onDelete={jest.fn()} onEdit={jest.fn()} />
    );
    const img = screen.getByAltText("Fun in the sun");
    expect(img).toBeInTheDocument();
    expect(img.src).toContain("base64");
  });

  it("calls onEdit with memory id when edit button is clicked", () => {
    const onEdit = jest.fn();
    render(
      <MemoryCard memory={MEMORY} onDelete={jest.fn()} onEdit={onEdit} />
    );
    fireEvent.click(screen.getByTitle("Edit"));
    expect(onEdit).toHaveBeenCalledWith("abc123");
  });

  it("calls onDelete with memory id when delete is confirmed", () => {
    const onDelete = jest.fn();
    window.confirm = jest.fn(() => true);
    render(
      <MemoryCard memory={MEMORY} onDelete={onDelete} onEdit={jest.fn()} />
    );
    fireEvent.click(screen.getByTitle("Delete"));
    expect(onDelete).toHaveBeenCalledWith("abc123");
  });

  it("does not call onDelete when user cancels confirmation", () => {
    const onDelete = jest.fn();
    window.confirm = jest.fn(() => false);
    render(
      <MemoryCard memory={MEMORY} onDelete={onDelete} onEdit={jest.fn()} />
    );
    fireEvent.click(screen.getByTitle("Delete"));
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("shows fallback text when description is empty", () => {
    const mem = { ...MEMORY, description: "" };
    render(<MemoryCard memory={mem} onDelete={jest.fn()} onEdit={jest.fn()} />);
    expect(screen.getByText("No description provided.")).toBeInTheDocument();
  });
});
