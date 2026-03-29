import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import MemoryCard from "./MemoryCard";
import { Memory } from "../types/shared";

interface MemoryGridProps {
  memories: Memory[];
  onDelete: (id: string) => void | Promise<void>;
  onEdit: (id: string) => void;
}

export default function MemoryGrid({
  memories,
  onDelete,
  onEdit,
}: MemoryGridProps) {
  if (memories.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ mt: 4, textAlign: "center" }}>
        No memories yet.
      </Typography>
    );
  }

  return (
    <Grid container spacing={2}>
      {memories.map((memory) => (
        <Grid key={memory._id} size={{ xs: 12, sm: 6, md: 4 }}>
          <MemoryCard memory={memory} onDelete={onDelete} onEdit={onEdit} />
        </Grid>
      ))}
    </Grid>
  );
}
