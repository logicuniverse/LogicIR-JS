import { softwareInvocationLogicUnit } from './fixture';
import { projectToVerilogOrReject } from './projector';

const result = projectToVerilogOrReject(softwareInvocationLogicUnit);

if (!result.interpretation.baselineOnly) {
  throw new Error('Projection result must declare baseline interpretation metadata.');
}

if (result.kind !== 'rejected') {
  throw new Error('Expected HDL projector to reject software invocation.');
}

const diagnostic = result.diagnostics[0];

if (diagnostic.code !== 'HDL_UNSUPPORTED_REQUIRED_FEATURE') {
  throw new Error(`Unexpected diagnostic code: ${diagnostic.code}`);
}

if (!diagnostic.feature.includes('logicir.software/invocation')) {
  throw new Error('Diagnostic should name the unsupported feature.');
}

console.log(
  JSON.stringify(
    {
      result: result.kind,
      interpretation: result.interpretation,
      diagnostic,
      artifactWritten: false,
    },
    null,
    2,
  ),
);
