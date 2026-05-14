import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import type {
  BitValue,
  HdlArtifacts,
  HdlEmitOptions,
  HdlLibraryModule,
  HdlModulePayload,
  HdlSignalPayload,
  HdlTestVector,
  LogicUnit,
  Port,
  StructuralInstance,
  StructuralPayload,
  StructuralWire,
} from './types';

const GENERATED_DIR = 'generated';

const isRecord = (value: unknown): value is { [key: string]: unknown } =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const assertIdentifier = (value: string, label: string): void => {
  if (!/^[A-Za-z_][A-Za-z0-9_$]*$/.test(value)) {
    throw new Error(`Invalid Verilog identifier for ${label}: ${value}`);
  }
};

const assertSignal = (
  value: HdlSignalPayload,
  label: string,
): HdlSignalPayload => {
  if (
    !Number.isInteger(value.width) ||
    value.width < 1 ||
    typeof value.signed !== 'boolean'
  ) {
    throw new Error(`Invalid HDL signal payload for ${label}.`);
  }

  return value;
};

const signalRange = (signal: HdlSignalPayload): string => {
  const signed = signal.signed ? ' signed' : '';
  const range = signal.width === 1 ? '' : ` [${signal.width - 1}:0]`;
  return `${signed}${range}`;
};

const portSignalOf = (portKey: string, port: Port): HdlSignalPayload => {
  const signal = port.extensions?.find(
    (extension) =>
      extension.featureKey === 'hdlSignal' && extension.key === 'signal',
  )?.payload;

  if (!isRecord(signal)) {
    throw new Error(`Port ${portKey} is missing HDL signal payload.`);
  }

  return assertSignal(
    {
      width: signal.width as number,
      signed: signal.signed as boolean,
    },
    `port ${portKey}`,
  );
};

const moduleNameOf = (logicUnit: LogicUnit): string => {
  const payload = logicUnit.core.extensions?.find(
    (extension) =>
      extension.featureKey === 'hdlModule' && extension.key === 'module',
  )?.payload;

  if (!isRecord(payload) || typeof payload.moduleName !== 'string') {
    throw new Error('LogicUnit is missing HDL module payload.');
  }

  const modulePayload: HdlModulePayload = { moduleName: payload.moduleName };
  assertIdentifier(modulePayload.moduleName, 'top module');
  return modulePayload.moduleName;
};

const structuralPayloadOf = (logicUnit: LogicUnit): StructuralPayload => {
  const payload = logicUnit.core.extensions?.find(
    (extension) =>
      extension.featureKey === 'hdlStructuralSlices' &&
      extension.key === 'module-structure',
  )?.payload;

  if (!isRecord(payload) || !Array.isArray(payload.wires)) {
    throw new Error('LogicUnit is missing structural module payload.');
  }

  if (!Array.isArray(payload.instances) || payload.instances.length === 0) {
    throw new Error('Structural module payload must contain instances.');
  }

  const wires = payload.wires.map((wire, index): StructuralWire => {
    if (!isRecord(wire) || typeof wire.name !== 'string') {
      throw new Error(`Invalid structural wire at index ${index}.`);
    }

    assertIdentifier(wire.name, `wire ${index}`);

    if (!isRecord(wire.signal)) {
      throw new Error(`Wire ${wire.name} is missing signal payload.`);
    }

    return {
      name: wire.name,
      signal: assertSignal(
        {
          width: wire.signal.width as number,
          signed: wire.signal.signed as boolean,
        },
        `wire ${wire.name}`,
      ),
    };
  });

  const instances = payload.instances.map(
    (instance, index): StructuralInstance => {
      if (
        !isRecord(instance) ||
        typeof instance.module !== 'string' ||
        typeof instance.instance !== 'string' ||
        !isRecord(instance.connections)
      ) {
        throw new Error(`Invalid structural instance at index ${index}.`);
      }

      assertIdentifier(instance.module, `instance ${index} module`);
      assertIdentifier(instance.instance, `instance ${index} name`);

      const connections: { [portKey: string]: string } = {};
      for (const [portKey, signalName] of Object.entries(
        instance.connections,
      )) {
        assertIdentifier(portKey, `instance ${instance.instance} port`);
        if (typeof signalName !== 'string') {
          throw new Error(
            `Instance ${instance.instance}.${portKey} connection must be a signal name.`,
          );
        }
        assertIdentifier(
          signalName,
          `instance ${instance.instance}.${portKey} signal`,
        );
        connections[portKey] = signalName;
      }

      return {
        module: instance.module,
        instance: instance.instance,
        connections,
      };
    },
  );

  return { wires, instances };
};

const knownSignalsOf = (logicUnit: LogicUnit, structure: StructuralPayload) =>
  new Set([
    ...Object.keys(logicUnit.core.ports),
    ...structure.wires.map((wire) => wire.name),
  ]);

const validateStructure = (
  logicUnit: LogicUnit,
  structure: StructuralPayload,
  libraryModules: HdlLibraryModule[],
): void => {
  const knownSignals = knownSignalsOf(logicUnit, structure);
  const libraryByName = new Map(
    libraryModules.map((module) => [module.moduleName, module]),
  );

  for (const module of libraryModules) {
    assertIdentifier(module.moduleName, 'library module');
    for (const [portKey, port] of Object.entries(module.ports)) {
      assertIdentifier(portKey, `library module ${module.moduleName} port`);
      assertSignal(port.signal, `${module.moduleName}.${portKey}`);
    }
  }

  for (const instance of structure.instances) {
    const libraryModule = libraryByName.get(instance.module);
    if (!libraryModule) {
      throw new Error(
        `Instance ${instance.instance} references unknown module ${instance.module}.`,
      );
    }

    for (const portKey of Object.keys(libraryModule.ports)) {
      if (!(portKey in instance.connections)) {
        throw new Error(
          `Instance ${instance.instance} is missing port ${portKey}.`,
        );
      }
    }

    for (const [portKey, signalName] of Object.entries(instance.connections)) {
      if (!(portKey in libraryModule.ports)) {
        throw new Error(
          `Instance ${instance.instance} has unknown port ${portKey}.`,
        );
      }

      if (!knownSignals.has(signalName)) {
        throw new Error(
          `Instance ${instance.instance}.${portKey} references unknown signal ${signalName}.`,
        );
      }
    }
  }
};

