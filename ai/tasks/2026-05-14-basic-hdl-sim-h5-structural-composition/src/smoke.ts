import {
  and3StructuralLogicUnit,
  and3TruthTable,
  h5LibraryModules,
} from './fixture';
import { emitH5Verilog } from './projector';

const artifacts = emitH5Verilog(and3StructuralLogicUnit, {
  libraryModules: h5LibraryModules,
  testVectors: and3TruthTable,
});

if (!artifacts.interpretation.baselineOnly) {
  throw new Error('HDL artifacts must declare baseline interpretation metadata.');
}

if (!artifacts.moduleText.includes('logicir_h5_and2 u_and_ab')) {
  throw new Error('Expected first child module instance.');
}

if (!artifacts.moduleText.includes('logicir_h5_and2 u_and_abc')) {
  throw new Error('Expected second child module instance.');
}

if (!artifacts.moduleText.includes('module logicir_h5_and3(')) {
  throw new Error('Expected top module name to come from HDL module payload.');
}

if (!artifacts.testbenchText.includes('logicir_h5_and3_tb')) {
  throw new Error('Expected generated testbench module.');
}

for (const vector of and3TruthTable) {
  if (!artifacts.testbenchText.includes(vector.name)) {
    throw new Error(`Expected testbench vector ${vector.name}.`);
  }
}

console.log(
  JSON.stringify(
    {
      modules: artifacts.modulePath,
      testbench: artifacts.testbenchPath,
      interpretation: artifacts.interpretation,
      vectors: and3TruthTable.length,
      expectedSimulationMarker: 'H5_PASS',
    },
    null,
    2,
  ),
);
