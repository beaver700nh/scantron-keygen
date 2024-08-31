"use client";

import { FormEvent, useMemo } from "react";

import { AppBar, Button, Stack, Toolbar, Typography } from "@mui/material";

import Upload from "./components/upload";
import Options from "./components/options";

export default function Home() {
  const handleFormSubmit = useMemo(() => async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api", {
      method: "POST",
      body: formData,
    });
    console.log(await response.json());
  }, []);

  return (
    <>
      <AppBar>
        <Toolbar>
          <Typography
            variant="h6"
        >
          Scantron Keygen
        </Typography>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Stack
        className="flex flex-col p-4 gap-4"
        sx={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
        component="form"
        onSubmit={handleFormSubmit}
      >
        <Upload />
        <Options />
        <Button
          className="text-lg py-4"
          type="submit"
          variant="contained"
        >
          Generate Key
        </Button>
      </Stack>
    </>
  );
}
