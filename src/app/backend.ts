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
  drawBackground?: string;
  [key: `__meta_${string}`]: string | undefined;
};

class ParseError extends Error {
  constructor(message?: string, ...args: any[]) {
    message = [
      "Parse error",
      message,
    ].filter(Boolean).join(": ");
    super(message, ...args);
  }
}

class ExamParser {
  private doc: HTMLElement[] = [];

  constructor(private data: RequestData) {}

  async init() {
    try {
      const buffer = Buffer.from(await this.data.examFile.arrayBuffer());
      this.doc = await new RTFJS.Document(buffer, {}).render();
    }
    catch (err: any) {
      throw new ParseError(`Error in exam file: ${err.message}.`);
    }
  }

  private getMcqParagraphs() {
    const answerSection = this.doc.findLastIndex(
      p => p.children[0]?.innerHTML === "Answer Section",
    );
    if (answerSection < 0) {
      throw new ParseError("Couldn't find answer section in exam file.");
    }

    let mcqSection = this.doc.findLastIndex(
      p => p.children[0]?.innerHTML === "MULTIPLE CHOICE",
    );
    if (mcqSection < 0) {
      // Sometimes MCQ is the only section and it doesn't get a subheader
      mcqSection = answerSection;
    }
    if (mcqSection < answerSection) {
      throw new ParseError("Couldn't find multiple choice answers in exam file.");
    }

    const end = this.doc.findIndex(
      (p, i) => i > mcqSection && p.children.length === 1,
    );

    return this.doc
      .slice(mcqSection + 1, end < 0 ? undefined : end)
      .filter(p => p.children.length > 0);
  }

  extractMcqAnswers() {
    return this.getMcqParagraphs()
      .map(p => Array.from(p.children)
        .map(w => w.innerHTML.trim())
        .filter(Boolean))
      .filter(([number, ans, bubble]) => true
        && ans === "ANS:"
        && /^\d+[.)]$/.test(number)
        && /^[A-E]$/.test(bubble))
      .map(([number, _, bubble], index) => ({
        question: this.data.packQuestions != null
          ? index
          : parseInt(number.slice(0, -1), 10) - 1,
        bubble: bubble.charCodeAt(0) - "A".charCodeAt(0)
      }));
  }
}

class PdfGenerator {
  public title: string;

  private sheet: AnswerSheet;
  private doc: jsPDF;

  private blockStarts: number[];
  private questionsPerSheet: number;
  private finalSheet: number;

  constructor(private data: RequestData, private answers: { question: number; bubble: number; }[]) {
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

    this.blockStarts = this.calculateBlockStarts(this.sheet.inputs.answers);
    this.questionsPerSheet = this.blockStarts.at(-1)!;
    this.finalSheet = answers.at(-1)!.question / this.questionsPerSheet;

    for (let i = 1; i <= this.finalSheet; ++i) {
      this.doc
        .addPage()
        .addPage();
    }
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

  private calculateBlockStarts(blockData: BlockData[]) {
    const blockLengths = blockData.map(block => block.length);

    for (let i = 0; i + 1 < blockLengths.length; ++i) {
      blockLengths[i + 1] += blockLengths[i];
    }

    return blockLengths;
  }

  async drawBackground() {
    const { width, height } = this.doc.internal.pageSize;
    for (const [index, url] of Object.entries(this.sheet.images)) {
      const image = await fetch(url);
      const data = Buffer.from(await image.arrayBuffer()).toString("base64");
      const uri = `data:${image.headers.get("Content-Type")};base64,${data}`;

      for (let sheet = 0; sheet <= this.finalSheet; ++sheet) {
        this.doc.setPage((index === "front" ? 1 : 2) + 2*sheet);
        this.doc.addImage(uri, "JPEG", 0, 0, width, height);
      }
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

  drawAnswers() {
    for (const answer of this.answers) {
      const sheet = Math.floor(answer.question / this.questionsPerSheet);
      answer.question %= this.questionsPerSheet;

      const blockIndex = this.sheet.inputs.answers.findIndex(
        (_, index) => this.blockStarts[index] > answer.question,
      );

      const { page, x, y, length, offsets } = this.sheet.inputs.answers[blockIndex];
      const blockData = { page: page + 2*sheet, x, y, length, offsets };

      const { question, bubble } = answer;
      const indices = {
        question: answer.question - (this.blockStarts[blockIndex - 1] ?? 0),
        bubble,
      };

      this.markBubble(blockData, indices);
    }
  }

  private markBubble(
    blockData: BlockData,
    indices: {
      [key in keyof BlockData["offsets"]]: number;
    }
  ) {
    this.doc.setPage(blockData.page);

    const _offsets = blockData.offsets;
    (this.doc[this.sheet.bubble.type] as any).apply(
      this.doc,
      [
        blockData.x
          + indices.question * _offsets.question.x
          + indices.bubble * _offsets.bubble.x,
        blockData.y
          + indices.question * _offsets.question.y
          + indices.bubble * _offsets.bubble.y,
        ...this.sheet.bubble.args,
        "F",
      ],
    );
  }

  async export() {
    return this.doc.output("datauristring");
  }
}

export async function processRequest(formData: FormData) {
  try {
    const data = Object.fromEntries(formData.entries()) as RequestData;

    if (data.answerSheet in AnswerSheets === false) {
      throw new ParseError("Answer sheet not found. Did you forget to select one?");
    }

    const exam = new ExamParser(data);
    await exam.init();
    const answers = exam.extractMcqAnswers();

    const generator = new PdfGenerator(data, answers);
    data.drawBackground != null
      && await generator.drawBackground();
    generator.drawMetadata();
    generator.drawAnswers();

    return {
      title: generator.title,
      body: await generator.export(),
    } satisfies Finished["doc"];
  }
  catch (err: any) {
    console.error(err);

    if (err instanceof ParseError === false)
      throw new Error("There was an unexpected internal error.");
    else
      throw err;
  }
}
