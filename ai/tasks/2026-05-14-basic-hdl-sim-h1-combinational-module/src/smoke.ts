import { and2LogicUnit } from './fixture';
import { emitH1Verilog } from './projector';

const artifacts = emitH1Verilog(and2LogicUnit);

if (!artifacts.interpretation.baselineOnly) {
  throw new Error('HDL artifacts must declare baseline interpretation metadata.');
}

if (!artifacts.moduleText.includes('module logicir_h1_and2')) {
  throw new Error('Expected generated module name.');
}

if (!artifacts.testbenchText.includes('H1_PASS')) {
  throw new Error('Expected generated testbench pass marker.');
}

console.log(
  JSON.stringify(
    {
      module: artifacts.modulePath,
      testbench: artifacts.testbenchPath,
      interpretation: artifacts.interpretation,
      expectedSimulationMarker: 'H1_PASS',
    },
    null,
    2,
  ),
);
