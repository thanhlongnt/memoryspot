import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Card, Typography, Button, Avatar } from "@mui/material";
import { loginWithGoogle } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  if (user === undefined) return null;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Card
        sx={{
          p: 5,
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(55,72,105,0.15)",
        }}
      >
        <Typography variant="h2" sx={{ mb: 1 }}>
          📍
        </Typography>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, mb: 1, color: "primary.main" }}
        >
          MemorySpot
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Save and revisit your favorite memories on a map.
        </Typography>

        <Button
          variant="outlined"
          size="large"
          onClick={loginWithGoogle}
          startIcon={
            <Avatar
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              sx={{ width: 20, height: 20 }}
            />
          }
          sx={{
            borderColor: "#dadce0",
            color: "text.primary",
            fontWeight: 600,
            px: 4,
            py: 1.2,
            "&:hover": { borderColor: "#bbb", bgcolor: "rgba(0,0,0,0.03)" },
          }}
        >
          Sign in with Google
        </Button>
      </Card>
    </Box>
  );
}
