export const editSettings = {
  group: {
    defaultSize: {
      width: 200,
      height: 100,
    },
  },
  subFlow: {
    defaultSize: {
      width: 400,
      height: 200,
    },
  },
  connector: {
    defaultPosition: {
      input: {
        x: 50,
        y: 100,
      },
      output: {
        x: 250,
        y: 100,
      },
    },
  },
};

export type EditSettings = typeof editSettings;
