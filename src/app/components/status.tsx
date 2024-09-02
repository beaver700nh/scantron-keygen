"use client";

import { useMemo } from "react";

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

  const handleOpenResult = useMemo(() => (event: any) => {
    event.preventDefault();

    if (status != null && status.doc != null) {
      window.open("_blank")?.document.write(`
        <html>
          <head>
            <title>${status.doc.title}</title>
          </head>
          <body>
            <iframe
              src="${status.doc.body}"
              style="position: fixed; inset: 0px; width: 100vw; height: 100vh; border: none;"
            ></iframe>
          </body>
        </html>
      `);
    }
  }, [status]);

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
  else if (status.doc != null) {
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
            {status.doc.title}
          </Typography>
          <Typography
            className="underline"
            variant="body2"
          >
            <a
              href=""
              onClick={handleOpenResult}
            >
              Click here to view answer key in a new tab.
            </a>
          </Typography>
          <Typography
            className="underline"
            variant="body2"
          >
            <a
              download={status.doc.title}
              href={status.doc.body}
              target="_blank"
            >
              Click here to download answer key as a PDF.
            </a>
          </Typography>
        </CardContent>
      </Card>
    );
  }
}
