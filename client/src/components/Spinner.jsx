import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

export default function Spinner() {
  return (
    <Box
      sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 4 }}
      aria-label="Loading"
      role="status"
    >
      <CircularProgress />
    </Box>
  );
}
