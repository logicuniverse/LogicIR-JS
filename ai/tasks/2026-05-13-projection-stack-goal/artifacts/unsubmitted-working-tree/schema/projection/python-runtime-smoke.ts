/**
 * Executable Python runtime lowering smoke test.
 */

import {
  childWithRequirementContractExample,
  combinationalAdderExample,
  sequentialPipelineExample,
  statefulRetainedCounterExample,
} from '../core/v0-draft/examples';
import type {
  ExtensionRecord,
  LogicUnit,
  LUI,
  Port,
} from '../core/v0-draft/types';
import { LOGIC_IR_CORE_SCHEMA_VERSION } from '../core/v0-draft/types';
import type { ProjectorCapabilitySet } from './types';
import { projectPythonRuntimePlan } from './target-plans';
import { lowerPythonExecutableRuntime } from './lowering';

declare const require: (id: string) => unknown;

const { mkdtempSync, rmSync, writeFileSync } = require('fs') as {
  mkdtempSync: (prefix: string) => string;
  rmSync: (path: string, options: { recursive: boolean; force: boolean }) => void;
  writeFileSync: (path: string, content: string, encoding: 'utf8') => void;
};
const { tmpdir } = require('os') as { tmpdir: () => string };
const { join } = require('path') as {
  join: (...parts: string[]) => string;
};
const { spawnSync } = require('child_process') as {
  spawnSync: (
    command: string,
    args: string[],
    options: { encoding: 'utf8' }
  ) => { status: number | null; stdout: string; stderr: string; error?: Error };
};

const capabilities = {
  name: 'python-runtime-executable-smoke',
  target: 'python-runtime',
  core: {
    coreVersions: [LOGIC_IR_CORE_SCHEMA_VERSION],
    luKinds: ['combinational', 'sequential', 'stateful', 'structural'],
    fulfillmentScopes: ['independent-units', 'shared-service'],
    portInteractions: {
      pullReadable: true,
      pushNotifiable: true,
      retainedCurrent: true,
    },
    endpointAddressing: {
      pins: true,
      payloadPath: true,
      maxPayloadPathDepth: 8,
    },
    structuralComposition: {
      exportAnchors: true,
      externalOutlets: true,
      childAnchors: true,
      childOutlets: true,
      collections: true,
      maps: true,
    },
    requirements: {
      inlineServices: true,
      externalServices: true,
      nestedPlainRequirements: true,
      closureFulfillment: true,
      upstreamUnitFulfillment: true,
      upstreamSharedServiceFulfillment: true,
    },
  },
  features: [
    {
      feature: { namespace: 'logicir.type-system', key: 'core' },
      extensionKeys: [
        'type-definitions',
        'payload-types',
        'port-compatibility',
        'path-schema',
      ],
      supportsRequired: true,
      supportsOptional: true,
    },
    {
      feature: { namespace: 'logicir.python-runtime', key: 'core' },
      extensionKeys: [
        'async-policy',
        'retained-current-realization',
        'dynamic-fulfillment',
        'resource-lifecycle',
        'concurrency',
        'error-policy',
      ],
      supportsRequired: true,
      supportsOptional: true,
    },
  ],
  typeSystem: {
    feature: { namespace: 'logicir.type-system', key: 'core' },
    typeForms: ['primitive', 'record', 'array', 'tuple', 'named'],
    compatibilityPolicies: [
      'exact',
      'assignable',
      'widening',
      'projector-adapter',
      'custom',
    ],
    pathSchema: true,
    requirementCompatibility: true,
    compositionCompatibility: true,
  },
  pythonRuntime: {
    feature: { namespace: 'logicir.python-runtime', key: 'core' },
    invocation: [
      'sync-call',
      'coroutine',
      'async-generator',
      'generator',
      'threadpool-call',
    ],
    retainedCurrentRealization: [
      'source-property',
      'sink-cache',
      'asyncio-queue-latest',
      'observable',
      'projector-adapter',
    ],
    dynamicFulfillment: [
      'constructor-injected',
      'contextvar',
      'service-container',
      'late-bound',
      'switchable',
    ],
    resourceLifecycle: [
      'none',
      'context-manager',
      'async-context-manager',
      'start-stop',
      'custom',
    ],
    concurrency: [
      'same-thread',
      'asyncio-task',
      'thread',
      'process',
      'external-worker',
    ],
    errorPolicies: [
      'raise',
      'return-exception',
      'emit-error',
      'cancel-task',
      'use-error-port',
    ],
  },
} satisfies ProjectorCapabilitySet;

const unit = withPortPayloadTypes(combinationalAdderExample);
const result = projectPythonRuntimePlan(unit, capabilities);
assert(result.ok, 'Python runtime plan should be valid for typed adder.');
if (!result.ok) {
  throw new Error('unreachable');
}

