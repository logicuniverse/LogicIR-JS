import {
  EditorPortType,
  EditorReservedPortKey,
  NodeTemplate,
  PortVisibility,
  RunModeKind,
} from '../../../common';

export const emitTemplate: NodeTemplate = {
  kind: RunModeKind.Sequence,
  ports: {
    input: [{ key: 'input', type: EditorPortType.Data }],
    output: [{ key: 'output', type: EditorPortType.Stream }],
  },
  displayName: 'Emit',

  returnVoid: true,
  runModeOverrideAllowed: [],
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
