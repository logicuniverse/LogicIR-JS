import { EditorSequenceConnection } from '../types';

export const isGoBackConnection = (
  connection: EditorSequenceConnection
): connection is { goBackFrom: string; goBackTo: string } => {
  return 'goBackFrom' in connection && 'goBackTo' in connection;
};

export const isExecutionConnection = (
  connection: EditorSequenceConnection
): connection is
  | { from: string; to: string | null }
  | { from: string | null; to: string } => {
  return !isGoBackConnection(connection);
};