const artifact = lowerPythonExecutableRuntime(result.plan);
const dir = mkdtempSync(join(tmpdir(), 'logicir-python-runtime-'));
try {
  const filePath = join(dir, artifact.filename);
  writeFileSync(filePath, artifact.content, 'utf8');
  const runner = join(dir, 'run_smoke.py');
  writeFileSync(
    runner,
    [
      'import importlib.util',
      'import pathlib',
      '',
      `module_path = pathlib.Path(${JSON.stringify(filePath)})`,
      'spec = importlib.util.spec_from_file_location("logicir_runtime_executable", module_path)',
      'module = importlib.util.module_from_spec(spec)',
      'assert spec.loader is not None',
      'spec.loader.exec_module(module)',
      '',
      'def adder(inputs, context):',
      '    return {"sum": inputs["a"] + inputs["b"]}',
      '',
      'runtime = module.create_runtime({"implementations": {"adder": adder}})',
      'outputs = runtime.invoke({"a": 2, "b": 5})',
      'assert outputs["sum"] == 7, outputs',
      '',
    ].join('\n'),
    'utf8'
  );

  const completed = spawnSync('python', [runner], { encoding: 'utf8' });
  if (completed.error) {
    throw completed.error;
  }
  assert(
    completed.status === 0,
    `Python smoke failed with exit ${String(completed.status)}\n${completed.stdout}\n${completed.stderr}`
  );

  const pathUnit = withPayloadPathBusTypes(payloadPathAdderUnit());
  const pathResult = projectPythonRuntimePlan(pathUnit, capabilities);
  assert(
    pathResult.ok,
    'Python runtime plan should support typed payloadPath unit.'
  );
  if (!pathResult.ok) {
    throw new Error('unreachable');
  }
  const pathArtifact = lowerPythonExecutableRuntime(pathResult.plan);
  const pathFile = join(dir, `path_${pathArtifact.filename}`);
  writeFileSync(pathFile, pathArtifact.content, 'utf8');
  const pathRunner = join(dir, 'run_path_smoke.py');
  writeFileSync(
    pathRunner,
    [
      'import importlib.util',
      'import pathlib',
      '',
      `module_path = pathlib.Path(${JSON.stringify(pathFile)})`,
      'spec = importlib.util.spec_from_file_location("logicir_runtime_path_executable", module_path)',
      'module = importlib.util.module_from_spec(spec)',
      'assert spec.loader is not None',
      'spec.loader.exec_module(module)',
      '',
      'def adder(inputs, context):',
      '    return {"sum": inputs["a"] + inputs["b"]}',
      '',
      'runtime = module.create_runtime({"implementations": {"adder": adder}})',
      'outputs = runtime.invoke({"busIn": {"lanes": [2, 5]}})',
      'assert outputs["busOut"]["lanes"][0] == 7, outputs',
      '',
    ].join('\n'),
    'utf8'
  );
  const pathCompleted = spawnSync('python', [pathRunner], { encoding: 'utf8' });
  if (pathCompleted.error) {
    throw pathCompleted.error;
  }
  assert(
    pathCompleted.status === 0,
    `Python payloadPath smoke failed with exit ${String(pathCompleted.status)}\n${pathCompleted.stdout}\n${pathCompleted.stderr}`
  );

  const pinUnit = withPinBusTypes(pinAwareAdderUnit());
  const pinResult = projectPythonRuntimePlan(pinUnit, capabilities);
  assert(
    pinResult.ok,
    'Python runtime plan should support pin-aware unit.'
  );
  if (!pinResult.ok) {
    throw new Error('unreachable');
  }
  const pinArtifact = lowerPythonExecutableRuntime(pinResult.plan);
  const pinFile = join(dir, `pin_${pinArtifact.filename}`);
  writeFileSync(pinFile, pinArtifact.content, 'utf8');
  const pinRunner = join(dir, 'run_pin_smoke.py');
  writeFileSync(
    pinRunner,
    [
      'import importlib.util',
      'import pathlib',
      '',
      `module_path = pathlib.Path(${JSON.stringify(pinFile)})`,
      'spec = importlib.util.spec_from_file_location("logicir_runtime_pin_executable", module_path)',
      'module = importlib.util.module_from_spec(spec)',
      'assert spec.loader is not None',
      'spec.loader.exec_module(module)',
      '',
      'def adder(inputs, context):',
      '    return {"sum": inputs["a"] + inputs["b"]}',
      '',
      'runtime = module.create_runtime({"implementations": {"adder": adder}})',
      'outputs = runtime.invoke({"pairIn": [3, 4]})',
      'assert outputs["resultBus"]["sum"] == 7, outputs',
      '',
    ].join('\n'),
    'utf8'
  );
  const pinCompleted = spawnSync('python', [pinRunner], { encoding: 'utf8' });
  if (pinCompleted.error) {
    throw pinCompleted.error;
  }
  assert(
    pinCompleted.status === 0,
    `Python pin-aware smoke failed with exit ${String(pinCompleted.status)}\n${pinCompleted.stdout}\n${pinCompleted.stderr}`
  );

  const sequentialUnit = withSequentialPayloadTypes(
    sequentialPipelineExample
  );
  const sequentialResult = projectPythonRuntimePlan(
    withPythonAsyncPolicy(sequentialUnit, {
      invocation: 'sync-call',
      awaitBeforeNext: true,
      selector: { stepIndex: 1 },
    }),
    capabilities
  );
  assert(
    sequentialResult.ok,
    'Python runtime plan should support typed sequential pipeline.'
  );
  if (!sequentialResult.ok) {
    throw new Error('unreachable');
  }
  const sequentialArtifact = lowerPythonExecutableRuntime(
    sequentialResult.plan
  );
  const sequentialFile = join(
    dir,
    `sequential_${sequentialArtifact.filename}`
  );
  writeFileSync(sequentialFile, sequentialArtifact.content, 'utf8');
  const sequentialRunner = join(dir, 'run_sequential_smoke.py');
  writeFileSync(
    sequentialRunner,
    [
      'import importlib.util',
      'import pathlib',
      '',
      `module_path = pathlib.Path(${JSON.stringify(sequentialFile)})`,
      'spec = importlib.util.spec_from_file_location("logicir_runtime_sequential_executable", module_path)',
      'module = importlib.util.module_from_spec(spec)',
      'assert spec.loader is not None',
      'spec.loader.exec_module(module)',
      '',
      'def decode(inputs, context):',
      '    return {"output": inputs["input"].strip()}',
      '',
      'def normalize(inputs, context):',
      '    return {"output": inputs["input"].upper()}',
      '',
      'runtime = module.create_runtime({"implementations": {"decode": decode, "normalize": normalize}})',
      'outputs = runtime.invoke({"raw": "  logicir  "})',
      'assert outputs["normalized"] == "LOGICIR", outputs',
      '',
    ].join('\n'),
    'utf8'
  );
  const sequentialCompleted = spawnSync('python', [sequentialRunner], {
    encoding: 'utf8',
  });
  if (sequentialCompleted.error) {
    throw sequentialCompleted.error;
  }
  assert(
    sequentialCompleted.status === 0,
    `Python sequential smoke failed with exit ${String(sequentialCompleted.status)}\n${sequentialCompleted.stdout}\n${sequentialCompleted.stderr}`
  );

  const coroutineResult = projectPythonRuntimePlan(
    withPythonAsyncPolicy(sequentialUnit, {
      invocation: 'coroutine',
      awaitBeforeNext: true,
    }),
    capabilities
  );
  assert(
    coroutineResult.ok,
    'Python runtime plan should support coroutine when capability declares it.'
  );
  if (!coroutineResult.ok) {
    throw new Error('unreachable');
  }
  const coroutineArtifact = lowerPythonExecutableRuntime(
    coroutineResult.plan
  );
  const coroutineFile = join(
    dir,
    `coroutine_${coroutineArtifact.filename}`
  );
  writeFileSync(coroutineFile, coroutineArtifact.content, 'utf8');
  const coroutineRunner = join(dir, 'run_coroutine_smoke.py');
  writeFileSync(
    coroutineRunner,
    [
      'import importlib.util',
      'import pathlib',
      '',
      `module_path = pathlib.Path(${JSON.stringify(coroutineFile)})`,
      'spec = importlib.util.spec_from_file_location("logicir_runtime_coroutine", module_path)',
      'module = importlib.util.module_from_spec(spec)',
      'assert spec.loader is not None',
      'spec.loader.exec_module(module)',
      '',
      'async def decode(inputs, context):',
      '    return {"output": inputs["input"].strip()}',
      '',
      'async def normalize(inputs, context):',
      '    return {"output": inputs["input"].upper()}',
      '',
      'runtime = module.create_runtime({"implementations": {"decode": decode, "normalize": normalize}})',
      'outputs = runtime.invoke({"raw": "  logicir  "})',
      'assert outputs["normalized"] == "LOGICIR", outputs',
      '',
    ].join('\n'),
    'utf8'
  );
  const coroutineCompleted = spawnSync('python', [coroutineRunner], {
    encoding: 'utf8',
  });
  if (coroutineCompleted.error) {
    throw coroutineCompleted.error;
  }
  assert(
    coroutineCompleted.status === 0,
    `Python coroutine smoke failed with exit ${String(coroutineCompleted.status)}\n${coroutineCompleted.stdout}\n${coroutineCompleted.stderr}`
  );

  const generatorResult = projectPythonRuntimePlan(
    withPythonAsyncPolicy(sequentialUnit, {
      invocation: 'generator',
      awaitBeforeNext: true,
    }),
    capabilities
  );
  assert(
    generatorResult.ok,
    'Python runtime plan should support generator when capability declares it.'
  );
  if (!generatorResult.ok) {
    throw new Error('unreachable');
  }
  const generatorArtifact = lowerPythonExecutableRuntime(
    generatorResult.plan
  );
  const generatorFile = join(
    dir,
    `generator_${generatorArtifact.filename}`
  );
  writeFileSync(generatorFile, generatorArtifact.content, 'utf8');
  const generatorRunner = join(dir, 'run_generator_smoke.py');
  writeFileSync(
    generatorRunner,
    [
      'import importlib.util',
      'import pathlib',
      '',
      `module_path = pathlib.Path(${JSON.stringify(generatorFile)})`,
      'spec = importlib.util.spec_from_file_location("logicir_runtime_generator", module_path)',
      'module = importlib.util.module_from_spec(spec)',
      'assert spec.loader is not None',
      'spec.loader.exec_module(module)',
      '',
      'def decode(inputs, context):',
      '    yield {"output": inputs["input"].strip()}',
      '',
      'def normalize(inputs, context):',
      '    yield {"output": inputs["input"].upper()}',
      '',
      'runtime = module.create_runtime({"implementations": {"decode": decode, "normalize": normalize}})',
      'outputs = runtime.invoke({"raw": "  logicir  "})',
      'assert outputs["normalized"] == "LOGICIR", outputs',
      '',
    ].join('\n'),
    'utf8'
  );
  const generatorCompleted = spawnSync('python', [generatorRunner], {
    encoding: 'utf8',
  });
  if (generatorCompleted.error) {
    throw generatorCompleted.error;
  }
  assert(
    generatorCompleted.status === 0,
    `Python generator smoke failed with exit ${String(generatorCompleted.status)}\n${generatorCompleted.stdout}\n${generatorCompleted.stderr}`
  );

  const asyncGeneratorResult = projectPythonRuntimePlan(
    withPythonAsyncPolicy(sequentialUnit, {
      invocation: 'async-generator',
      awaitBeforeNext: true,
    }),
    capabilities
  );
  assert(
    asyncGeneratorResult.ok,
    'Python runtime plan should support async-generator when capability declares it.'
  );
  if (!asyncGeneratorResult.ok) {
    throw new Error('unreachable');
  }
  const asyncGeneratorArtifact = lowerPythonExecutableRuntime(
    asyncGeneratorResult.plan
  );
  const asyncGeneratorFile = join(
    dir,
    `async_generator_${asyncGeneratorArtifact.filename}`
  );
  writeFileSync(asyncGeneratorFile, asyncGeneratorArtifact.content, 'utf8');
  const asyncGeneratorRunner = join(dir, 'run_async_generator_smoke.py');
  writeFileSync(
    asyncGeneratorRunner,
    [
      'import importlib.util',
      'import pathlib',
      '',
      `module_path = pathlib.Path(${JSON.stringify(asyncGeneratorFile)})`,
      'spec = importlib.util.spec_from_file_location("logicir_runtime_async_generator", module_path)',
      'module = importlib.util.module_from_spec(spec)',
      'assert spec.loader is not None',
      'spec.loader.exec_module(module)',
      '',
      'async def decode(inputs, context):',
      '    yield {"output": inputs["input"].strip()}',
      '',
      'async def normalize(inputs, context):',
      '    yield {"output": inputs["input"].upper()}',
      '',
      'runtime = module.create_runtime({"implementations": {"decode": decode, "normalize": normalize}})',
      'outputs = runtime.invoke({"raw": "  logicir  "})',
      'assert outputs["normalized"] == "LOGICIR", outputs',
      '',
    ].join('\n'),
    'utf8'
  );
  const asyncGeneratorCompleted = spawnSync('python', [asyncGeneratorRunner], {
    encoding: 'utf8',
  });
  if (asyncGeneratorCompleted.error) {
    throw asyncGeneratorCompleted.error;
  }
  assert(
    asyncGeneratorCompleted.status === 0,
    `Python async-generator smoke failed with exit ${String(asyncGeneratorCompleted.status)}\n${asyncGeneratorCompleted.stdout}\n${asyncGeneratorCompleted.stderr}`
  );

  const threadpoolResult = projectPythonRuntimePlan(
    withPythonAsyncPolicy(sequentialUnit, {
      invocation: 'threadpool-call',
      awaitBeforeNext: true,
    }),
    capabilities
  );
  assert(
    threadpoolResult.ok,
    'Python runtime plan should support threadpool-call when capability declares it.'
  );
  if (!threadpoolResult.ok) {
    throw new Error('unreachable');
  }
  const threadpoolArtifact = lowerPythonExecutableRuntime(
    threadpoolResult.plan
  );
  const threadpoolFile = join(
    dir,
    `threadpool_${threadpoolArtifact.filename}`
  );
  writeFileSync(threadpoolFile, threadpoolArtifact.content, 'utf8');
  const threadpoolRunner = join(dir, 'run_threadpool_smoke.py');
  writeFileSync(
    threadpoolRunner,
    [
      'import importlib.util',
      'import pathlib',
      'import threading',
      '',
      `module_path = pathlib.Path(${JSON.stringify(threadpoolFile)})`,
      'spec = importlib.util.spec_from_file_location("logicir_runtime_threadpool", module_path)',
      'module = importlib.util.module_from_spec(spec)',
      'assert spec.loader is not None',
      'spec.loader.exec_module(module)',
      '',
      'main_thread = threading.get_ident()',
      'worker_threads = []',
      '',
      'def decode(inputs, context):',
      '    worker_threads.append(threading.get_ident())',
      '    return {"output": inputs["input"].strip()}',
      '',
      'def normalize(inputs, context):',
      '    worker_threads.append(threading.get_ident())',
      '    return {"output": inputs["input"].upper()}',
      '',
      'runtime = module.create_runtime({"implementations": {"decode": decode, "normalize": normalize}})',
      'outputs = runtime.invoke({"raw": "  logicir  "})',
      'assert outputs["normalized"] == "LOGICIR", outputs',
      'assert worker_threads and all(thread != main_thread for thread in worker_threads), worker_threads',
      '',
    ].join('\n'),
    'utf8'
  );
  const threadpoolCompleted = spawnSync('python', [threadpoolRunner], {
    encoding: 'utf8',
  });
  if (threadpoolCompleted.error) {
    throw threadpoolCompleted.error;
  }
  assert(
    threadpoolCompleted.status === 0,
    `Python threadpool smoke failed with exit ${String(threadpoolCompleted.status)}\n${threadpoolCompleted.stdout}\n${threadpoolCompleted.stderr}`
  );

  const unsupportedOrderingResult = projectPythonRuntimePlan(
    withPythonAsyncPolicy(sequentialUnit, {
      invocation: 'sync-call',
      awaitBeforeNext: false,
    }),
    capabilities
  );
  assert(
    !unsupportedOrderingResult.ok &&
      unsupportedOrderingResult.diagnostics.some(
        (diagnostic) => diagnostic.code === 'PY-004'
      ),
    'Python runtime planner should reject awaitBeforeNext=false before lowering.'
  );

  const staticDynamicResult = projectPythonRuntimePlan(
    withPythonDynamicFulfillmentPolicy(unit, {
      selector: { serviceKey: 'auth', unitKey: 'check' },
      binding: 'constructor-injected',
      consistency: 'startup-only',
    }),
    capabilities
  );
  assert(
    staticDynamicResult.ok,
    'Python runtime plan should support constructor-injected dynamic fulfillment.'
  );
  if (!staticDynamicResult.ok) {
    throw new Error('unreachable');
  }
  const staticDynamicArtifact = lowerPythonExecutableRuntime(
    staticDynamicResult.plan
  );
  const staticDynamicFile = join(
    dir,
    `static_dynamic_${staticDynamicArtifact.filename}`
  );
  writeFileSync(staticDynamicFile, staticDynamicArtifact.content, 'utf8');
  const staticDynamicRunner = join(dir, 'run_static_dynamic_smoke.py');
  writeFileSync(
    staticDynamicRunner,
    [
      'import importlib.util',
      'import pathlib',
      '',
      `module_path = pathlib.Path(${JSON.stringify(staticDynamicFile)})`,
      'spec = importlib.util.spec_from_file_location("logicir_runtime_static_dynamic", module_path)',
      'module = importlib.util.module_from_spec(spec)',
      'assert spec.loader is not None',
      'spec.loader.exec_module(module)',
      '',
      'def adder(inputs, context):',
      '    return {"sum": inputs["a"] + inputs["b"]}',
      '',
      'missing_runtime = module.create_runtime({"implementations": {"adder": adder}})',
      'try:',
      '    missing_runtime.invoke({"a": 2, "b": 5})',
      'except RuntimeError:',
      '    pass',
      'else:',
      '    raise AssertionError("Expected missing dynamic fulfillment evidence to fail")',
      '',
      'runtime = module.create_runtime({"fulfillments": {"auth": {"check": True}}, "implementations": {"adder": adder}})',
      'outputs = runtime.invoke({"a": 2, "b": 5})',
      'assert outputs["sum"] == 7, outputs',
      '',
    ].join('\n'),
    'utf8'
  );
  const staticDynamicCompleted = spawnSync('python', [staticDynamicRunner], {
    encoding: 'utf8',
  });
  if (staticDynamicCompleted.error) {
    throw staticDynamicCompleted.error;
  }
  assert(
    staticDynamicCompleted.status === 0,
    `Python static dynamic smoke failed with exit ${String(staticDynamicCompleted.status)}\n${staticDynamicCompleted.stdout}\n${staticDynamicCompleted.stderr}`
  );

  const requirementDynamicResult = projectPythonRuntimePlan(
    withPythonDynamicFulfillmentPolicy(
      withAuthRequirementPayloadTypes(childWithRequirementContractExample),
      {
        selector: { serviceKey: 'auth', unitKey: 'check' },
        binding: 'constructor-injected',
        consistency: 'startup-only',
      }
    ),
    capabilities
  );
  assert(
    requirementDynamicResult.ok,
    'Python runtime plan should support requirement-target LUI dynamic fulfillment.'
  );
  if (!requirementDynamicResult.ok) {
    throw new Error('unreachable');
  }
  const requirementDynamicArtifact = lowerPythonExecutableRuntime(
    requirementDynamicResult.plan
  );
  const requirementDynamicFile = join(
    dir,
    `requirement_dynamic_${requirementDynamicArtifact.filename}`
  );
  writeFileSync(requirementDynamicFile, requirementDynamicArtifact.content, 'utf8');
  const requirementDynamicRunner = join(
    dir,
    'run_requirement_dynamic_smoke.py'
  );
  writeFileSync(
    requirementDynamicRunner,
    [
      'import importlib.util',
      'import pathlib',
      '',
      `module_path = pathlib.Path(${JSON.stringify(requirementDynamicFile)})`,
      'spec = importlib.util.spec_from_file_location("logicir_runtime_requirement_dynamic", module_path)',
      'module = importlib.util.module_from_spec(spec)',
      'assert spec.loader is not None',
      'spec.loader.exec_module(module)',
      '',
      'def auth_check(inputs, context):',
      '    return {"allowed": inputs["subject"] == "admin"}',
      '',
      'runtime = module.create_runtime({"fulfillments": {"auth": {"check": auth_check}}})',
      'allowed = runtime.invoke({"subject": "admin"})',
      'denied = runtime.invoke({"subject": "guest"})',
      'assert allowed["allowed"] is True, allowed',
      'assert denied["allowed"] is False, denied',
      '',
    ].join('\n'),
    'utf8'
  );
  const requirementDynamicCompleted = spawnSync(
    'python',
    [requirementDynamicRunner],
    { encoding: 'utf8' }
  );
  if (requirementDynamicCompleted.error) {
    throw requirementDynamicCompleted.error;
  }
  assert(
    requirementDynamicCompleted.status === 0,
    `Python requirement dynamic smoke failed with exit ${String(requirementDynamicCompleted.status)}\n${requirementDynamicCompleted.stdout}\n${requirementDynamicCompleted.stderr}`
  );

  const lateBoundRequirementResult = projectPythonRuntimePlan(
    withPythonDynamicFulfillmentPolicy(
      withAuthRequirementPayloadTypes(childWithRequirementContractExample),
      {
        selector: { serviceKey: 'auth', unitKey: 'check' },
        binding: 'late-bound',
        consistency: 'task-local',
      }
    ),
    capabilities
  );
  assert(
    lateBoundRequirementResult.ok,
    'Python runtime plan should support late-bound requirement-target fulfillment.'
  );
  if (!lateBoundRequirementResult.ok) {
    throw new Error('unreachable');
  }
  const lateBoundRequirementArtifact = lowerPythonExecutableRuntime(
    lateBoundRequirementResult.plan
  );
  const lateBoundRequirementFile = join(
    dir,
    `late_bound_requirement_${lateBoundRequirementArtifact.filename}`
  );
  writeFileSync(
    lateBoundRequirementFile,
    lateBoundRequirementArtifact.content,
    'utf8'
  );
  const lateBoundRequirementRunner = join(
    dir,
    'run_late_bound_requirement_smoke.py'
  );
  writeFileSync(
    lateBoundRequirementRunner,
    [
      'import importlib.util',
      'import pathlib',
      '',
      `module_path = pathlib.Path(${JSON.stringify(lateBoundRequirementFile)})`,
      'spec = importlib.util.spec_from_file_location("logicir_runtime_late_bound_requirement", module_path)',
      'module = importlib.util.module_from_spec(spec)',
      'assert spec.loader is not None',
      'spec.loader.exec_module(module)',
      '',
      'allow_all = False',
      '',
      'def fulfillment_resolver(selector):',
      '    assert selector["serviceKey"] == "auth", selector',
      '    assert selector["unitKey"] == "check", selector',
      '    def auth_check(inputs, context):',
      '        return {"allowed": allow_all or inputs["subject"] == "admin"}',
      '    return auth_check',
      '',
      'runtime = module.create_runtime({"fulfillments": fulfillment_resolver})',
      'first = runtime.invoke({"subject": "guest"})',
      'allow_all = True',
      'second = runtime.invoke({"subject": "guest"})',
      'assert first["allowed"] is False, first',
      'assert second["allowed"] is True, second',
      '',
    ].join('\n'),
    'utf8'
  );
  const lateBoundRequirementCompleted = spawnSync(
    'python',
    [lateBoundRequirementRunner],
    { encoding: 'utf8' }
  );
  if (lateBoundRequirementCompleted.error) {
    throw lateBoundRequirementCompleted.error;
  }
  assert(
    lateBoundRequirementCompleted.status === 0,
    `Python late-bound requirement smoke failed with exit ${String(lateBoundRequirementCompleted.status)}\n${lateBoundRequirementCompleted.stdout}\n${lateBoundRequirementCompleted.stderr}`
  );

  const switchableRequirementResult = projectPythonRuntimePlan(
    withPythonDynamicFulfillmentPolicy(
      withAuthRequirementPayloadTypes(childWithRequirementContractExample),
      {
        selector: { serviceKey: 'auth', unitKey: 'check' },
        binding: 'switchable',
        consistency: 'quiescent-switch',
      }
    ),
    capabilities
  );
  assert(
    switchableRequirementResult.ok,
    'Python runtime plan should support switchable fulfillment at quiescent invocation boundaries.'
  );
  if (!switchableRequirementResult.ok) {
    throw new Error('unreachable');
  }
  const switchableRequirementArtifact = lowerPythonExecutableRuntime(
    switchableRequirementResult.plan
  );
  const switchableRequirementFile = join(
    dir,
    `switchable_requirement_${switchableRequirementArtifact.filename}`
  );
  writeFileSync(
    switchableRequirementFile,
    switchableRequirementArtifact.content,
    'utf8'
  );
  const switchableRequirementRunner = join(
    dir,
    'run_switchable_requirement_smoke.py'
  );
  writeFileSync(
    switchableRequirementRunner,
    [
      'import importlib.util',
      'import pathlib',
      '',
      `module_path = pathlib.Path(${JSON.stringify(switchableRequirementFile)})`,
      'spec = importlib.util.spec_from_file_location("logicir_runtime_switchable_requirement", module_path)',
      'module = importlib.util.module_from_spec(spec)',
      'assert spec.loader is not None',
      'spec.loader.exec_module(module)',
      '',
      'active_rule = "admin-only"',
      '',
      'class Fulfillments:',
      '    def resolve(self, selector):',
      '        assert selector["serviceKey"] == "auth", selector',
      '        assert selector["unitKey"] == "check", selector',
      '        def auth_check(inputs, context):',
      '            return {"allowed": active_rule == "allow-all" or inputs["subject"] == "admin"}',
      '        return auth_check',
      '',
      'runtime = module.create_runtime({"fulfillments": Fulfillments()})',
      'first = runtime.invoke({"subject": "guest"})',
      'active_rule = "allow-all"',
      'second = runtime.invoke({"subject": "guest"})',
      'assert first["allowed"] is False, first',
      'assert second["allowed"] is True, second',
      '',
    ].join('\n'),
    'utf8'
  );
  const switchableRequirementCompleted = spawnSync(
    'python',
    [switchableRequirementRunner],
    { encoding: 'utf8' }
  );
  if (switchableRequirementCompleted.error) {
    throw switchableRequirementCompleted.error;
  }
  assert(
    switchableRequirementCompleted.status === 0,
    `Python switchable requirement smoke failed with exit ${String(switchableRequirementCompleted.status)}\n${switchableRequirementCompleted.stdout}\n${switchableRequirementCompleted.stderr}`
  );

  const transactionalRequirementResult = projectPythonRuntimePlan(
    withPythonDynamicFulfillmentPolicy(
      withDuplicatedAuthCheckLUI(
        withAuthRequirementPayloadTypes(childWithRequirementContractExample)
      ),
      {
        selector: { serviceKey: 'auth', unitKey: 'check' },
        binding: 'switchable',
        consistency: 'transactional-switch',
      }
    ),
    capabilities
  );
  assert(
    transactionalRequirementResult.ok,
    'Python runtime plan should support transactional switchable fulfillment with per-invocation supplier snapshots.'
  );
  if (!transactionalRequirementResult.ok) {
    throw new Error('unreachable');
  }
  const transactionalRequirementArtifact = lowerPythonExecutableRuntime(
    transactionalRequirementResult.plan
  );
  const transactionalRequirementFile = join(
    dir,
    `transactional_requirement_${transactionalRequirementArtifact.filename}`
  );
  writeFileSync(
    transactionalRequirementFile,
    transactionalRequirementArtifact.content,
    'utf8'
  );
  const transactionalRequirementRunner = join(
    dir,
    'run_transactional_requirement_smoke.py'
  );
  writeFileSync(
    transactionalRequirementRunner,
    [
      'import importlib.util',
      'import pathlib',
      '',
      `module_path = pathlib.Path(${JSON.stringify(transactionalRequirementFile)})`,
      'spec = importlib.util.spec_from_file_location("logicir_runtime_transactional_requirement", module_path)',
      'module = importlib.util.module_from_spec(spec)',
      'assert spec.loader is not None',
      'spec.loader.exec_module(module)',
      '',
      'resolve_count = 0',
      '',
      'class Fulfillments:',
      '    def resolve(self, selector):',
      '        global resolve_count',
      '        assert selector["serviceKey"] == "auth", selector',
      '        assert selector["unitKey"] == "check", selector',
      '        resolve_count += 1',
      '        allowed = resolve_count == 1',
      '        def auth_check(inputs, context):',
      '            return {"allowed": allowed}',
      '        return auth_check',
      '',
      'runtime = module.create_runtime({"fulfillments": Fulfillments()})',
      'outputs = runtime.invoke({"subject": "guest"})',
      'assert outputs["allowed"] is True, outputs',
      'assert resolve_count == 1, resolve_count',
      '',
    ].join('\n'),
    'utf8'
  );
  const transactionalRequirementCompleted = spawnSync(
    'python',
    [transactionalRequirementRunner],
    { encoding: 'utf8' }
  );
  if (transactionalRequirementCompleted.error) {
    throw transactionalRequirementCompleted.error;
  }
  assert(
    transactionalRequirementCompleted.status === 0,
    `Python transactional requirement smoke failed with exit ${String(transactionalRequirementCompleted.status)}\n${transactionalRequirementCompleted.stdout}\n${transactionalRequirementCompleted.stderr}`
  );

  const retainedPropertyUnit = withPythonRetainedCurrentPolicy(
    statefulRetainedCounterExample,
    {
      realization: 'source-property',
      notification: 'callback',
    }
  );
  const retainedPropertyResult = projectPythonRuntimePlan(
    withStatefulCounterPayloadTypes(retainedPropertyUnit),
    capabilities
  );
  assert(
    retainedPropertyResult.ok,
    'Python runtime plan should support source-property retained-current.'
  );
  if (!retainedPropertyResult.ok) {
    throw new Error('unreachable');
  }
  const retainedPropertyArtifact = lowerPythonExecutableRuntime(
    retainedPropertyResult.plan
  );
  const retainedPropertyFile = join(
    dir,
    `retained_property_${retainedPropertyArtifact.filename}`
  );
  writeFileSync(retainedPropertyFile, retainedPropertyArtifact.content, 'utf8');
  const retainedPropertyRunner = join(dir, 'run_retained_property_smoke.py');
  writeFileSync(
    retainedPropertyRunner,
    [
      'import importlib.util',
      'import pathlib',
      '',
      `module_path = pathlib.Path(${JSON.stringify(retainedPropertyFile)})`,
      'spec = importlib.util.spec_from_file_location("logicir_runtime_retained_property", module_path)',
      'module = importlib.util.module_from_spec(spec)',
      'assert spec.loader is not None',
      'spec.loader.exec_module(module)',
      '',
      'count = 0',
      'def counter_state(inputs, context):',
      '    global count',
      '    count += inputs.get("increment", 0)',
      '    return {"value": count}',
      '',
      'runtime = module.create_runtime({"implementations": {"counterState": counter_state}})',
      'first = runtime.invoke({"increment": 4})',
      'second = runtime.invoke({})',
      'assert first["value"] == 4, first',
      'assert second["value"] == 4, second',
      '',
    ].join('\n'),
    'utf8'
  );
  const retainedPropertyCompleted = spawnSync(
    'python',
    [retainedPropertyRunner],
    { encoding: 'utf8' }
  );
  if (retainedPropertyCompleted.error) {
    throw retainedPropertyCompleted.error;
  }
  assert(
    retainedPropertyCompleted.status === 0,
    `Python retained-current source-property smoke failed with exit ${String(retainedPropertyCompleted.status)}\n${retainedPropertyCompleted.stdout}\n${retainedPropertyCompleted.stderr}`
  );

  const retainedQueueResult = projectPythonRuntimePlan(
    withPythonRetainedCurrentPolicy(
      withStatefulCounterPayloadTypes(statefulRetainedCounterExample),
      {
        realization: 'asyncio-queue-latest',
        notification: 'queue',
      }
    ),
    capabilities
  );
  assert(
    retainedQueueResult.ok,
    'Python runtime plan should support asyncio-queue-latest retained-current realization.'
  );
  if (!retainedQueueResult.ok) {
    throw new Error('unreachable');
  }
  const retainedQueueArtifact = lowerPythonExecutableRuntime(
    retainedQueueResult.plan
  );
  const retainedQueueFile = join(
    dir,
    `retained_queue_${retainedQueueArtifact.filename}`
  );
  writeFileSync(retainedQueueFile, retainedQueueArtifact.content, 'utf8');
  const retainedQueueRunner = join(dir, 'run_retained_queue_smoke.py');
  writeFileSync(
    retainedQueueRunner,
    [
      'import asyncio',
      'import importlib.util',
      'import pathlib',
      '',
      `module_path = pathlib.Path(${JSON.stringify(retainedQueueFile)})`,
      'spec = importlib.util.spec_from_file_location("logicir_runtime_retained_queue", module_path)',
      'module = importlib.util.module_from_spec(spec)',
      'assert spec.loader is not None',
      'spec.loader.exec_module(module)',
      '',
      'queue = asyncio.Queue()',
      'queue.put_nowait(10)',
      'queue.put_nowait(41)',
      '',
      'def counter_state(inputs, context):',
      '    current = context["retainedCurrent"].get("value", 0)',
      '    return {"value": current + inputs.get("increment", 0)}',
      '',
      'runtime = module.create_runtime({',
      '    "implementations": {"counterState": counter_state},',
      '    "retainedCurrent": {"lui:counterState:value:": queue},',
      '})',
      'first = runtime.invoke({})',
      'second = runtime.invoke({"increment": 1})',
      'assert first["value"] == 41, first',
      'assert second["value"] == 42, second',
      '',
    ].join('\n'),
    'utf8'
  );
  const retainedQueueCompleted = spawnSync(
    'python',
    [retainedQueueRunner],
    { encoding: 'utf8' }
  );
  if (retainedQueueCompleted.error) {
    throw retainedQueueCompleted.error;
  }
  assert(
    retainedQueueCompleted.status === 0,
    `Python retained-current asyncio-queue-latest smoke failed with exit ${String(retainedQueueCompleted.status)}\n${retainedQueueCompleted.stdout}\n${retainedQueueCompleted.stderr}`
  );

  const retainedObservableResult = projectPythonRuntimePlan(
    withPythonRetainedCurrentPolicy(
      withStatefulCounterPayloadTypes(statefulRetainedCounterExample),
      {
        realization: 'observable',
        notification: 'callback',
      }
    ),
    capabilities
  );
  assert(
    retainedObservableResult.ok,
    'Python runtime plan should support observable callback retained-current realization.'
  );
  if (!retainedObservableResult.ok) {
    throw new Error('unreachable');
  }
  const retainedObservableArtifact = lowerPythonExecutableRuntime(
    retainedObservableResult.plan
  );
  const retainedObservableFile = join(
    dir,
    `retained_observable_${retainedObservableArtifact.filename}`
  );
  writeFileSync(
    retainedObservableFile,
    retainedObservableArtifact.content,
    'utf8'
  );
  const retainedObservableRunner = join(
    dir,
    'run_retained_observable_smoke.py'
  );
  writeFileSync(
    retainedObservableRunner,
    [
      'import importlib.util',
      'import pathlib',
      '',
      `module_path = pathlib.Path(${JSON.stringify(retainedObservableFile)})`,
      'spec = importlib.util.spec_from_file_location("logicir_runtime_retained_observable", module_path)',
      'module = importlib.util.module_from_spec(spec)',
      'assert spec.loader is not None',
      'spec.loader.exec_module(module)',
      '',
      'class Observable:',
      '    def __init__(self, value):',
      '        self.current = value',
      '        self.listeners = []',
      '        self.subscribed = 0',
      '        self.unsubscribed = 0',
      '        self.delivered = 0',
      '    def subscribe(self, listener):',
      '        self.subscribed += 1',
      '        self.listeners.append(listener)',
      '        def unsubscribe():',
      '            self.unsubscribed += 1',
      '            if listener in self.listeners:',
      '                self.listeners.remove(listener)',
      '        return unsubscribe',
      '',
      '    def publish(self, value):',
      '        self.current = value',
      '        for listener in list(self.listeners):',
      '            self.delivered += 1',
      '            listener(value)',
      '',
      'observable = Observable(5)',
      '',
      'def counter_state(inputs, context):',
      '    current = context["retainedCurrent"].get("value", 0)',
      '    return {"value": current + inputs.get("increment", 0)}',
      '',
      'runtime = module.create_runtime({',
      '    "implementations": {"counterState": counter_state},',
      '    "retainedCurrent": {"lui:counterState:value:": observable},',
      '})',
      'first = runtime.invoke({})',
      'observable.publish(9)',
      'second = runtime.invoke({})',
      'runtime.dispose()',
      'observable.publish(13)',
      'assert first["value"] == 5, first',
      'assert second["value"] == 9, second',
      'assert observable.subscribed == 1, observable.subscribed',
      'assert observable.unsubscribed == 1, observable.unsubscribed',
      'assert observable.delivered == 1, observable.delivered',
      '',
    ].join('\n'),
    'utf8'
  );
  const retainedObservableCompleted = spawnSync(
    'python',
    [retainedObservableRunner],
    { encoding: 'utf8' }
  );
  if (retainedObservableCompleted.error) {
    throw retainedObservableCompleted.error;
  }
  assert(
    retainedObservableCompleted.status === 0,
    `Python retained-current observable callback smoke failed with exit ${String(retainedObservableCompleted.status)}\n${retainedObservableCompleted.stdout}\n${retainedObservableCompleted.stderr}`
  );

  const retainedPathObservableResult = projectPythonRuntimePlan(
    withPythonLUIRetainedCurrentPolicy(
      withStatefulCounterVectorPayloadTypes(statefulRetainedCounterExample),
      'counterState',
      'value',
      {
        selector: { portKey: 'value', payloadPath: ['lanes', 0] },
        realization: 'observable',
        notification: 'callback',
      }
    ),
    capabilities
  );
  assert(
    retainedPathObservableResult.ok,
    'Python runtime plan should support payloadPath-scoped observable retained-current realization.'
  );
  if (!retainedPathObservableResult.ok) {
    throw new Error('unreachable');
  }
  const retainedPathObservableArtifact = lowerPythonExecutableRuntime(
    retainedPathObservableResult.plan
  );
  const retainedPathObservableFile = join(
    dir,
    `retained_path_observable_${retainedPathObservableArtifact.filename}`
  );
  writeFileSync(
    retainedPathObservableFile,
    retainedPathObservableArtifact.content,
    'utf8'
  );
  const retainedPathObservableRunner = join(
    dir,
    'run_retained_path_observable_smoke.py'
  );
  writeFileSync(
    retainedPathObservableRunner,
    [
      'import importlib.util',
      'import pathlib',
      '',
      `module_path = pathlib.Path(${JSON.stringify(retainedPathObservableFile)})`,
      'spec = importlib.util.spec_from_file_location("logicir_runtime_retained_path_observable", module_path)',
      'module = importlib.util.module_from_spec(spec)',
      'assert spec.loader is not None',
      'spec.loader.exec_module(module)',
      '',
      'class Observable:',
      '    def __init__(self, value):',
      '        self.listeners = []',
      '        self.subscribed = 0',
      '        self.delivered = 0',
      '    def subscribe(self, listener):',
      '        self.subscribed += 1',
      '        self.listeners.append(listener)',
      '        def unsubscribe():',
      '            if listener in self.listeners:',
      '                self.listeners.remove(listener)',
      '        return unsubscribe',
      '',
      '    def publish(self, value):',
      '        for listener in list(self.listeners):',
      '            self.delivered += 1',
      '            listener(value)',
      '',
      'class RootSource:',
      '    def __init__(self):',
      '        self.subscribed = 0',
      '',
      '    def subscribe(self, listener):',
      '        self.subscribed += 1',
      '        raise AssertionError("whole retained port should not be subscribed by payloadPath policy")',
      '',
      'observable = Observable(4)',
      'root_source = RootSource()',
      '',
      'def counter_state(inputs, context):',
      '    current = context["retainedCurrent"].get("value", {}).get("lanes", [0])[0]',
      '    return {"value": {"lanes": [current + inputs.get("increment", 0)]}}',
      '',
      'runtime = module.create_runtime({',
      '    "implementations": {"counterState": counter_state},',
      '    "retainedCurrent": {',
      '        "lui:counterState:value:": root_source,',
      '        "lui:counterState:value:lanes/0": observable,',
      '    },',
      '})',
      'first = runtime.invoke({})',
      'observable.publish(9)',
      'second = runtime.invoke({"increment": 1})',
      'third = runtime.invoke({})',
      'runtime.dispose()',
      'assert first["value"]["lanes"][0] == 0, first',
      'assert second["value"]["lanes"][0] == 10, second',
      'assert third["value"]["lanes"][0] == 10, third',
      'assert observable.subscribed == 1, observable.subscribed',
      'assert observable.delivered == 1, observable.delivered',
      'assert root_source.subscribed == 0, root_source.subscribed',
      '',
    ].join('\n'),
    'utf8'
  );
  const retainedPathObservableCompleted = spawnSync(
    'python',
    [retainedPathObservableRunner],
    { encoding: 'utf8' }
  );
  if (retainedPathObservableCompleted.error) {
    throw retainedPathObservableCompleted.error;
  }
  assert(
    retainedPathObservableCompleted.status === 0,
    `Python payloadPath retained-current observable smoke failed with exit ${String(retainedPathObservableCompleted.status)}\n${retainedPathObservableCompleted.stdout}\n${retainedPathObservableCompleted.stderr}`
  );

  const explicitOwnerRetainedPathResult = projectPythonRuntimePlan(
    withPythonRetainedCurrentPolicy(
      withStatefulCounterVectorPayloadTypes(statefulRetainedCounterExample),
      {
        selector: {
          luiId: 'counterState',
          portKey: 'value',
          payloadPath: ['lanes', 0],
        },
        realization: 'observable',
        notification: 'callback',
      }
    ),
    capabilities
  );
  assert(
    explicitOwnerRetainedPathResult.ok,
    'Python runtime plan should support core-level explicit LUI retained-current payloadPath selector.'
  );
  if (!explicitOwnerRetainedPathResult.ok) {
    throw new Error('unreachable');
  }
  const explicitOwnerRetainedPathArtifact = lowerPythonExecutableRuntime(
    explicitOwnerRetainedPathResult.plan
  );
  const explicitOwnerRetainedPathFile = join(
    dir,
    `explicit_owner_retained_path_${explicitOwnerRetainedPathArtifact.filename}`
  );
  writeFileSync(
    explicitOwnerRetainedPathFile,
    explicitOwnerRetainedPathArtifact.content,
    'utf8'
  );
  const explicitOwnerRetainedPathRunner = join(
    dir,
    'run_explicit_owner_retained_path_smoke.py'
  );
  writeFileSync(
    explicitOwnerRetainedPathRunner,
    [
      'import importlib.util',
      'import pathlib',
      '',
      `module_path = pathlib.Path(${JSON.stringify(explicitOwnerRetainedPathFile)})`,
      'spec = importlib.util.spec_from_file_location("logicir_runtime_explicit_owner_retained_path", module_path)',
      'module = importlib.util.module_from_spec(spec)',
      'assert spec.loader is not None',
      'spec.loader.exec_module(module)',
      '',
      'class Observable:',
      '    def __init__(self):',
      '        self.listeners = []',
      '        self.subscribed = 0',
      '    def subscribe(self, listener):',
      '        self.subscribed += 1',
      '        self.listeners.append(listener)',
      '        def unsubscribe():',
      '            if listener in self.listeners:',
      '                self.listeners.remove(listener)',
      '        return unsubscribe',
      '    def publish(self, value):',
      '        for listener in list(self.listeners):',
      '            listener(value)',
      '',
      'observable = Observable()',
      '',
      'def counter_state(inputs, context):',
      '    current = context["retainedCurrent"].get("value", {}).get("lanes", [0])[0]',
      '    return {"value": {"lanes": [current + inputs.get("increment", 0)]}}',
      '',
      'runtime = module.create_runtime({',
      '    "implementations": {"counterState": counter_state},',
      '    "retainedCurrent": {',
      '        "lui:counterState:value:lanes/0": observable,',
      '    },',
      '})',
      'first = runtime.invoke({})',
      'observable.publish(6)',
      'second = runtime.invoke({"increment": 2})',
      'runtime.dispose()',
      'assert first["value"]["lanes"][0] == 0, first',
      'assert second["value"]["lanes"][0] == 8, second',
      'assert observable.subscribed == 1, observable.subscribed',
      '',
    ].join('\n'),
    'utf8'
  );
  const explicitOwnerRetainedPathCompleted = spawnSync(
    'python',
    [explicitOwnerRetainedPathRunner],
    { encoding: 'utf8' }
  );
  if (explicitOwnerRetainedPathCompleted.error) {
    throw explicitOwnerRetainedPathCompleted.error;
  }
  assert(
    explicitOwnerRetainedPathCompleted.status === 0,
    `Python explicit-owner payloadPath retained-current observable smoke failed with exit ${String(explicitOwnerRetainedPathCompleted.status)}\n${explicitOwnerRetainedPathCompleted.stdout}\n${explicitOwnerRetainedPathCompleted.stderr}`
  );

  const retainedPollResult = projectPythonRuntimePlan(
    withPythonRetainedCurrentPolicy(
      withStatefulCounterPayloadTypes(statefulRetainedCounterExample),
      {
        realization: 'observable',
        notification: 'poll',
      }
    ),
    capabilities
  );
  assert(
    retainedPollResult.ok,
    'Python runtime plan should support observable poll retained-current realization.'
  );
  if (!retainedPollResult.ok) {
    throw new Error('unreachable');
  }
  const retainedPollArtifact = lowerPythonExecutableRuntime(
    retainedPollResult.plan
  );
  const retainedPollFile = join(
    dir,
    `retained_poll_${retainedPollArtifact.filename}`
  );
  writeFileSync(retainedPollFile, retainedPollArtifact.content, 'utf8');
  const retainedPollRunner = join(dir, 'run_retained_poll_smoke.py');
  writeFileSync(
    retainedPollRunner,
    [
      'import importlib.util',
      'import pathlib',
      '',
      `module_path = pathlib.Path(${JSON.stringify(retainedPollFile)})`,
      'spec = importlib.util.spec_from_file_location("logicir_runtime_retained_poll", module_path)',
      'module = importlib.util.module_from_spec(spec)',
      'assert spec.loader is not None',
      'spec.loader.exec_module(module)',
      '',
      'class PollSource:',
      '    def __init__(self, value):',
      '        self.current = value',
      '        self.snapshots = 0',
      '        self.subscribed = 0',
      '',
      '    def get_snapshot(self):',
      '        self.snapshots += 1',
      '        return self.current',
      '',
      '    def subscribe(self, listener):',
      '        self.subscribed += 1',
      '        raise AssertionError("poll retained-current source must not subscribe")',
      '',
      'source = PollSource(5)',
      '',
      'def counter_state(inputs, context):',
      '    current = context["retainedCurrent"].get("value", 0)',
      '    return {"value": current + inputs.get("increment", 0)}',
      '',
      'runtime = module.create_runtime({',
      '    "implementations": {"counterState": counter_state},',
      '    "retainedCurrent": {"lui:counterState:value:": source},',
      '})',
      'first = runtime.invoke({})',
      'source.current = 11',
      'second = runtime.invoke({})',
      'runtime.dispose()',
      'assert first["value"] == 5, first',
      'assert second["value"] == 11, second',
      'assert source.subscribed == 0, source.subscribed',
      'assert source.snapshots >= 2, source.snapshots',
      '',
    ].join('\n'),
    'utf8'
  );
  const retainedPollCompleted = spawnSync(
    'python',
    [retainedPollRunner],
    { encoding: 'utf8' }
  );
  if (retainedPollCompleted.error) {
    throw retainedPollCompleted.error;
  }
  assert(
    retainedPollCompleted.status === 0,
    `Python retained-current observable poll smoke failed with exit ${String(retainedPollCompleted.status)}\n${retainedPollCompleted.stdout}\n${retainedPollCompleted.stderr}`
  );

  const adapterRetainedUnit = withPythonRetainedCurrentPolicy(
    withStatefulCounterPayloadTypes(statefulRetainedCounterExample),
    {
      realization: 'projector-adapter',
      notification: 'poll',
    }
  );
  const adapterRetainedResult = projectPythonRuntimePlan(
    adapterRetainedUnit,
    capabilities
  );
  assert(
    adapterRetainedResult.ok,
    'Python runtime plan should support projector-adapter retained-current.'
  );
  if (!adapterRetainedResult.ok) {
    throw new Error('unreachable');
  }
  const adapterRetainedArtifact = lowerPythonExecutableRuntime(
    adapterRetainedResult.plan
  );
  const adapterRetainedFile = join(
    dir,
    `adapter_retained_${adapterRetainedArtifact.filename}`
  );
  writeFileSync(adapterRetainedFile, adapterRetainedArtifact.content, 'utf8');
  const adapterRetainedRunner = join(dir, 'run_adapter_retained_smoke.py');
  writeFileSync(
    adapterRetainedRunner,
    [
      'import importlib.util',
      'import pathlib',
      '',
      `module_path = pathlib.Path(${JSON.stringify(adapterRetainedFile)})`,
      'spec = importlib.util.spec_from_file_location("logicir_runtime_adapter_retained", module_path)',
      'module = importlib.util.module_from_spec(spec)',
      'assert spec.loader is not None',
      'spec.loader.exec_module(module)',
      '',
      'def counter_state(inputs, context):',
      '    current = context["retainedCurrent"].get("value", 0)',
      '    return {"value": current + inputs.get("increment", 0)}',
      '',
      'runtime = module.create_runtime({"implementations": {"counterState": counter_state}})',
      'first = runtime.invoke({"increment": 7})',
      'second = runtime.invoke({})',
      'assert first["value"] == 7, first',
      'assert second["value"] == 7, second',
      '',
    ].join('\n'),
    'utf8'
  );
  const adapterRetainedCompleted = spawnSync(
    'python',
    [adapterRetainedRunner],
    { encoding: 'utf8' }
  );
  if (adapterRetainedCompleted.error) {
    throw adapterRetainedCompleted.error;
  }
  assert(
    adapterRetainedCompleted.status === 0,
    `Python retained-current projector-adapter smoke failed with exit ${String(adapterRetainedCompleted.status)}\n${adapterRetainedCompleted.stdout}\n${adapterRetainedCompleted.stderr}`
  );

  const ownerlessPathRetainedResult = projectPythonRuntimePlan(
    withPythonRetainedCurrentPolicy(
      withStatefulCounterVectorPayloadTypes(statefulRetainedCounterExample),
      {
        selector: { portKey: 'value', payloadPath: ['lanes', 0] },
        realization: 'observable',
        notification: 'callback',
      }
    ),
    capabilities
  );
  assert(
    !ownerlessPathRetainedResult.ok &&
      ownerlessPathRetainedResult.diagnostics.some(
        (diagnostic) => diagnostic.code === 'PY-008'
      ),
    'Python runtime planner should reject payloadPath retained-current policies without a concrete port attachment.'
  );

  const raiseErrorResult = projectPythonRuntimePlan(
    withPythonErrorPolicy(unit, {
      selector: { luiId: 'adder' },
      onException: 'raise',
    }),
    capabilities
  );
  assert(
    raiseErrorResult.ok,
    'Python runtime plan should support required raise error policy.'
  );
  if (!raiseErrorResult.ok) {
    throw new Error('unreachable');
  }
  const raiseErrorArtifact = lowerPythonExecutableRuntime(
    raiseErrorResult.plan
  );
  const raiseErrorFile = join(dir, `raise_error_${raiseErrorArtifact.filename}`);
  writeFileSync(raiseErrorFile, raiseErrorArtifact.content, 'utf8');
  const raiseErrorRunner = join(dir, 'run_raise_error_smoke.py');
  writeFileSync(
    raiseErrorRunner,
    [
      'import importlib.util',
      'import pathlib',
      '',
      `module_path = pathlib.Path(${JSON.stringify(raiseErrorFile)})`,
      'spec = importlib.util.spec_from_file_location("logicir_runtime_raise_error", module_path)',
      'module = importlib.util.module_from_spec(spec)',
      'assert spec.loader is not None',
      'spec.loader.exec_module(module)',
      '',
      'def adder(inputs, context):',
      '    raise ValueError("boom")',
      '',
      'runtime = module.create_runtime({"implementations": {"adder": adder}})',
      'try:',
      '    runtime.invoke({"a": 2, "b": 5})',
      'except ValueError:',
      '    pass',
      'else:',
      '    raise AssertionError("Expected raise error policy to propagate implementation error")',
      '',
    ].join('\n'),
    'utf8'
  );
  const raiseErrorCompleted = spawnSync('python', [raiseErrorRunner], {
    encoding: 'utf8',
  });
  if (raiseErrorCompleted.error) {
    throw raiseErrorCompleted.error;
  }
  assert(
    raiseErrorCompleted.status === 0,
    `Python raise error smoke failed with exit ${String(raiseErrorCompleted.status)}\n${raiseErrorCompleted.stdout}\n${raiseErrorCompleted.stderr}`
  );

  const useErrorPortResult = projectPythonRuntimePlan(
    withPythonErrorPolicy(withPythonErrorPort(unit), {
      selector: { luiId: 'adder', portKey: 'error' },
      onException: 'use-error-port',
    }),
    capabilities
  );
  assert(
    useErrorPortResult.ok,
    'Python runtime plan should still be created when capability supports use-error-port.'
  );
  if (!useErrorPortResult.ok) {
    throw new Error('unreachable');
  }
  const useErrorPortArtifact = lowerPythonExecutableRuntime(
    useErrorPortResult.plan
  );
  const useErrorPortFile = join(
    dir,
    `use_error_port_${useErrorPortArtifact.filename}`
  );
  writeFileSync(useErrorPortFile, useErrorPortArtifact.content, 'utf8');
  const useErrorPortRunner = join(dir, 'run_use_error_port_smoke.py');
  writeFileSync(
    useErrorPortRunner,
    [
      'import importlib.util',
      'import pathlib',
      '',
      `module_path = pathlib.Path(${JSON.stringify(useErrorPortFile)})`,
      'spec = importlib.util.spec_from_file_location("logicir_runtime_use_error_port", module_path)',
      'module = importlib.util.module_from_spec(spec)',
      'assert spec.loader is not None',
      'spec.loader.exec_module(module)',
      '',
      'def adder(inputs, context):',
      '    raise LookupError("boom")',
      '',
      'runtime = module.create_runtime({"implementations": {"adder": adder}})',
      'outputs = runtime.invoke({"a": 2, "b": 5})',
      'assert outputs["error"]["name"] == "LookupError", outputs',
      'assert outputs["error"]["message"] == "boom", outputs',
      '',
    ].join('\n'),
    'utf8'
  );
  const useErrorPortCompleted = spawnSync(
    'python',
    [useErrorPortRunner],
    { encoding: 'utf8' }
  );
  if (useErrorPortCompleted.error) {
    throw useErrorPortCompleted.error;
  }
  assert(
    useErrorPortCompleted.status === 0,
    `Python use-error-port smoke failed with exit ${String(useErrorPortCompleted.status)}\n${useErrorPortCompleted.stdout}\n${useErrorPortCompleted.stderr}`
  );

  const invalidUseErrorPortResult = projectPythonRuntimePlan(
    withPythonErrorPolicy(withPythonErrorPort(unit), {
      selector: { luiId: 'adder' },
      onException: 'use-error-port',
    }),
    capabilities
  );
  assert(
    !invalidUseErrorPortResult.ok &&
      invalidUseErrorPortResult.diagnostics.some(
        (diagnostic) => diagnostic.code === 'PY-007'
      ),
    'Python runtime planner should reject use-error-port without selector.portKey before lowering.'
  );

  const emitErrorResult = projectPythonRuntimePlan(
    withPythonErrorPolicy(unit, {
      selector: { luiId: 'adder' },
      onException: 'emit-error',
    }),
    capabilities
  );
  assert(
    emitErrorResult.ok,
    'Python runtime plan should still be created when capability supports emit-error.'
  );
  if (!emitErrorResult.ok) {
    throw new Error('unreachable');
  }
  const emitErrorArtifact = lowerPythonExecutableRuntime(
    emitErrorResult.plan
  );
  const emitErrorFile = join(
    dir,
    `emit_error_${emitErrorArtifact.filename}`
  );
  writeFileSync(emitErrorFile, emitErrorArtifact.content, 'utf8');
  const emitErrorRunner = join(dir, 'run_emit_error_smoke.py');
  writeFileSync(
    emitErrorRunner,
    [
      'import importlib.util',
      'import pathlib',
      '',
      `module_path = pathlib.Path(${JSON.stringify(emitErrorFile)})`,
      'spec = importlib.util.spec_from_file_location("logicir_runtime_emit_error", module_path)',
      'module = importlib.util.module_from_spec(spec)',
      'assert spec.loader is not None',
      'spec.loader.exec_module(module)',
      '',
      'events = []',
      'def adder(inputs, context):',
      '    raise OverflowError("emit me")',
      '',
      'runtime = module.create_runtime({"implementations": {"adder": adder}, "emit_error": events.append})',
      'outputs = runtime.invoke({"a": 2, "b": 5})',
      'assert outputs == {}, outputs',
      'assert len(events) == 1, events',
      'assert events[0]["error"]["name"] == "OverflowError", events',
      'assert events[0]["error"]["message"] == "emit me", events',
      '',
    ].join('\n'),
    'utf8'
  );
  const emitErrorCompleted = spawnSync(
    'python',
    [emitErrorRunner],
    { encoding: 'utf8' }
  );
  if (emitErrorCompleted.error) {
    throw emitErrorCompleted.error;
  }
  assert(
    emitErrorCompleted.status === 0,
    `Python emit-error smoke failed with exit ${String(emitErrorCompleted.status)}\n${emitErrorCompleted.stdout}\n${emitErrorCompleted.stderr}`
  );

  const unsupportedErrorResult = projectPythonRuntimePlan(
    withPythonErrorPolicy(unit, {
      selector: { luiId: 'adder' },
      onException: 'return-exception',
    }),
    capabilities
  );
  assert(
    !unsupportedErrorResult.ok &&
      unsupportedErrorResult.diagnostics.some(
        (diagnostic) => diagnostic.code === 'PY-001'
      ),
    'Python runtime planner should reject required return-exception error policy before lowering.'
  );

  const contextManagerResourceResult = projectPythonRuntimePlan(
    withPythonResourceLifecyclePolicy(unit, {
      selector: { luiId: 'adder' },
      protocol: 'context-manager',
    }),
    capabilities
  );
  assert(
    contextManagerResourceResult.ok,
    'Python runtime plan should still be created when capability supports context-manager resource lifecycle.'
  );
  if (!contextManagerResourceResult.ok) {
    throw new Error('unreachable');
  }
  const contextManagerResourceArtifact = lowerPythonExecutableRuntime(
    contextManagerResourceResult.plan
  );
  const contextManagerResourceFile = join(
    dir,
    `context_manager_resource_${contextManagerResourceArtifact.filename}`
  );
  writeFileSync(
    contextManagerResourceFile,
    contextManagerResourceArtifact.content,
    'utf8'
  );
  const contextManagerResourceRunner = join(
    dir,
    'run_context_manager_resource_smoke.py'
  );
  writeFileSync(
    contextManagerResourceRunner,
    [
      'import importlib.util',
      'import pathlib',
      '',
      `module_path = pathlib.Path(${JSON.stringify(contextManagerResourceFile)})`,
      'spec = importlib.util.spec_from_file_location("logicir_runtime_context_manager_resource", module_path)',
      'module = importlib.util.module_from_spec(spec)',
      'assert spec.loader is not None',
      'spec.loader.exec_module(module)',
      '',
      'events = []',
      '',
      'class Resource:',
      '    def __enter__(self):',
      '        events.append("enter")',
      '        return {"prefix": 10}',
      '',
      '    def __exit__(self, exc_type, exc, tb):',
      '        events.append("exit")',
      '        return False',
      '',
      'def adder(inputs, context):',
      '    resource = context["resource"]',
      '    assert resource is context["resources"]["lui:adder"]',
      '    return {"sum": resource["prefix"] + inputs["a"] + inputs["b"]}',
      '',
      'runtime = module.create_runtime({"implementations": {"adder": adder}, "resources": {"adder": Resource()}})',
      'outputs = runtime.invoke({"a": 2, "b": 5})',
      'assert outputs["sum"] == 17, outputs',
      'second = runtime.invoke({"a": 1, "b": 1})',
      'assert second["sum"] == 12, second',
      'assert events == ["enter"], events',
      'runtime.dispose()',
      'assert events == ["enter", "exit"], events',
      '',
    ].join('\n'),
    'utf8'
  );
  const contextManagerResourceCompleted = spawnSync(
    'python',
    [contextManagerResourceRunner],
    { encoding: 'utf8' }
  );
  if (contextManagerResourceCompleted.error) {
    throw contextManagerResourceCompleted.error;
  }
  assert(
    contextManagerResourceCompleted.status === 0,
    `Python context-manager resource smoke failed with exit ${String(contextManagerResourceCompleted.status)}\n${contextManagerResourceCompleted.stdout}\n${contextManagerResourceCompleted.stderr}`
  );

  const asyncContextManagerResourceResult = projectPythonRuntimePlan(
    withPythonResourceLifecyclePolicy(unit, {
      selector: { luiId: 'adder' },
      protocol: 'async-context-manager',
    }),
    capabilities
  );
  assert(
    asyncContextManagerResourceResult.ok,
    'Python runtime plan should still be created when capability supports async-context-manager resource lifecycle.'
  );
  if (!asyncContextManagerResourceResult.ok) {
    throw new Error('unreachable');
  }
  const asyncContextManagerResourceArtifact = lowerPythonExecutableRuntime(
    asyncContextManagerResourceResult.plan
  );
  const asyncContextManagerResourceFile = join(
    dir,
    `async_context_manager_resource_${asyncContextManagerResourceArtifact.filename}`
  );
  writeFileSync(
    asyncContextManagerResourceFile,
    asyncContextManagerResourceArtifact.content,
    'utf8'
  );
  const asyncContextManagerResourceRunner = join(
    dir,
    'run_async_context_manager_resource_smoke.py'
  );
  writeFileSync(
    asyncContextManagerResourceRunner,
    [
      'import importlib.util',
      'import pathlib',
      '',
      `module_path = pathlib.Path(${JSON.stringify(asyncContextManagerResourceFile)})`,
      'spec = importlib.util.spec_from_file_location("logicir_runtime_async_context_manager_resource", module_path)',
      'module = importlib.util.module_from_spec(spec)',
      'assert spec.loader is not None',
      'spec.loader.exec_module(module)',
      '',
      'events = []',
      '',
      'class AsyncResource:',
      '    async def __aenter__(self):',
      '        events.append("aenter")',
      '        return {"prefix": 20}',
      '',
      '    async def __aexit__(self, exc_type, exc, tb):',
      '        events.append("aexit")',
      '        return False',
      '',
      'def adder(inputs, context):',
      '    resource = context["resource"]',
      '    assert resource is context["resources"]["lui:adder"]',
      '    return {"sum": resource["prefix"] + inputs["a"] + inputs["b"]}',
      '',
      'runtime = module.create_runtime({"implementations": {"adder": adder}, "resources": {"adder": AsyncResource()}})',
      'outputs = runtime.invoke({"a": 2, "b": 5})',
      'assert outputs["sum"] == 27, outputs',
      'second = runtime.invoke({"a": 1, "b": 1})',
      'assert second["sum"] == 22, second',
      'assert events == ["aenter"], events',
      'runtime.dispose()',
      'assert events == ["aenter", "aexit"], events',
      '',
    ].join('\n'),
    'utf8'
  );
  const asyncContextManagerResourceCompleted = spawnSync(
    'python',
    [asyncContextManagerResourceRunner],
    { encoding: 'utf8' }
  );
  if (asyncContextManagerResourceCompleted.error) {
    throw asyncContextManagerResourceCompleted.error;
  }
  assert(
    asyncContextManagerResourceCompleted.status === 0,
    `Python async-context-manager resource smoke failed with exit ${String(asyncContextManagerResourceCompleted.status)}\n${asyncContextManagerResourceCompleted.stdout}\n${asyncContextManagerResourceCompleted.stderr}`
  );

  const startStopResourceResult = projectPythonRuntimePlan(
    withPythonResourceLifecyclePolicy(unit, {
      selector: { luiId: 'adder' },
      protocol: 'start-stop',
    }),
    capabilities
  );
  assert(
    startStopResourceResult.ok,
    'Python runtime plan should still be created when capability supports start-stop resource lifecycle.'
  );
  if (!startStopResourceResult.ok) {
    throw new Error('unreachable');
  }
  const startStopResourceArtifact = lowerPythonExecutableRuntime(
    startStopResourceResult.plan
  );
  const startStopResourceFile = join(
    dir,
    `start_stop_resource_${startStopResourceArtifact.filename}`
  );
  writeFileSync(
    startStopResourceFile,
    startStopResourceArtifact.content,
    'utf8'
  );
  const startStopResourceRunner = join(
    dir,
    'run_start_stop_resource_smoke.py'
  );
  writeFileSync(
    startStopResourceRunner,
    [
      'import importlib.util',
      'import pathlib',
      '',
      `module_path = pathlib.Path(${JSON.stringify(startStopResourceFile)})`,
      'spec = importlib.util.spec_from_file_location("logicir_runtime_start_stop_resource", module_path)',
      'module = importlib.util.module_from_spec(spec)',
      'assert spec.loader is not None',
      'spec.loader.exec_module(module)',
      '',
      'events = []',
      '',
      'class Resource:',
      '    def start(self):',
      '        events.append("start")',
      '        return {"prefix": 30}',
      '',
      '    def stop(self):',
      '        events.append("stop")',
      '',
      'def adder(inputs, context):',
      '    resource = context["resource"]',
      '    assert resource is context["resources"]["lui:adder"]',
      '    return {"sum": resource["prefix"] + inputs["a"] + inputs["b"]}',
      '',
      'runtime = module.create_runtime({"implementations": {"adder": adder}, "resources": {"adder": Resource()}})',
      'outputs = runtime.invoke({"a": 2, "b": 5})',
      'assert outputs["sum"] == 37, outputs',
      'second = runtime.invoke({"a": 1, "b": 1})',
      'assert second["sum"] == 32, second',
      'assert events == ["start"], events',
      'runtime.dispose()',
      'assert events == ["start", "stop"], events',
      '',
    ].join('\n'),
    'utf8'
  );
  const startStopResourceCompleted = spawnSync(
    'python',
    [startStopResourceRunner],
    { encoding: 'utf8' }
  );
  if (startStopResourceCompleted.error) {
    throw startStopResourceCompleted.error;
  }
  assert(
    startStopResourceCompleted.status === 0,
    `Python start-stop resource smoke failed with exit ${String(startStopResourceCompleted.status)}\n${startStopResourceCompleted.stdout}\n${startStopResourceCompleted.stderr}`
  );

  const asyncStartStopResourceResult = projectPythonRuntimePlan(
    withPythonResourceLifecyclePolicy(unit, {
      selector: { luiId: 'adder' },
      protocol: 'start-stop',
    }),
    capabilities
  );
  assert(
    asyncStartStopResourceResult.ok,
    'Python runtime plan should support async start-stop resource lifecycle under the start-stop protocol.'
  );
  if (!asyncStartStopResourceResult.ok) {
    throw new Error('unreachable');
  }
  const asyncStartStopResourceArtifact = lowerPythonExecutableRuntime(
    asyncStartStopResourceResult.plan
  );
  const asyncStartStopResourceFile = join(
    dir,
    `async_start_stop_resource_${asyncStartStopResourceArtifact.filename}`
  );
  writeFileSync(
    asyncStartStopResourceFile,
    asyncStartStopResourceArtifact.content,
    'utf8'
  );
  const asyncStartStopResourceRunner = join(
    dir,
    'run_async_start_stop_resource_smoke.py'
  );
  writeFileSync(
    asyncStartStopResourceRunner,
    [
      'import importlib.util',
      'import pathlib',
      '',
      `module_path = pathlib.Path(${JSON.stringify(asyncStartStopResourceFile)})`,
      'spec = importlib.util.spec_from_file_location("logicir_runtime_async_start_stop_resource", module_path)',
      'module = importlib.util.module_from_spec(spec)',
      'assert spec.loader is not None',
      'spec.loader.exec_module(module)',
      '',
      'events = []',
      '',
      'class AsyncStartStopResource:',
      '    async def start(self):',
      '        events.append("astart")',
      '        return {"prefix": 40}',
      '',
      '    async def stop(self):',
      '        events.append("astop")',
      '',
      'def adder(inputs, context):',
      '    resource = context["resource"]',
      '    assert resource is context["resources"]["lui:adder"]',
      '    return {"sum": resource["prefix"] + inputs["a"] + inputs["b"]}',
      '',
      'runtime = module.create_runtime({"implementations": {"adder": adder}, "resources": {"adder": AsyncStartStopResource()}})',
      'outputs = runtime.invoke({"a": 2, "b": 5})',
      'assert outputs["sum"] == 47, outputs',
      'second = runtime.invoke({"a": 1, "b": 1})',
      'assert second["sum"] == 42, second',
      'assert events == ["astart"], events',
      'runtime.dispose()',
      'assert events == ["astart", "astop"], events',
      '',
    ].join('\n'),
    'utf8'
  );
  const asyncStartStopResourceCompleted = spawnSync(
    'python',
    [asyncStartStopResourceRunner],
    { encoding: 'utf8' }
  );
  if (asyncStartStopResourceCompleted.error) {
    throw asyncStartStopResourceCompleted.error;
  }
  assert(
    asyncStartStopResourceCompleted.status === 0,
    `Python async start-stop resource smoke failed with exit ${String(asyncStartStopResourceCompleted.status)}\n${asyncStartStopResourceCompleted.stdout}\n${asyncStartStopResourceCompleted.stderr}`
  );

  const unsupportedResourceResult = projectPythonRuntimePlan(
    withPythonResourceLifecyclePolicy(unit, {
      selector: { luiId: 'adder' },
      protocol: 'custom',
    }),
    capabilities
  );
  assert(
    !unsupportedResourceResult.ok &&
      unsupportedResourceResult.diagnostics.some(
        (diagnostic) => diagnostic.code === 'PY-005'
      ),
    'Python runtime planner should reject required custom resource lifecycle before lowering.'
  );

  const threadConcurrencyResult = projectPythonRuntimePlan(
    withPythonConcurrencyPolicy(unit, {
      selector: { luiId: 'adder' },
      execution: 'thread',
      backpressure: 'block',
      ordering: 'preserve',
    }),
    capabilities
  );
  assert(
    threadConcurrencyResult.ok,
    'Python runtime plan should still be created when capability supports thread concurrency.'
  );
  if (!threadConcurrencyResult.ok) {
    throw new Error('unreachable');
  }
  const threadConcurrencyArtifact = lowerPythonExecutableRuntime(
    threadConcurrencyResult.plan
  );
  const threadConcurrencyFile = join(
    dir,
    `thread_concurrency_${threadConcurrencyArtifact.filename}`
  );
  writeFileSync(
    threadConcurrencyFile,
    threadConcurrencyArtifact.content,
    'utf8'
  );
  const threadConcurrencyRunner = join(
    dir,
    'run_thread_concurrency_smoke.py'
  );
  writeFileSync(
    threadConcurrencyRunner,
    [
      'import importlib.util',
      'import pathlib',
      'import threading',
      '',
      `module_path = pathlib.Path(${JSON.stringify(threadConcurrencyFile)})`,
      'spec = importlib.util.spec_from_file_location("logicir_runtime_thread_concurrency", module_path)',
      'module = importlib.util.module_from_spec(spec)',
      'assert spec.loader is not None',
      'spec.loader.exec_module(module)',
      '',
      'main_thread = threading.get_ident()',
      'worker_threads = []',
      '',
      'def adder(inputs, context):',
      '    worker_threads.append(threading.get_ident())',
      '    return {"sum": inputs["a"] + inputs["b"]}',
      '',
      'runtime = module.create_runtime({"implementations": {"adder": adder}})',
      'outputs = runtime.invoke({"a": 2, "b": 5})',
      'assert outputs["sum"] == 7, outputs',
      'assert worker_threads and worker_threads[0] != main_thread, worker_threads',
      '',
    ].join('\n'),
    'utf8'
  );
  const threadConcurrencyCompleted = spawnSync(
    'python',
    [threadConcurrencyRunner],
    { encoding: 'utf8' }
  );
  if (threadConcurrencyCompleted.error) {
    throw threadConcurrencyCompleted.error;
  }
  assert(
    threadConcurrencyCompleted.status === 0,
    `Python thread concurrency smoke failed with exit ${String(threadConcurrencyCompleted.status)}\n${threadConcurrencyCompleted.stdout}\n${threadConcurrencyCompleted.stderr}`
  );

  const unsupportedConcurrencyResult = projectPythonRuntimePlan(
    withPythonConcurrencyPolicy(unit, {
      selector: { luiId: 'adder' },
      execution: 'asyncio-task',
      backpressure: 'latest',
    }),
    capabilities
  );
  assert(
    !unsupportedConcurrencyResult.ok &&
      unsupportedConcurrencyResult.diagnostics.some(
        (diagnostic) => diagnostic.code === 'PY-006'
      ),
    'Python runtime planner should reject required asyncio-task concurrency before lowering.'
  );

  const statefulUnit = withStatefulCounterPayloadTypes(
    statefulRetainedCounterExample
  );
  const statefulResult = projectPythonRuntimePlan(statefulUnit, capabilities);
  assert(
    statefulResult.ok,
    'Python runtime plan should support typed stateful retained-current counter.'
  );
  if (!statefulResult.ok) {
    throw new Error('unreachable');
  }
  const statefulArtifact = lowerPythonExecutableRuntime(statefulResult.plan);
  const statefulFile = join(dir, `stateful_${statefulArtifact.filename}`);
  writeFileSync(statefulFile, statefulArtifact.content, 'utf8');
  const statefulRunner = join(dir, 'run_stateful_smoke.py');
  writeFileSync(
    statefulRunner,
    [
      'import importlib.util',
      'import pathlib',
      '',
      `module_path = pathlib.Path(${JSON.stringify(statefulFile)})`,
      'spec = importlib.util.spec_from_file_location("logicir_runtime_stateful_executable", module_path)',
      'module = importlib.util.module_from_spec(spec)',
      'assert spec.loader is not None',
      'spec.loader.exec_module(module)',
      '',
      'count = 0',
      'def counter_state(inputs, context):',
      '    global count',
      '    count += inputs.get("increment", 0)',
      '    return {"value": count}',
      '',
      'runtime = module.create_runtime({"implementations": {"counterState": counter_state}})',
      'first = runtime.invoke({"increment": 2})',
      'second = runtime.invoke({"increment": 3})',
      'read = runtime.invoke({})',
      'assert first["value"] == 2, first',
      'assert second["value"] == 5, second',
      'assert read["value"] == 5, read',
      '',
    ].join('\n'),
    'utf8'
  );
  const statefulCompleted = spawnSync('python', [statefulRunner], {
    encoding: 'utf8',
  });
  if (statefulCompleted.error) {
    throw statefulCompleted.error;
  }
  assert(
    statefulCompleted.status === 0,
    `Python stateful smoke failed with exit ${String(statefulCompleted.status)}\n${statefulCompleted.stdout}\n${statefulCompleted.stderr}`
  );
} finally {
  rmSync(dir, { recursive: true, force: true });
}

