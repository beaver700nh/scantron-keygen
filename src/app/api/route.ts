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
      .setLineWidth(0.01)
      .setFont("Helvetica")
      .setFontSize(12)
      .addPage();
  }

  generateTitle() {
    const classInfo = [
      this.data.__meta_period && `Period ${this.data.__meta_period}`,
      this.data.__meta_subject,
    ].filter(Boolean).join(" ");

    return [
      "Scantron Answer Sheet",
      classInfo,
      this.data.__meta_name,
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
    // TODO probably remove
    const Constants = {
      Margin: 2.25,
    };

    for (const [name, {page, x, y, w, h}] of Object.entries(this.sheet.inputs.meta)) {
      this.doc
        .setPage(page)
        .setFillColor(255, 255, 0)
        .rect(x*72, y*72, w*72, -h*72, "F")
        .setDrawColor(255, 0, 0)
        .rect(
          x*72 + Constants.Margin,
          y*72 - Constants.Margin,
          w*72 - 2 * Constants.Margin,
          -h*72 + 2 * Constants.Margin,
          "S",
        )
        .setDrawColor(0, 0, 0)
        .text(name, x*72 + Constants.Margin, y*72 - Constants.Margin);
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
