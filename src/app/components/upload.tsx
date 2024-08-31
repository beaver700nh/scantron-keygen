"use client";

import { useMemo, useRef, useState } from "react";

import { Button, Card, CardContent, CardHeader, Typography } from "@mui/material";

export default function Upload() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFileName, setSelectedFileName] = useState<string | undefined>();

  const handleSelectFile = useMemo(() => () => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useMemo(() => () => {
    setSelectedFileName(fileInputRef.current?.files?.[0]?.name);
  }, []);

  return (
    <Card>
      <CardHeader
        title="Upload Exam"
      />
      <CardContent
        className="flex flex-wrap gap-2"
      >
        <Button
          className="whitespace-nowrap"
          variant="outlined"
          onClick={handleSelectFile}
        >
          Select File
        </Button>
        <Typography
          className="flex items-center"
          variant="body1"
        >
          {selectedFileName ?? "No file selected"}
        </Typography>
        <input
          type="file"
          hidden
          ref={fileInputRef}
          onChange={handleFileChange}
          name="examFile"
        />
      </CardContent>
    </Card>
  );
}
