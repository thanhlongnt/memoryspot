import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useToast } from "../context/ToastContext";

export default function Toast() {
  const { toast } = useToast();

  return (
    <Snackbar
      open={Boolean(toast)}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      {toast ? (
        <Alert
          severity={toast.type === "error" ? "error" : "success"}
          variant="filled"
          sx={{ minWidth: 240 }}
        >
          {toast.message}
        </Alert>
      ) : (
        <span />
      )}
    </Snackbar>
  );
}