function withPortPayloadTypes(
  unit: typeof combinationalAdderExample
): LogicUnit {
  const withPayloadType = <T extends { extensions?: ExtensionRecord[] }>(
    port: T
  ): T => ({
    ...port,
    extensions: [
      ...(port.extensions ?? []),
      {
        feature: { namespace: 'logicir.type-system', key: 'core' },
        key: 'payload-types',
        requirement: 'required',
        payload: { type: { kind: 'primitive', name: 'int' } },
      },
    ],
  });

  return {
    ...unit,
    core: {
      ...unit.core,
      ports: {
        a: withPayloadType(unit.core.ports.a),
        b: withPayloadType(unit.core.ports.b),
        sum: withPayloadType(unit.core.ports.sum),
      },
      luis: {
        adder: {
          ...unit.core.luis.adder,
          ports: {
            a: withPayloadType(unit.core.luis.adder.ports.a),
            b: withPayloadType(unit.core.luis.adder.ports.b),
            sum: withPayloadType(unit.core.luis.adder.ports.sum),
          },
        },
      },
    },
  };
}

function withAuthRequirementPayloadTypes(
  unit: typeof childWithRequirementContractExample
): LogicUnit {
  const stringType = { kind: 'primitive', name: 'string' };
  const boolType = { kind: 'primitive', name: 'bool' };
  const withPayloadType = <T extends { extensions?: ExtensionRecord[] }>(
    port: T,
    type: unknown
  ): T => ({
    ...port,
    extensions: [
      ...(port.extensions ?? []),
      {
        feature: { namespace: 'logicir.type-system', key: 'core' },
        key: 'payload-types',
        requirement: 'required',
        payload: { type },
      },
    ],
  });

  const authEntry = unit.requirements.auth;
  assert(
    authEntry.kind === 'inline',
    'withAuthRequirementPayloadTypes expects inline auth requirement.'
  );
  const authCheck = unit.core.luis.authCheck;

  return {
    ...unit,
    requirements: {
      auth: {
        kind: 'inline',
        service: {
          ...authEntry.service,
          units: {
            check: {
              ...authEntry.service.units.check,
              ports: {
                subject: withPayloadType(
                  authEntry.service.units.check.ports.subject,
                  stringType
                ),
                allowed: withPayloadType(
                  authEntry.service.units.check.ports.allowed,
                  boolType
                ),
              },
            },
          },
        },
      },
    },
    core: {
      ...unit.core,
      ports: {
        subject: withPayloadType(unit.core.ports.subject, stringType),
        allowed: withPayloadType(unit.core.ports.allowed, boolType),
      },
      luis: {
        authCheck: {
          ...authCheck,
          ports: {
            subject: withPayloadType(authCheck.ports.subject, stringType),
            allowed: withPayloadType(authCheck.ports.allowed, boolType),
          },
        },
      },
    },
  };
}

