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
      },
    },
  },
};

export const AnswerSheets = {
  "Scantron 19641 Answer Sheet B": {
    dimensions: {
      w: 396.00,
      h: 792.00,
    },
    images: [
      "https://cdn11.bigcommerce.com/s-30cdzu3o6a/images/stencil/1280x1280/products/126/434/19641-6-1__47970.1674581161.jpg?c=1",
      "https://cdn11.bigcommerce.com/s-30cdzu3o6a/images/stencil/1280x1280/products/126/435/19641-6-2__48206.1674581161.jpg?c=1",
    ],
    inputs: {
      meta: {
        name: {
          page: 1,
          x: 230.25,
          y: 688.75,
        },
        subject: {
          page: 1,
          x: 242.75,
          y: 711.00,
        },
        period: {
          page: 1,
          x: 236.50,
          y: 733.25,
        },
        date: {
          page: 1,
          x: 296.25,
          y: 733.25,
        },
      },
    },
  },
} as const satisfies Record<string, AnswerSheet>;
