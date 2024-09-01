"use client";

import { FormEvent, useMemo, useState } from "react";

import { AppBar, Button, Stack, Toolbar, Typography } from "@mui/material";

import Upload from "./components/upload";
import Options from "./components/options";
import Status from "./components/status";

export default function Home() {
  const [status, setStatus] = useState<undefined | null | string>(undefined);

  const handleFormSubmit = useMemo(() => (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    const formData = new FormData(event.currentTarget);

    fetch("/api", {
      method: "POST",
      body: formData,
    })
      .then(async (response) => {
        if (!response.ok) {
          setStatus(await response.text());
        }
        else {
          window.open(await response!.text());
          setStatus(undefined);
        }
      });
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
        <Status status={status} />
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