const emitLibraryModule = (module: HdlLibraryModule): string => {
  const portKeys = Object.keys(module.ports);
  const declarations = portKeys.map((portKey, index) => {
    const port = module.ports[portKey];
    const comma = index === portKeys.length - 1 ? '' : ',';
    return `  ${port.boundary} wire${signalRange(port.signal)} ${portKey}${comma}`;
  });

  return [
    `module ${module.moduleName}(`,
    ...declarations,
    ');',
    ...module.body.map((line) => `  ${line}`),
    'endmodule',
  ].join('\n');
};

const emitPortDeclaration = (
  [portKey, port]: [string, Port],
  index: number,
  all: [string, Port][],
): string => {
  const comma = index === all.length - 1 ? '' : ',';
  return `  ${port.boundary} wire${signalRange(portSignalOf(portKey, port))} ${portKey}${comma}`;
};

const emitWireDeclaration = (wire: StructuralWire): string =>
  `  wire${signalRange(wire.signal)} ${wire.name};`;

const emitInstance = (instance: StructuralInstance): string => {
  const connections = Object.entries(instance.connections)
    .map(([portKey, signalName]) => `.${portKey}(${signalName})`)
    .join(', ');

  return `  ${instance.module} ${instance.instance}(${connections});`;
};

const emitModules = (
  logicUnit: LogicUnit,
  options: HdlEmitOptions,
): string => {
  const structure = structuralPayloadOf(logicUnit);
  validateStructure(logicUnit, structure, options.libraryModules);

  const moduleName = moduleNameOf(logicUnit);
  const portEntries = Object.entries(logicUnit.core.ports);

  return [
    ...options.libraryModules.map(emitLibraryModule),
    '',
    `module ${moduleName}(`,
    ...portEntries.map(emitPortDeclaration),
    ');',
    ...structure.wires.map(emitWireDeclaration),
    ...structure.instances.map(emitInstance),
    'endmodule',
    '',
  ].join('\n');
};

const bitLiteral = (value: BitValue): string => `1'b${value}`;

const assignmentLine = (
  vector: HdlTestVector,
  inputKeys: string[],
): string =>
  inputKeys
    .map((inputKey) => {
      const value = vector.inputs[inputKey];
      if (value === undefined) {
        throw new Error(
          `Test vector ${vector.name} is missing input ${inputKey}.`,
        );
      }
      return `${inputKey} = ${bitLiteral(value)}`;
    })
    .join('; ');

const assertionLines = (
  vector: HdlTestVector,
  outputKeys: string[],
): string[] =>
  outputKeys.map((outputKey) => {
    const value = vector.outputs[outputKey];
    if (value === undefined) {
      throw new Error(
        `Test vector ${vector.name} is missing output ${outputKey}.`,
      );
    }

    return `    if (${outputKey} !== ${bitLiteral(value)}) $fatal(1, "${vector.name} ${outputKey} failed");`;
  });

const emitTestbench = (
  logicUnit: LogicUnit,
  testVectors: HdlTestVector[],
): string => {
  const moduleName = moduleNameOf(logicUnit);
  const inputKeys = Object.entries(logicUnit.core.ports)
    .filter(([, port]) => port.boundary === 'input')
    .map(([portKey]) => portKey);
  const outputKeys = Object.entries(logicUnit.core.ports)
    .filter(([, port]) => port.boundary === 'output')
    .map(([portKey]) => portKey);
  const regs = inputKeys.map((inputKey) => `  reg ${inputKey};`);
  const wires = outputKeys.map((outputKey) => `  wire ${outputKey};`);
  const dutConnections = [...inputKeys, ...outputKeys]
    .map((portKey) => `.${portKey}(${portKey})`)
    .join(', ');
  const vectorLines = testVectors.flatMap((vector) => [
    `    // ${vector.name}`,
    `    ${assignmentLine(vector, inputKeys)}; #1;`,
    ...assertionLines(vector, outputKeys),
  ]);

  return [
    '`timescale 1ns/1ps',
    `module ${moduleName}_tb;`,
    ...regs,
    ...wires,
    '',
    `  ${moduleName} dut(${dutConnections});`,
    '',
    '  initial begin',
    ...vectorLines,
    '    $display("H5_PASS");',
    '    $finish;',
    '  end',
    'endmodule',
    '',
  ].join('\n');
};

export const emitH5Verilog = (
  logicUnit: LogicUnit,
  options: HdlEmitOptions,
): HdlArtifacts => {
  const outputDir = options.outputDir ?? GENERATED_DIR;
  mkdirSync(outputDir, { recursive: true });

  const modulePath = join(outputDir, 'h5_modules.v');
  const testbenchPath = join(outputDir, 'h5_tb.v');
  const moduleText = emitModules(logicUnit, options);
  const testbenchText = emitTestbench(logicUnit, options.testVectors);

  writeFileSync(modulePath, moduleText);
  writeFileSync(testbenchPath, testbenchText);

  return { modulePath, testbenchPath, moduleText, testbenchText };
};
