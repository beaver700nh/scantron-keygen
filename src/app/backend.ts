import jsPDF from "jspdf";
import { RTFJS, WMFJS, EMFJS } from "rtf.js";
RTFJS.loggingEnabled(false);
WMFJS.loggingEnabled(false);
EMFJS.loggingEnabled(false);

import { AnswerSheet, AnswerSheets, BlockData } from "@/lib/data";
import { Finished } from "./components/status";

type RequestData = {
  examFile: File;
  answerSheet: keyof typeof AnswerSheets;
  packQuestions?: string;
  [key: `__meta_${string}`]: string | undefined;
};

class ExamParser {
  private doc: HTMLElement[] = [];

  constructor(private data: RequestData) {}

  async init() {
    try {
      const buffer = Buffer.from(await this.data.examFile.arrayBuffer());
      this.doc = await new RTFJS.Document(buffer, {}).render();
    }
    catch (err: any) {
      throw new Error(`Error parsing exam file: ${err.message}.`);
    }
  }

  private getMcqParagraphs() {
    const answerSection = this.doc.findLastIndex(
      p => p.children[0]?.innerHTML === "Answer Section",
    );
    if (answerSection < 0) {
      throw new Error("Couldn't find answer section in exam file.");
    }

    let mcqSection = this.doc.findLastIndex(
      p => p.children[0]?.innerHTML === "MULTIPLE CHOICE",
    );
    if (mcqSection < 0) {
      // Sometimes MCQ is the only section and it doesn't get a subheader
      mcqSection = answerSection;
    }
    if (mcqSection < answerSection) {
      throw new Error("Couldn't find multiple choice answers in exam file.");
    }

    const end = this.doc.findIndex(
      (p, i) => i > mcqSection && p.children.length === 1,
    );

    return this.doc
      .slice(mcqSection + 1, end < 0 ? undefined : end)
      .filter(p => p.children.length > 0);
  }

  extractMcqAnswers() {
    return Object.fromEntries(
      this.getMcqParagraphs()
        .map(p => Array.from(p.children)
          .map(w => w.innerHTML.trim())
          .filter(Boolean))
        .filter(([number, ans, bubble]) => true
          && ans === "ANS:"
          && /^\d+[.)]$/.test(number)
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

  public title: string;

  constructor(private data: RequestData) {
    this.sheet = AnswerSheets[data.answerSheet];
    const { w, h } = this.sheet.dimensions;

    this.title = this.generateTitle();

    this.doc = new jsPDF({
      unit: "pt",
      format: [w, h],
    })
      .setProperties({ title: this.title })
      .setLineWidth(0.1)
      .setFont("Helvetica")
      .setFontSize(12)
      .addPage();
  }

  private generateTitle() {
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

  private getMeta(key: string) {
    return this.data[`__meta_${key}`];
  }

  private markBubble(blockData: BlockData, dimensions: { [key in keyof BlockData["dimensions"]]: number; }) {
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

export async function processRequest(formData: FormData) {
  try {
    const data = Object.fromEntries(formData.entries()) as RequestData;

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

    return {
      title: generator.title,
      body: await generator.export(),
    } satisfies Finished["doc"];
  }
  catch (err: any) {
    // console.error(err);
    throw new Error(err.message ?? "Unknown internal error.");
  }
}
