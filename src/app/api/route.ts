"use server";

import jsPDF from "jspdf";

import { AnswerSheet, AnswerSheets } from "@/lib/data";

type RequestData = {
  examFile: File;
  answerSheet: keyof typeof AnswerSheets;
  [key: `__meta_${string}`]: string | undefined;
};

class Generator {
  private doc: jsPDF;
  private sheet: AnswerSheet;

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

  async export() {
    return this.doc.output("datauristring");
  }
}

export async function POST(request: Request) {
  const data = Object.fromEntries((await request.formData()).entries()) as RequestData;

  if (data.answerSheet in AnswerSheets === false) {
    return new Response("Couldn't get information for answer sheet.", { status: 400 });
  }

  const generator = new Generator(data);

  await generator.drawBackground();
  generator.drawMetadata();

  return new Response(await generator.export());
}
