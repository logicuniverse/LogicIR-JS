import { register4LogicUnit } from './fixture';
import { emitH3Verilog } from './projector';

const artifacts = emitH3Verilog(register4LogicUnit);

if (!artifacts.moduleText.includes('always @(posedge clk or posedge rst)')) {
  throw new Error('Expected clock/reset sequential block.');
}

if (!artifacts.testbenchText.includes('H3_PASS')) {
  throw new Error('Expected H3 pass marker.');
}

console.log(
  JSON.stringify(
    {
      module: artifacts.modulePath,
      testbench: artifacts.testbenchPath,
      expectedSimulationMarker: 'H3_PASS',
    },
    null,
    2,
  ),
);
