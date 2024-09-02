export type AnswerSheetName = keyof typeof AnswerSheets;

export type AnswerSheet = {
  dimensions: {
    w: number,
    h: number,
  },
  images: {
    front: string,
    back: string,
  },
  bubble: {
    type: "circle" | "rect",
    args: number[],
  }
  inputs: {
    meta: Record<string, InputData>,
    answers: BlockData[],
  },
};

type Vec2d = {
  x: number,
  y: number,
};

export type InputData = Vec2d & {
  page: number,
};

export type BlockData = InputData & {
  length: number,
  offsets: {
    question: Vec2d,
    bubble: Vec2d,
  },
};

export const AnswerSheets = {
  "Scantron 19641 Answer Sheet B": {
    dimensions: {
      w: 396.00,
      h: 792.00,
    },
    images: {
      front: "https://cdn11.bigcommerce.com/s-30cdzu3o6a/images/stencil/1280x1280/products/126/434/19641-6-1__47970.1674581161.jpg?c=1",
      back: "https://cdn11.bigcommerce.com/s-30cdzu3o6a/images/stencil/1280x1280/products/126/435/19641-6-2__48206.1674581161.jpg?c=1",
    },
    bubble: {
      type: "circle",
      args: [5.00],
    },
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
      answers: [
        {
          page: 1,
          x: 56.40,
          y: 60.00,
          length: 25,
          offsets: {
            question: {
              x: 0.00,
              y: 24.00,
            },
            bubble: {
              x: 12.00,
              y: 0.00,
            },
          },
        },
        {
          page: 1,
          x: 140.40,
          y: 72.00,
          length: 25,
          offsets: {
            question: {
              x: 0.00,
              y: 24.00,
            },
            bubble: {
              x: 12.00,
              y: 0.00,
            },
          },
        },
        {
          page: 2,
          x: 339.60,
          y: 720.00,
          length: 25,
          offsets: {
            question: {
              x: 0.00,
              y: -24.00,
            },
            bubble: {
              x: -12.00,
              y: 0.00,
            },
          },
        },
        {
          page: 2,
          x: 255.60,
          y: 708.00,
          length: 25,
          offsets: {
            question: {
              x: 0.00,
              y: -24.00,
            },
            bubble: {
              x: -12.00,
              y: 0.00,
            },
          },
        },
      ],
    },
  },
} as const satisfies Record<string, AnswerSheet>;
