import React from "react";
import { useToast } from "../context/ToastContext.jsx";
import styles from "./Toast.module.css";

export default function Toast() {
  const { toast } = useToast();
  if (!toast) return null;

  return (
    <div className={`${styles.toast} ${styles[toast.type]}`} role="status">
      {toast.message}
    </div>
  );
}
