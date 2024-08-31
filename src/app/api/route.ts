"use server";

import { readFile } from "fs/promises";

import { AnswerSheets } from "@/lib/data";

type RequestData = {
  examFile: File;
  answerSheet: keyof typeof AnswerSheets;
};

export async function POST(request: Request) {
  const data = Object.fromEntries((await request.formData()).entries()) as RequestData;

  console.log(data);
  console.log(await data.examFile.text());

  return Response.json({ message: "Hello, World!" });
}
