"use client";

import { Card, CardContent, CardHeader, Typography, useTheme } from "@mui/material";

export type RequestState = undefined | null | Finished;
export type Finished = {
  error?: string,
  doc?: {
    title: string,
    body: string,
  },
};

type StatusProps = {
  status: RequestState;
};

export default function Status({
  status,
}: StatusProps) {
  const theme = useTheme();

  if (typeof status === "undefined") {
    return null;
  }
  else if (status === null) {
    return (
      <Card
        sx={{
          borderWidth: 2,
          borderColor: theme.palette.info.dark,
        }}
      >
        <CardHeader
          title="Loading..."
        />
        <CardContent>
          <Typography
            variant="body1"
          >
            Exam is being processed.
          </Typography>
        </CardContent>
      </Card>
    );
  }
  else if (status.error != null) {
    return (
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
            {status.error}
          </Typography>
        </CardContent>
      </Card>
    );
  }
  else {
    return (
      <Card
        sx={{
          borderWidth: 2,
          borderColor: theme.palette.success.dark,
        }}
      >
        <CardHeader
          title="Success!"
        />
        <CardContent>
          <Typography
            variant="body1"
          >
            {status.doc!.title}
          </Typography>
          <Typography
            className="underline"
            variant="body2"
          >
            <a
              href={status.doc!.body}
              target="_blank"
            >
              Click here to view result.
            </a>
          </Typography>
        </CardContent>
      </Card>
    );
  }
}
