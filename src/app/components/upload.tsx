"use client";

import { useMemo, useRef, useState } from "react";

import { Button, Card, CardContent, CardHeader, FormControlLabel, Typography } from "@mui/material";

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
      <CardContent>
        <FormControlLabel
          className="flex-wrap mx-0 gap-2"
          control={
            <Button
              className="whitespace-nowrap"
              variant="outlined"
              onClick={handleSelectFile}
            >
              Select File
            </Button>
          }
          label={selectedFileName ?? "No file selected"}
        />
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