function withDuplicatedAuthCheckLUI(unit: LogicUnit): LogicUnit {
  const core = unit.core;
  const authCheck = (core.luis as Record<string, LUI>).authCheck;
  assert(
    authCheck !== undefined,
    'withDuplicatedAuthCheckLUI expects an authCheck LUI.'
  );
  return {
    ...unit,
    core: {
      ...core,
      ports: {
        ...core.ports,
        allowedAgain: {
          boundary: core.ports.allowed.boundary,
          interaction: core.ports.allowed.interaction,
        },
      },
      luis: {
        ...(core.luis as Record<string, LUI>),
        authCheckAgain: {
          ...authCheck,
          ports: { ...authCheck.ports },
        },
      },
      connections: {
        ...core.connections,
        subjectToRequirementAgain: {
          from: { owner: { kind: 'lu' }, portKey: 'subject' },
          to: {
            owner: { kind: 'lui', luiId: 'authCheckAgain' },
            portKey: 'subject',
          },
        },
        allowedAgainFromRequirement: {
          from: {
            owner: { kind: 'lui', luiId: 'authCheckAgain' },
            portKey: 'allowed',
          },
          to: { owner: { kind: 'lu' }, portKey: 'allowedAgain' },
        },
      },
    } as LogicUnit['core'],
  };
}

