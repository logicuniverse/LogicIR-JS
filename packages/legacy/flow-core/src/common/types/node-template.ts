import { EditorNodeCommon, RunModeOverrideKind } from './editor-models';
import { NodeInterface } from './interfaces';

export enum StaticInputKind {
  SchemaForm = 'SF',
}

export type EditoStaticInputsForm = {
  kind: StaticInputKind.SchemaForm;
  schema: Record<string, any>;
};

export enum PortVisibility {
  AlwaysHidden = 'AH',
  DefaultShown = 'DS',
  DefaultHidden = 'DH',
}

export enum PortDestructuringKind {
  Object = 'Object',
  Array = 'Array',
}

export type PortsDestructuringAllowed = {
  input?: Record<string, PortDestructuringKind>;
  output?: Record<string, PortDestructuringKind>;
  return?: PortDestructuringKind;
};

export enum InputKind {
  File = 'FL',
  Field = 'FLD',
}

export type FileInput = {
  kind: InputKind.File;
  mimeType: string;
  extension?: string;
};

export type FieldProps = {
  label?: string;
  description?: string;
  hint?: string;
  help?: string;
  size?: 'md' | 'xs' | 'sm' | 'lg' | 'xl';
};

export type StaticInputs = ((FileInput | FieldInput) & {
  key: string;
})[];

export type FieldInput = {
  kind: InputKind.Field;
  component:
    | 'Checkbox'
    | 'CheckboxGroup'
    | 'ColorPicker'
    | 'Input'
    | 'InputDate'
    | 'InputMenu'
    | 'InputNumber'
    | 'InputTags'
    | 'InputTime'
    | 'PinInput'
    | 'RadioGroup'
    | 'Select'
    | 'SelectMenu'
    | 'Slider'
    | 'Switch'
    | 'Textarea';
  componentProps?: Record<string, any>;
  fieldProps?: FieldProps;
};

export type NodeTemplate = NodeInterface & {
  displayName?: string;
  description?: string;
  defaults?: Partial<EditorNodeCommon>;
  staticInputs?: StaticInputs;
  renderTemplate?: string;
  runModeOverrideAllowed?: RunModeOverrideKind[];
  portsVisibility?: {
    input?: Record<string, PortVisibility>;
    output?: Record<string, PortVisibility>;
    // return?: PortVisibility;
  };
  portsDestructuringAllowed?: PortsDestructuringAllowed;
  subsystems?: Record<string, NodeTemplate>;
  customDependencyAllowed?: boolean; // whether custom dependencies are allowed for this node, default to false
};

// export type Service = {
//   isStateful: boolean; // if true, service can have multiple instances, and methods in each instance can communicate with each other internally;
//   //  otherwise only library functions, no internal state between method calls
//   nodeTemplates: Record<string, NodeTemplate>;
//   displayName: string;
//   description?: string;
// };
