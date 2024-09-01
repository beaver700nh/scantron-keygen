"use server";

import jsPDF from "jspdf";
import parseRTF from "rtf-parser";

import { AnswerSheet, AnswerSheets, BlockData } from "@/lib/data";

type RequestData = {
  examFile: File;
  answerSheet: keyof typeof AnswerSheets;
  packQuestions?: string;
  [key: `__meta_${string}`]: string | undefined;
};

class ExamParser {
  private text: Promise<string>;
  private doc: any = null;

  constructor(private data: RequestData) {
    this.text = data.examFile.text();
  }

  async init() {
    this.doc = await new Promise<any>(async (resolve, reject) => {
      parseRTF.string(await this.text, (err: any, doc: any) => {
        if (err)
          reject(err);
        else
          resolve(doc);
      });
    });
  }

  getMcqParagraphs() {
    if (!this.doc) {
      throw new Error("Internal error: ExamParser not initialized.");
    }

    const content = this.doc.content as Array<any>;

    const answerSection = content.findLastIndex(
      p => p.content[0]?.value === "Answer Section",
    );
    if (answerSection < 0) {
      throw new Error("Couldn't find answer section in exam file.");
    }

    const mcqSection = content.findLastIndex(
      p => p.content[0]?.value === "MULTIPLE CHOICE",
    );
    if (mcqSection <= answerSection) {
      throw new Error("Couldn't find multiple choice answers in exam file.");
    }

    const end = content.findIndex(
      (p, i) => i > mcqSection && p.content.length === 1,
    );

    return content
      .slice(mcqSection + 1, end < 0 ? undefined : end)
      .filter(p => p.content.length > 0);
  }

  extractMcqAnswers() {
    return Object.fromEntries(
      (this.getMcqParagraphs() as {
        content: { value: string }[];
      }[])
        .map(p => p.content
          .map(w => w.value.trim())
          .filter(Boolean))
        .filter(([number, ans, bubble]) => true
          && ans === "ANS:"
          && /^\d+\.$/.test(number)
          && /^[A-E]$/.test(bubble))
        .map(([number, _, bubble], index) => [
          this.data.packQuestions != null
            ? index + 1
            : parseInt(number.slice(0, -1), 10),
          bubble.charCodeAt(0) - "A".charCodeAt(0)])
    );
  }
}

class PdfGenerator {
  private sheet: AnswerSheet;
  private doc: jsPDF;

  constructor(private data: RequestData) {
    this.sheet = AnswerSheets[data.answerSheet];

    const { w, h } = this.sheet.dimensions;

    this.doc = new jsPDF({
      unit: "pt",
      format: [w, h],
    })
      .setProperties({ title: this.generateTitle() })
      .setLineWidth(0.1)
      .setFont("Helvetica")
      .setFontSize(12)
      .addPage();
  }

  markBubble(blockData: BlockData, dimensions: { [key in keyof BlockData["dimensions"]]: number; }) {
    (this.doc[this.sheet.bubble.type] as any).apply(
      this.doc,
      [
        blockData.x
          + dimensions.question * blockData.dimensions.question.delta.x
          + dimensions.bubble * blockData.dimensions.bubble.delta.x,
        blockData.y
          + dimensions.question * blockData.dimensions.question.delta.y
          + dimensions.bubble * blockData.dimensions.bubble.delta.y,
        ...this.sheet.bubble.args,
        "F",
      ],
    );
  }

  getMeta(key: string) {
    return this.data[`__meta_${key}`];
  }

  generateTitle() {
    const classInfo = [
      this.getMeta("period") && `Period ${this.getMeta("period")}`,
      this.getMeta("subject"),
    ].filter(Boolean).join(" ");

    return [
      "Scantron Answer Sheet",
      classInfo,
      this.getMeta("name"),
    ].filter(Boolean).join(" - ");
  }

  async drawBackground() {
    const { width, height } = this.doc.internal.pageSize;
    for (const [index, url] of this.sheet.images.entries()) {
      const image = await fetch(url);
      const data = Buffer.from(await image.arrayBuffer()).toString("base64");
      const uri = `data:${image.headers.get("Content-Type")};base64,${data}`;

      this.doc.setPage(index + 1);
      this.doc.addImage(uri, "JPEG", 0, 0, width, height);
    }
  }

  drawMetadata() {
    for (const [name, {page, x, y}] of Object.entries(this.sheet.inputs.meta)) {
      this.doc
        .setPage(page)
        .setDrawColor(0, 0, 0)
        // .rect(x, y, 8, -8, "S")
        .text(this.getMeta(name) ?? "", x, y);
    }
  }

  drawAnswers(answers: Record<number, number>) {
    for (const [start, blockData] of Object.entries(this.sheet.inputs.answers)) {
      const _start = parseInt(start, 10);
      const { page, dimensions: { question: { count }}} = blockData;

      this.doc
        .setPage(page)
        .setFillColor(0, 0, 0);

      for (let offset = 0; offset < count; ++offset) {
        const question = _start + offset;
        if (question in answers)
          this.markBubble(blockData, { question: offset, bubble: answers[question] });
      }
    }
  }

  async export() {
    return this.doc.output("datauristring");
  }
}

export async function POST(request: Request) {
  try {
    const data = Object.fromEntries((await request.formData()).entries()) as RequestData;

    if (data.answerSheet in AnswerSheets === false) {
      throw new Error("Couldn't get information for answer sheet.");
    }

    const exam = new ExamParser(data);
    await exam.init();
    const answers = exam.extractMcqAnswers();

    const generator = new PdfGenerator(data);
    await generator.drawBackground();
    generator.drawMetadata();
    generator.drawAnswers(answers);

    return new Response(await generator.export());
  }
  catch (err: any) {
    return new Response(err.message ?? "Unknown internal error.", { status: 500 });
  }
}