function payloadPathAdderUnit(): LogicUnit {
  const pullInput: Port = {
    boundary: 'input',
    interaction: {
      pullReadable: true,
      pushNotifiable: false,
      retainedCurrent: false,
    },
  };
  const pullOutput: Port = {
    boundary: 'output',
    interaction: {
      pullReadable: true,
      pushNotifiable: false,
      retainedCurrent: false,
    },
  };

  return {
    ...combinationalAdderExample,
    core: {
      ...combinationalAdderExample.core,
      ports: {
        busIn: pullInput,
        busOut: { ...pullOutput, role: 'primary-result' },
      },
      connections: {
        lane0ToAdder: {
          from: {
            owner: { kind: 'lu' },
            portKey: 'busIn',
            payloadPath: ['lanes', 0],
          },
          to: { owner: { kind: 'lui', luiId: 'adder' }, portKey: 'a' },
        },
        lane1ToAdder: {
          from: {
            owner: { kind: 'lu' },
            portKey: 'busIn',
            payloadPath: ['lanes', 1],
          },
          to: { owner: { kind: 'lui', luiId: 'adder' }, portKey: 'b' },
        },
        sumToLane0: {
          from: {
            owner: { kind: 'lui', luiId: 'adder' },
            portKey: 'sum',
          },
          to: {
            owner: { kind: 'lu' },
            portKey: 'busOut',
            payloadPath: ['lanes', 0],
          },
        },
      },
    },
  };
}

