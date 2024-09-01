export type AnswerSheetName = keyof typeof AnswerSheets;

export type AnswerSheet = {
  dimensions: {
    w: number,
    h: number,
  },
  images: string[],
  inputs: {
    meta: {
      [key: string]: {
        page: number,
        x: number,
        y: number,
        w: number,
        h: number,
      },
    },
  },
};

export const AnswerSheets = {
  "Scantron 19641 Answer Sheet B": {
    dimensions: {
      w: 396,
      h: 792,
    },
    images: [
      "https://cdn11.bigcommerce.com/s-30cdzu3o6a/images/stencil/1280x1280/products/126/434/19641-6-1__47970.1674581161.jpg?c=1",
      "https://cdn11.bigcommerce.com/s-30cdzu3o6a/images/stencil/1280x1280/products/126/435/19641-6-2__48206.1674581161.jpg?c=1",
    ],
    inputs: {
      meta: {
        name: {
          page: 1,
          x: 3 + 3/16,
          y: 9 + 9/16,
          w: 2 + 1/16,
          h: 0 + 5/16,
        },
        subject: {
          page: 1,
          x: 3 + 3/8,
          y: 9 + 7/8,
          w: 1 + 7/8,
          h: 0 + 5/16,
        },
        period: {
          page: 1,
          x: 3 + 9/32,
          y: 10 + 3/16,
          w: 0 + 13/32,
          h: 0 + 5/16,
        },
        date: {
          page: 1,
          x: 4 + 1/8,
          y: 10 + 3/16,
          w: 1 + 1/8,
          h: 0 + 5/16,
        },
      },
    },
  },
} as const satisfies Record<string, AnswerSheet>;
