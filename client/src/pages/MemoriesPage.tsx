import { useEffect, useState, useCallback, type MouseEvent } from "react";
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Fab,
  CircularProgress,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import Navbar from "../components/Navbar";
import MemoryGrid from "../components/MemoryGrid";
import { getAllMemories, deleteMemory } from "../api/memories";
import { useToast } from "../context/ToastContext";
import { Memory } from "../types/shared";

const MOODS = ["All Moods", "Nostalgic", "Travel", "Food", "Music"];

const MOOD_COLORS: Record<string, string> = {
  Nostalgic: "#ff9d24",
  Travel: "#1be287",
  Food: "#ff247d",
  Music: "#2496ff",
};

interface MemoriesPageProps {
  onOpenCreate: () => void;
  onOpenEdit: (id: string) => void;
  refreshKey: number;
}

export default function MemoriesPage({
  onOpenCreate,
  onOpenEdit,
  refreshKey,
}: MemoriesPageProps) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [mood, setMood] = useState("All Moods");
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const load = useCallback(async (selectedMood: string) => {
    setLoading(true);
    try {
      const filter = selectedMood === "All Moods" ? undefined : selectedMood;
      const data = await getAllMemories(filter);
      setMemories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(mood);
  }, [mood, load, refreshKey]);

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteMemory(id);
      setMemories((prev) => prev.filter((m) => m._id !== id));
      showToast("Memory deleted", "success");
    },
    [showToast]
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          maxWidth: 1200,
          mx: "auto",
          width: "100%",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
          My Memories
        </Typography>

        {/* Mood filter */}
        <ToggleButtonGroup
          value={mood}
          exclusive
          onChange={(_: MouseEvent<HTMLElement>, val: string | null) =>
            val && setMood(val)
          }
          sx={{ mb: 3, flexWrap: "wrap", gap: 0.5 }}
        >
          {MOODS.map((m) => (
            <ToggleButton
              key={m}
              value={m}
              size="small"
              sx={{
                borderRadius: "20px !important",
                border: "1.5px solid",
                borderColor: MOOD_COLORS[m] ?? "primary.main",
                color: MOOD_COLORS[m] ?? "primary.main",
                fontWeight: 600,
                px: 2,
                "&.Mui-selected": {
                  bgcolor: MOOD_COLORS[m] ?? "primary.main",
                  color: "#fff",
                  borderColor: MOOD_COLORS[m] ?? "primary.main",
                  "&:hover": {
                    bgcolor: MOOD_COLORS[m] ?? "primary.main",
                  },
                },
              }}
            >
              {m}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
            <CircularProgress />
          </Box>
        ) : memories.length === 0 ? (
          <Box sx={{ textAlign: "center", mt: 8 }}>
            <PhotoCameraIcon
              sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
            />
            <Typography color="text.secondary" gutterBottom>
              No memories yet. Start capturing your moments!
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onOpenCreate}
            >
              Add Memory
            </Button>
          </Box>
        ) : (
          <MemoryGrid
            memories={memories}
            onDelete={handleDelete}
            onEdit={onOpenEdit}
          />
        )}
      </Box>

      <Fab
        color="primary"
        aria-label="Add memory"
        onClick={onOpenCreate}
        sx={{ position: "fixed", bottom: 24, right: 24 }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}
