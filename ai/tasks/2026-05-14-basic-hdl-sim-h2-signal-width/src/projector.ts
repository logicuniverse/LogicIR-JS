import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import type {
  ExtensionRecord,
  HdlArtifacts,
  HdlOperationPayload,
  HdlSignalPayload,
  LogicUnit,
  Port,
} from './types';
import { baselineInterpretation } from './types';

const GENERATED_DIR = 'generated';

const signalOf = (port: Port): HdlSignalPayload => {
  const payload = port.extensions?.find(
    (extension) => extension.featureKey === 'hdlSignal' && extension.key === 'signal',
  )?.payload as HdlSignalPayload | undefined;

  if (!payload || payload.width < 1) {
    throw new Error('Missing valid HDL signal payload.');
  }

  return payload;
};

const rangeOf = (signal: HdlSignalPayload): string =>
  signal.width === 1 ? '' : `[${signal.width - 1}:0] `;

const operationOf = (logicUnit: LogicUnit): HdlOperationPayload => {
  const lui = Object.values(logicUnit.core.luis)[0];
  const payload = lui.extensions?.find(
    (extension: ExtensionRecord) =>
      extension.featureKey === 'hdlCombinational' && extension.key === 'operation',
  )?.payload as HdlOperationPayload | undefined;

  if (!payload || payload.op !== 'add') {
    throw new Error('H2 supports only add operation.');
  }

  return payload;
};

const emitModule = (logicUnit: LogicUnit): string => {
  const operation = operationOf(logicUnit);
  const a = signalOf(logicUnit.core.ports.a);
  const b = signalOf(logicUnit.core.ports.b);
  const y = signalOf(logicUnit.core.ports.y);

  if (a.width !== b.width || a.width !== y.width) {
    throw new Error('H2 expects matching input and output widths.');
  }

  return [
    'module logicir_h2_add4(',
    `  input wire ${rangeOf(a)}a,`,
    `  input wire ${rangeOf(b)}b,`,
    `  output wire ${rangeOf(y)}y`,
    ');',
    `  assign y = ${operation.op === 'add' ? 'a + b' : "4'b0000"};`,
    'endmodule',
    '',
  ].join('\n');
};

const emitTestbench = (): string =>
  [
    '`timescale 1ns/1ps',
    'module logicir_h2_add4_tb;',
    '  reg [3:0] a;',
    '  reg [3:0] b;',
    '  wire [3:0] y;',
    '',
    '  logicir_h2_add4 dut(.a(a), .b(b), .y(y));',
    '',
    '  initial begin',
    "    a = 4'd1; b = 4'd2; #1; if (y !== 4'd3) $fatal(1, \"1+2 failed\");",
    "    a = 4'd7; b = 4'd8; #1; if (y !== 4'd15) $fatal(1, \"7+8 failed\");",
    "    a = 4'd15; b = 4'd1; #1; if (y !== 4'd0) $fatal(1, \"wrap failed\");",
    '    $display("H2_PASS");',
    '    $finish;',
    '  end',
    'endmodule',
    '',
  ].join('\n');

export const emitH2Verilog = (logicUnit: LogicUnit): HdlArtifacts => {
  mkdirSync(GENERATED_DIR, { recursive: true });

  const modulePath = join(GENERATED_DIR, 'h2_module.v');
  const testbenchPath = join(GENERATED_DIR, 'h2_tb.v');
  const moduleText = emitModule(logicUnit);
  const testbenchText = emitTestbench();

  writeFileSync(modulePath, moduleText);
  writeFileSync(testbenchPath, testbenchText);

  return {
    interpretation: baselineInterpretation('h2-width-aware-verilog-emit', [
      'HDL signal payload width is preserved in Verilog port declarations.',
      'Arithmetic wrap behavior is verified by a task-local iverilog testbench.',
    ]),
    modulePath,
    testbenchPath,
    moduleText,
    testbenchText,
  };
};
