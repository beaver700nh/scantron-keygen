"use client";

import { FormEvent, useMemo, useState } from "react";

import { AppBar, Button, Card, CardContent, CardHeader, Stack, Toolbar, Typography, useTheme } from "@mui/material";

import Upload from "./components/upload";
import Options from "./components/options";

export default function Home() {
  const theme = useTheme();
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = useMemo(() => async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      setError(await response.text());
    }
    else {
      window.open(await response.text());
    }
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
        {error ?
        <Card
          sx={{
            borderWidth: 2,
            borderColor: theme.palette.error.dark,
          }}
        >
          <CardHeader
            title="Error"
          />
          <CardContent>
            <Typography
              variant="body1"
            >
              {error}
            </Typography>
          </CardContent>
        </Card> : null}
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
