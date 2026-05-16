import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import type {
  ExtensionRecord,
  HdlArtifacts,
  HdlOperationPayload,
  LogicUnit,
  PortKey,
} from './types';
import { baselineInterpretation } from './types';

const GENERATED_DIR = 'generated';

const getOperation = (logicUnit: LogicUnit): HdlOperationPayload => {
  const entries = Object.entries(logicUnit.core.luis);

  if (entries.length !== 1) {
    throw new Error(`H1 supports exactly one LUI, got ${entries.length}`);
  }

  const [, lui] = entries[0];
  const operation = lui.extensions?.find(
    (extension: ExtensionRecord) =>
      extension.featureKey === 'hdlCombinational' &&
      extension.key === 'operation',
  )?.payload as HdlOperationPayload | undefined;

  if (!operation || operation.op !== 'and') {
    throw new Error('H1 supports only an HDL and operation.');
  }

  return operation;
};

const inputPorts = (logicUnit: LogicUnit): PortKey[] =>
  Object.keys(logicUnit.core.ports.inputs);

const outputPorts = (logicUnit: LogicUnit): PortKey[] => {
  const result =
    'result' in logicUnit.core.ports ? logicUnit.core.ports.result : undefined;

  if (!result) {
    throw new Error('H1 expects a result port.');
  }

  return result.pins?.kind === 'keyed'
    ? result.pins.keys
    : ['result'];
};

const emitModule = (logicUnit: LogicUnit): string => {
  const inputs = inputPorts(logicUnit);
  const outputs = outputPorts(logicUnit);
  const operation = getOperation(logicUnit);

  if (inputs.length !== 2 || outputs.length !== 1) {
    throw new Error('H1 expects two inputs and one output.');
  }

  const [a, b] = inputs;
  const [y] = outputs;

  return [
    'module logicir_h1_and2(',
    `  input wire ${a},`,
    `  input wire ${b},`,
    `  output wire ${y}`,
    ');',
    `  assign ${y} = ${operation.op === 'and' ? `${a} & ${b}` : "1'b0"};`,
    'endmodule',
    '',
  ].join('\n');
};

const emitTestbench = (): string =>
  [
    '`timescale 1ns/1ps',
    'module logicir_h1_and2_tb;',
    '  reg a;',
    '  reg b;',
    '  wire y;',
    '',
    '  logicir_h1_and2 dut(.a(a), .b(b), .y(y));',
    '',
    '  initial begin',
    "    a = 1'b0; b = 1'b0; #1; if (y !== 1'b0) $fatal(1, \"00 failed\");",
    "    a = 1'b0; b = 1'b1; #1; if (y !== 1'b0) $fatal(1, \"01 failed\");",
    "    a = 1'b1; b = 1'b0; #1; if (y !== 1'b0) $fatal(1, \"10 failed\");",
    "    a = 1'b1; b = 1'b1; #1; if (y !== 1'b1) $fatal(1, \"11 failed\");",
    '    $display("H1_PASS");',
    '    $finish;',
    '  end',
    'endmodule',
    '',
  ].join('\n');

export const emitH1Verilog = (logicUnit: LogicUnit): HdlArtifacts => {
  mkdirSync(GENERATED_DIR, { recursive: true });

  const modulePath = join(GENERATED_DIR, 'h1_module.v');
  const testbenchPath = join(GENERATED_DIR, 'h1_tb.v');
  const moduleText = emitModule(logicUnit);
  const testbenchText = emitTestbench();

  writeFileSync(modulePath, moduleText);
  writeFileSync(testbenchPath, testbenchText);

  return {
    interpretation: baselineInterpretation('h1-direct-combinational-verilog-emit', [
      'A supported combinational AND operation is emitted as a direct continuous assignment.',
      'Generated Verilog is a runnable projection baseline, not a required projector architecture.',
    ]),
    modulePath,
    testbenchPath,
    moduleText,
    testbenchText,
  };
};
