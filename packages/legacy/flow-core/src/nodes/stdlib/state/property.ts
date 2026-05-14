import { EditorPortType, NodeTemplate, RunModeKind } from '../../../common';

export const propertyTemplate: NodeTemplate = {
  kind: RunModeKind.StateMachine,
  ports: {
    input: [
      { key: 'initial', type: EditorPortType.Data },
      { key: 'update', type: EditorPortType.Stream },
    ],
    output: [{ key: 'output', type: EditorPortType.Property }],
  },
  displayName: 'Property',

  // dataType: {
  //   typeParameters: {
  //     T: {
  //       Kind: 'Unknown',
  //     },
  //   },
  //   dataIn: {
  //     Kind: 'Object',
  //     Param: {
  //       input: {
  //         Kind: 'TypeVar',
  //         Param: 'T',
  //       },
  //     },
  //   },
  //   streamOut: {
  //     output: {
  //       Kind: 'TypeVar',
  //       Param: 'T',
  //     },
  //   },
  // },
};