function withPayloadPathBusTypes(unit: LogicUnit): LogicUnit {
  const luis = unit.core.luis as Record<string, LUI>;
  const adder = luis.adder;
  assert(adder !== undefined, 'payloadPath smoke expects an adder LUI.');
  const primitiveInt = { kind: 'primitive', name: 'int' };
  const busType = {
    kind: 'record',
    fields: {
      lanes: { kind: 'array', item: primitiveInt },
    },
  };
  const withPayloadType = <T extends { extensions?: ExtensionRecord[] }>(
    port: T,
    type: unknown
  ): T => ({
    ...port,
    extensions: [
      ...(port.extensions ?? []),
      {
        feature: { namespace: 'logicir.type-system', key: 'core' },
        key: 'payload-types',
        requirement: 'required',
        payload: { type },
      },
    ],
  });

  return {
    ...unit,
    core: {
      ...unit.core,
      ports: {
        busIn: withPayloadType(unit.core.ports.busIn, busType),
        busOut: withPayloadType(unit.core.ports.busOut, busType),
      },
      luis: {
        adder: {
          ...adder,
          ports: {
            a: withPayloadType(adder.ports.a, primitiveInt),
            b: withPayloadType(adder.ports.b, primitiveInt),
            sum: withPayloadType(adder.ports.sum, primitiveInt),
          },
        },
      } as typeof unit.core.luis,
    } as typeof unit.core,
  };
}

