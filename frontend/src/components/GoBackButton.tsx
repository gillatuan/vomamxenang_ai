"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";

export default function GoBackButton() {
  const router = useRouter();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  return (
    <Button
      type="button"
      startIcon={<ArrowBackIcon />}
      onClick={handleGoBack}
      sx={{ alignSelf: "flex-start", mb: 2 }}
    >
      Quay lại
    </Button>
  );
}
