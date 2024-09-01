"use client";

import { Card, CardContent, CardHeader, Typography, useTheme } from "@mui/material";

type StatusProps = {
  status: undefined | null | string;
};

export default function Status({
  status,
}: StatusProps) {
  const theme = useTheme();

  if (typeof status === "undefined") return null;

  return (
    <Card
      sx={{
        borderWidth: 2,
        borderColor: status === null
          ? theme.palette.info.dark
          : theme.palette.error.dark,
      }}
    >
      <CardHeader
        title={status === null ? "Loading..." : "Error"}
      />
      <CardContent>
        <Typography
          variant="body1"
        >
          {status ?? "Waiting for response from server."}
        </Typography>
      </CardContent>
    </Card>
  );
}
