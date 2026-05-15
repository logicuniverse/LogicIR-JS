import { add4LogicUnit } from './fixture';
import { emitH2Verilog } from './projector';

const artifacts = emitH2Verilog(add4LogicUnit);

if (!artifacts.interpretation.baselineOnly) {
  throw new Error('HDL artifacts must declare baseline interpretation metadata.');
}

if (!artifacts.moduleText.includes('input wire [3:0] a')) {
  throw new Error('Expected 4-bit input a.');
}

if (!artifacts.moduleText.includes('assign y = a + b;')) {
  throw new Error('Expected add expression.');
}

console.log(
  JSON.stringify(
    {
      module: artifacts.modulePath,
      testbench: artifacts.testbenchPath,
      interpretation: artifacts.interpretation,
      expectedSimulationMarker: 'H2_PASS',
    },
    null,
    2,
  ),
);