function pinAwareAdderUnit(): LogicUnit {
  const pullInput: Port = {
    boundary: 'input',
    interaction: {
      pullReadable: true,
      pushNotifiable: false,
      retainedCurrent: false,
    },
    pins: { kind: 'indexed', count: 2 },
  };
  const pullOutput: Port = {
    boundary: 'output',
    interaction: {
      pullReadable: true,
      pushNotifiable: false,
      retainedCurrent: false,
    },
    pins: { kind: 'keyed', keys: ['sum'] },
  };

  return {
    ...combinationalAdderExample,
    core: {
      ...combinationalAdderExample.core,
      ports: {
        pairIn: pullInput,
        resultBus: { ...pullOutput, role: 'primary-result' },
      },
      connections: {
        pin0ToAdder: {
          from: {
            owner: { kind: 'lu' },
            portKey: 'pairIn',
            payloadPath: [0],
          },
          to: { owner: { kind: 'lui', luiId: 'adder' }, portKey: 'a' },
        },
        pin1ToAdder: {
          from: {
            owner: { kind: 'lu' },
            portKey: 'pairIn',
            payloadPath: [1],
          },
          to: { owner: { kind: 'lui', luiId: 'adder' }, portKey: 'b' },
        },
        sumToResultPin: {
          from: {
            owner: { kind: 'lui', luiId: 'adder' },
            portKey: 'sum',
          },
          to: {
            owner: { kind: 'lu' },
            portKey: 'resultBus',
            payloadPath: ['sum'],
          },
        },
      },
    },
  };
}

