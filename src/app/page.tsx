"use client";

import { AppBar, Box, Button, Card, CardContent, CardHeader, MenuItem, Paper, Stack, TextField, Toolbar, Typography } from "@mui/material";

export default function Home() {
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
      >
        <Card>
          <CardHeader
            title="Upload Exam"
          />
          <CardContent
            className="flex gap-2"
          >
            <Button
              variant="outlined"
            >
              Select File
            </Button>
            <Typography
              className="flex items-center"
              variant="body1"
            >
              No file selected
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardHeader
            title="Options"
          />
          <CardContent>
            <TextField
              defaultValue=""
              slotProps={{
                select: {
                  displayEmpty: true,
                },
              }}
              select
              variant="standard"
            >
              <MenuItem
                value=""
              >
                Select an answer sheet&hellip;
              </MenuItem>
            </TextField>
          </CardContent>
        </Card>
        <Button
          className="text-lg py-4"
          variant="contained"
        >
          Generate Key
        </Button>
      </Stack>
    </>
  );
}
