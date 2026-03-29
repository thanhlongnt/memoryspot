import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

// Mock dependencies
jest.mock("../context/AuthContext", () => ({
  useAuth: () => ({ user: { displayName: "Test User" }, logout: jest.fn() }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("../context/MapsContext", () => ({
  useMaps: () => ({ isLoaded: false, noKey: false }),
}));

jest.mock("../context/ToastContext", () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));

jest.mock("@react-google-maps/api", () => ({
  useLoadScript: () => ({ isLoaded: false, loadError: null }),
  Autocomplete: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("../api/memories", () => ({
  createMemory: jest.fn().mockResolvedValue({ _id: "new-id" }),
  updateMemory: jest.fn().mockResolvedValue({}),
  getMemory: jest.fn(),
  fileToDataUrl: jest.fn().mockResolvedValue("data:image/png;base64,test"),
}));

import CreateMemoryModal from "../components/CreateMemoryModal";

function renderModal(memoryId: string | null = null) {
  const onClose = jest.fn();
  const utils = render(
    <MemoryRouter>
      <CreateMemoryModal open={true} onClose={onClose} memoryId={memoryId} />
    </MemoryRouter>
  );
  return { ...utils, onClose };
}

describe("CreateMemoryModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the form with required fields", () => {
    renderModal();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    // MUI Select renders with role="combobox"
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it("shows an error when required fields are missing on submit", async () => {
    renderModal();
    // MUI Dialog renders in portal; find the form via document
    fireEvent.submit(document.querySelector("form")!);
    await waitFor(() => {
      expect(screen.getByText(/required fields/i)).toBeInTheDocument();
    });
  });

  it("shows error for title exceeding 20 chars", async () => {
    renderModal();
    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, {
      target: { value: "A very long title that exceeds limit" },
    });
    fireEvent.submit(document.querySelector("form")!);
    await waitFor(() => {
      expect(screen.getByText(/required fields/i)).toBeInTheDocument();
    });
  });

  it("shows 'Add Memory' heading for new memory", () => {
    renderModal();
    expect(
      screen.getByRole("heading", { name: /add memory/i })
    ).toBeInTheDocument();
  });
});
