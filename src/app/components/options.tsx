"use client";

import { ChangeEvent, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, Checkbox, FormControlLabel, MenuItem, TextField } from "@mui/material";

import { AnswerSheetName, AnswerSheets } from "@/lib/data";

export default function Options() {
  const [answerSheetName, setAnswerSheetName] = useState<AnswerSheetName | "">("");

  const handleChange = useMemo(() => (event: ChangeEvent<HTMLInputElement>) => {
    setAnswerSheetName(event.target.value as AnswerSheetName | "");
  }, []);

  return (
    <Card>
      <CardHeader
        title="Options"
      />
      <CardContent
        className="flex flex-col items-start gap-3"
      >
        <FormControlLabel
          className="-my-[9px]"
          control={
            <Checkbox
              defaultChecked={true}
              name="packQuestions"
            />
          }
          label="Renumber questions to start at 1"
        />
        <FormControlLabel
        className="-my-[9px]"
          control={
            <Checkbox
              defaultChecked={false}
              name="drawBackground"
            />
          }
          label="Draw Scantron graphics (only for printing on plain paper)"
        />
        <TextField
          defaultValue=""
          slotProps={{
            select: {
              displayEmpty: true,
            },
          }}
          select
          variant="standard"
          name="answerSheet"
          value={answerSheetName}
          onChange={handleChange}
        >
          <MenuItem
            value=""
          >
            Select an answer sheet&hellip;
          </MenuItem>
          {Object.entries(AnswerSheets).map(([name]) => (
          <MenuItem
            key={name}
            value={name}
          >
            {name}
          </MenuItem>))}
        </TextField>
        {answerSheetName !== "" ?
        Object.entries(AnswerSheets[answerSheetName].inputs.meta).map(([name]) => (
        <TextField
          key={name}
          defaultValue={
            name === "name" ? "Test on ________" :
            name === "date" ? new Date().toLocaleString("sv").slice(0, 10) :
            ""
          }
          label={name.charAt(0).toUpperCase() + name.slice(1)}
          name={`__meta_${name}`}
          variant="outlined"
          autoComplete="on"
        />
        )) : null}
      </CardContent>
    </Card>
  );
}
