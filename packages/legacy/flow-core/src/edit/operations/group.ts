import { EditorGroup, EditorNodeTargetData } from '../../common';
import { generateGroupId } from '../../common/utils/id';
import { EditHandler, EditContext } from '../types';
import { updateObjectProperty } from '../../utils/object';

type OpAddGroupParams = {
  target: EditorNodeTargetData;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
};
export const opAddGroup: EditHandler = (params: OpAddGroupParams) => {
  const groupId = generateGroupId();
  return {
    updater: (targetFlow) => {
      targetFlow.groups[groupId] = {
        position: params.position,
        tags: [],
        size: params.size,
      };
    },
    selection: [groupId],
  };
};

type GroupField = keyof EditorGroup;
type OpUpdateGroupFieldParams<T extends GroupField = GroupField> = {
  groupId: string;
  key: T;
  value: EditorGroup[T];
};

export const opUpdateGroupField: EditHandler = (
  params: OpUpdateGroupFieldParams
) => {
  return {
    updater: (targetFlow) => {
      const group = targetFlow.groups[params.groupId];
      updateObjectProperty(group, params.key, params.value);
    },
  };
};
