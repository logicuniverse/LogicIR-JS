import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import type {
  ClockingPayload,
  HdlArtifacts,
  LogicUnit,
  StatePayload,
} from './types';
import { baselineInterpretation } from './types';

const GENERATED_DIR = 'generated';

const getState = (logicUnit: LogicUnit): StatePayload => {
  const lui = logicUnit.core.luis.reg;
  const state = lui.extensions?.find(
    (extension) => extension.featureKey === 'hdlState' && extension.key === 'register',
  )?.payload as StatePayload | undefined;

  if (!state || state.width !== 4) {
    throw new Error('H3 expects a 4-bit register state payload.');
  }

  return state;
};

const getClocking = (logicUnit: LogicUnit): ClockingPayload => {
  const clocking = logicUnit.core.extensions?.find(
    (extension) =>
      extension.featureKey === 'hdlClocking' && extension.key === 'clock-reset',
  )?.payload as ClockingPayload | undefined;

  if (!clocking || clocking.resetActive !== 'high') {
    throw new Error('H3 expects active-high clock/reset payload.');
  }

  return clocking;
};

const emitModule = (logicUnit: LogicUnit): string => {
  const state = getState(logicUnit);
  const clocking = getClocking(logicUnit);
  const range = `[${state.width - 1}:0]`;

  return [
    'module logicir_h3_reg4(',
    `  input wire ${clocking.clock},`,
    `  input wire ${clocking.reset},`,
    `  input wire ${range} d,`,
    `  output reg ${range} q`,
    ');',
    `  always @(posedge ${clocking.clock} or posedge ${clocking.reset}) begin`,
    `    if (${clocking.reset}) begin`,
    `      q <= ${state.width}'d${state.resetValue};`,
    '    end else begin',
    '      q <= d;',
    '    end',
    '  end',
    'endmodule',
    '',
  ].join('\n');
};

const emitTestbench = (): string =>
  [
    '`timescale 1ns/1ps',
    'module logicir_h3_reg4_tb;',
    '  reg clk;',
    '  reg rst;',
    '  reg [3:0] d;',
    '  wire [3:0] q;',
    '',
    '  logicir_h3_reg4 dut(.clk(clk), .rst(rst), .d(d), .q(q));',
    '',
    '  initial begin',
    "    clk = 1'b0;",
    '    forever #5 clk = ~clk;',
    '  end',
    '',
    '  initial begin',
    "    rst = 1'b1; d = 4'd9; #2;",
    "    if (q !== 4'd0) $fatal(1, \"reset failed\");",
    "    rst = 1'b0; d = 4'd6; #10;",
    "    if (q !== 4'd6) $fatal(1, \"first latch failed\");",
    "    d = 4'd12; #10;",
    "    if (q !== 4'd12) $fatal(1, \"second latch failed\");",
    '    $display("H3_PASS");',
    '    $finish;',
    '  end',
    'endmodule',
    '',
  ].join('\n');

export const emitH3Verilog = (logicUnit: LogicUnit): HdlArtifacts => {
  mkdirSync(GENERATED_DIR, { recursive: true });

  const modulePath = join(GENERATED_DIR, 'h3_module.v');
  const testbenchPath = join(GENERATED_DIR, 'h3_tb.v');
  const moduleText = emitModule(logicUnit);
  const testbenchText = emitTestbench();

  writeFileSync(modulePath, moduleText);
  writeFileSync(testbenchPath, testbenchText);

  return {
    interpretation: baselineInterpretation('h3-clocked-register-verilog-emit', [
      'State and clocking payloads are emitted as an explicit clock/reset register block.',
      'Sequential behavior is validated by a task-local iverilog simulation baseline.',
    ]),
    modulePath,
    testbenchPath,
    moduleText,
    testbenchText,
  };
};
