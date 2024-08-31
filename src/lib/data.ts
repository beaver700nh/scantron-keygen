export const AnswerSheets: {
  [key: string]: {
    dimensions: {
      w: number;
      h: number;
    },
    inputs: {
      meta: {
        [key: string]: any;
      },
    },
  };
} = {
  "Scantron 19641 Answer Sheet B": {
    dimensions: {
      w: 5 + 1 / 2,
      h: 11,
    },
    inputs: {
      meta: {
        name: {},
        subject: {},
        period: {},
        date: {},
      },
    },
  },
};