function withPinBusTypes(unit: LogicUnit): LogicUnit {
  const luis = unit.core.luis as Record<string, LUI>;
  const adder = luis.adder;
  assert(adder !== undefined, 'pin-aware smoke expects an adder LUI.');
  const primitiveInt = { kind: 'primitive', name: 'int' };
  const pairType = { kind: 'array', item: primitiveInt, length: 2 };
  const resultType = {
    kind: 'record',
    fields: {
      sum: primitiveInt,
    },
  };
  const withPayloadType = <T extends { extensions?: ExtensionRecord[] }>(
    port: T,
    type: unknown
  ): T => ({
    ...port,
    extensions: [
      ...(port.extensions ?? []),
      {
        feature: { namespace: 'logicir.type-system', key: 'core' },
        key: 'payload-types',
        requirement: 'required',
        payload: { type },
      },
    ],
  });

  return {
    ...unit,
    core: {
      ...unit.core,
      ports: {
        pairIn: withPayloadType(unit.core.ports.pairIn, pairType),
        resultBus: withPayloadType(unit.core.ports.resultBus, resultType),
      },
      luis: {
        adder: {
          ...adder,
          ports: {
            a: withPayloadType(adder.ports.a, primitiveInt),
            b: withPayloadType(adder.ports.b, primitiveInt),
            sum: withPayloadType(adder.ports.sum, primitiveInt),
          },
        },
      } as typeof unit.core.luis,
    } as typeof unit.core,
  };
}

function withSequentialPayloadTypes(
  unit: typeof sequentialPipelineExample
): LogicUnit {
  const stringType = { kind: 'primitive', name: 'string' };
  const withPayloadType = <T extends { extensions?: ExtensionRecord[] }>(
    port: T
  ): T => ({
    ...port,
    extensions: [
      ...(port.extensions ?? []),
      {
        feature: { namespace: 'logicir.type-system', key: 'core' },
        key: 'payload-types',
        requirement: 'required',
        payload: { type: stringType },
      },
    ],
  });

  return {
    ...unit,
    core: {
      ...unit.core,
      ports: {
        raw: withPayloadType(unit.core.ports.raw),
        normalized: withPayloadType(unit.core.ports.normalized),
      },
      luis: {
        decode: {
          ...unit.core.luis.decode,
          ports: {
            input: withPayloadType(unit.core.luis.decode.ports.input),
            output: withPayloadType(unit.core.luis.decode.ports.output),
          },
        },
        normalize: {
          ...unit.core.luis.normalize,
          ports: {
            input: withPayloadType(unit.core.luis.normalize.ports.input),
            output: withPayloadType(unit.core.luis.normalize.ports.output),
          },
        },
      },
    },
  };
}

function withPythonAsyncPolicy(
  unit: LogicUnit,
  payload: {
    invocation:
      | 'sync-call'
      | 'coroutine'
      | 'async-generator'
      | 'generator'
      | 'threadpool-call';
    awaitBeforeNext?: boolean;
    selector?: { stepIndex?: number; luiId?: string; portKey?: string };
  }
): LogicUnit {
  return {
    ...unit,
    core: {
      ...unit.core,
      extensions: [
        ...(unit.core.extensions ?? []),
        {
          feature: { namespace: 'logicir.python-runtime', key: 'core' },
          key: 'async-policy',
          requirement: 'required',
          payload,
        },
      ],
    },
  };
}

function withPythonDynamicFulfillmentPolicy(
  unit: LogicUnit,
  payload: {
    selector?: { serviceKey?: string; unitKey?: string };
    binding:
      | 'constructor-injected'
      | 'contextvar'
      | 'service-container'
      | 'late-bound'
      | 'switchable';
    consistency:
      | 'startup-only'
      | 'task-local'
      | 'quiescent-switch'
      | 'transactional-switch';
  }
): LogicUnit {
  return {
    ...unit,
    core: {
      ...unit.core,
      extensions: [
        ...(unit.core.extensions ?? []),
        {
          feature: { namespace: 'logicir.python-runtime', key: 'core' },
          key: 'dynamic-fulfillment',
          requirement: 'required',
          payload,
        },
      ],
    },
  };
}

function withPythonRetainedCurrentPolicy(
  unit: LogicUnit,
  payload: {
    selector?: {
      luiId?: string;
      portKey?: string;
      payloadPath?: (string | number)[];
    };
    realization:
      | 'source-property'
      | 'sink-cache'
      | 'asyncio-queue-latest'
      | 'observable'
      | 'projector-adapter';
    notification?: 'callback' | 'asyncio-event' | 'queue' | 'poll';
  }
): LogicUnit {
  return {
    ...unit,
    core: {
      ...unit.core,
      extensions: [
        ...(unit.core.extensions ?? []),
        {
          feature: { namespace: 'logicir.python-runtime', key: 'core' },
          key: 'retained-current-realization',
          requirement: 'required',
          payload,
        },
      ],
    },
  };
}

function withPythonLUIRetainedCurrentPolicy(
  unit: LogicUnit,
  luiId: string,
  portKey: string,
  payload: {
    selector?: { portKey?: string; payloadPath?: (string | number)[] };
    realization:
      | 'source-property'
      | 'sink-cache'
      | 'asyncio-queue-latest'
      | 'observable'
      | 'projector-adapter';
    notification?: 'callback' | 'asyncio-event' | 'queue' | 'poll';
  }
): LogicUnit {
  const lui = unit.core.luis[luiId];
  assert(lui !== undefined, `Missing LUI ${luiId}.`);
  const port = lui.ports[portKey];
  assert(port !== undefined, `Missing LUI port ${luiId}.${portKey}.`);
  const updatedLui = {
    ...lui,
    ports: {
      ...lui.ports,
      [portKey]: {
        ...port,
        extensions: [
          ...(port.extensions ?? []),
          {
            feature: { namespace: 'logicir.python-runtime', key: 'core' },
            key: 'retained-current-realization',
            requirement: 'required',
            payload,
          },
        ],
      },
    },
  } as LUI;
  const updatedCore = {
    ...unit.core,
    luis: {
      ...(unit.core.luis as Record<string, LUI>),
      [luiId]: updatedLui,
    },
  } as LogicUnit['core'];
  return {
    ...unit,
    core: updatedCore,
  };
}

function withPythonErrorPolicy(
  unit: LogicUnit,
  payload: {
    selector?: { luiId?: string; portKey?: string };
    onException:
      | 'raise'
      | 'return-exception'
      | 'emit-error'
      | 'cancel-task'
      | 'use-error-port';
    cancellation?: 'unsupported' | 'asyncio-cancel' | 'cooperative' | 'custom';
  }
): LogicUnit {
  return {
    ...unit,
    core: {
      ...unit.core,
      extensions: [
        ...(unit.core.extensions ?? []),
        {
          feature: { namespace: 'logicir.python-runtime', key: 'core' },
          key: 'error-policy',
          requirement: 'required',
          payload,
        },
      ],
    },
  };
}

function withPythonErrorPort(unit: LogicUnit): LogicUnit {
  const luis = unit.core.luis as Record<string, LUI>;
  const adder = luis.adder;
  assert(adder !== undefined, 'withPythonErrorPort expects an adder LUI.');
  const errorType = {
    kind: 'record',
    fields: {
      name: { kind: 'primitive', name: 'string' },
      message: { kind: 'primitive', name: 'string' },
    },
  };
  const errorPort: Port = {
    boundary: 'output',
    interaction: {
      pullReadable: true,
      pushNotifiable: false,
      retainedCurrent: false,
    },
    extensions: [
      {
        feature: { namespace: 'logicir.type-system', key: 'core' },
        key: 'payload-types',
        requirement: 'required',
        payload: { type: errorType },
      },
    ],
  };

  return {
    ...unit,
    core: {
      ...unit.core,
      ports: {
        ...unit.core.ports,
        error: errorPort,
      },
      luis: {
        ...luis,
        adder: {
          ...adder,
          ports: {
            ...adder.ports,
            error: errorPort,
          },
        },
      } as typeof unit.core.luis,
      connections: {
        ...unit.core.connections,
        errorFromAdder: {
          from: {
            owner: { kind: 'lui', luiId: 'adder' },
            portKey: 'error',
          },
          to: { owner: { kind: 'lu' }, portKey: 'error' },
        },
      },
    } as typeof unit.core,
  };
}

function withPythonResourceLifecyclePolicy(
  unit: LogicUnit,
  payload: {
    selector?: { luiId?: string; closureId?: string };
    protocol:
      | 'none'
      | 'context-manager'
      | 'async-context-manager'
      | 'start-stop'
      | 'custom';
    ordering?: 'parent-before-child' | 'child-before-parent';
  }
): LogicUnit {
  return {
    ...unit,
    core: {
      ...unit.core,
      extensions: [
        ...(unit.core.extensions ?? []),
        {
          feature: { namespace: 'logicir.python-runtime', key: 'core' },
          key: 'resource-lifecycle',
          requirement: 'required',
          payload,
        },
      ],
    },
  };
}

function withPythonConcurrencyPolicy(
  unit: LogicUnit,
  payload: {
    selector?: { luiId?: string; connectionId?: string };
    execution:
      | 'same-thread'
      | 'asyncio-task'
      | 'thread'
      | 'process'
      | 'external-worker';
    backpressure?: 'drop' | 'latest' | 'buffer' | 'block' | 'custom';
    ordering?: 'preserve' | 'best-effort' | 'unordered';
  }
): LogicUnit {
  return {
    ...unit,
    core: {
      ...unit.core,
      extensions: [
        ...(unit.core.extensions ?? []),
        {
          feature: { namespace: 'logicir.python-runtime', key: 'core' },
          key: 'concurrency',
          requirement: 'required',
          payload,
        },
      ],
    },
  };
}

function withStatefulCounterPayloadTypes(
  unit: LogicUnit
): LogicUnit {
  const luis = unit.core.luis as Record<string, LUI>;
  const counterState = luis.counterState;
  assert(
    unit.core.ports.increment !== undefined &&
      unit.core.ports.value !== undefined &&
      counterState !== undefined,
    'withStatefulCounterPayloadTypes expects the retained counter fixture shape.'
  );
  const intType = { kind: 'primitive', name: 'int' };
  const withPayloadType = <T extends { extensions?: ExtensionRecord[] }>(
    port: T
  ): T => ({
    ...port,
    extensions: [
      ...(port.extensions ?? []),
      {
        feature: { namespace: 'logicir.type-system', key: 'core' },
        key: 'payload-types',
        requirement: 'required',
        payload: { type: intType },
      },
    ],
  });

  return {
    ...unit,
    core: {
      ...unit.core,
      ports: {
        increment: withPayloadType(unit.core.ports.increment),
        value: withPayloadType(unit.core.ports.value),
      },
      luis: {
        counterState: {
          ...counterState,
          ports: {
            increment: withPayloadType(
              counterState.ports.increment
            ),
            value: withPayloadType(counterState.ports.value),
          },
        },
      } as typeof unit.core.luis,
    } as typeof unit.core,
  };
}

function withStatefulCounterVectorPayloadTypes(
  unit: LogicUnit
): LogicUnit {
  const luis = unit.core.luis as Record<string, LUI>;
  const counterState = luis.counterState;
  assert(
    unit.core.ports.increment !== undefined &&
      unit.core.ports.value !== undefined &&
      counterState !== undefined,
    'withStatefulCounterVectorPayloadTypes expects the retained counter fixture shape.'
  );
  const intType = { kind: 'primitive', name: 'int' };
  const vectorType = {
    kind: 'record',
    fields: {
      lanes: { kind: 'array', item: intType },
    },
  };
  const withPayloadType = <T extends { extensions?: ExtensionRecord[] }>(
    port: T,
    type: unknown
  ): T => ({
    ...port,
    extensions: [
      ...(port.extensions ?? []),
      {
        feature: { namespace: 'logicir.type-system', key: 'core' },
        key: 'payload-types',
        requirement: 'required',
        payload: { type },
      },
    ],
  });

  return {
    ...unit,
    core: {
      ...unit.core,
      ports: {
        increment: withPayloadType(unit.core.ports.increment, intType),
        value: withPayloadType(unit.core.ports.value, vectorType),
      },
      luis: {
        counterState: {
          ...counterState,
          ports: {
            increment: withPayloadType(
              counterState.ports.increment,
              intType
            ),
            value: withPayloadType(counterState.ports.value, vectorType),
          },
        },
      } as typeof unit.core.luis,
    } as typeof unit.core,
  };
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}
