"use strict";
/**
 * Projection conformance fixture matrix.
 *
 * This file is intentionally data-only. `conformance-smoke.ts` owns executable
 * fixture construction and checks that the runnable cases stay aligned with
 * this matrix.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.coreValidationPlannerConformanceFixtures = exports.unsupportedRequiredConformanceFixtures = exports.diagnosticConformanceFixtures = exports.positiveConformanceFixtures = exports.expectedConformanceTargets = void 0;
exports.expectedConformanceTargets = [
    'core-validator',
    'type-system',
    'js-runtime',
    'python-runtime',
    'verilog-hdl',
];
exports.positiveConformanceFixtures = [
    {
        target: 'core-validator',
        name: 'core accepts base combinational fixture',
    },
    {
        target: 'type-system',
        name: 'type-system accepts exact typed adder',
    },
    {
        target: 'js-runtime',
        name: 'JS planner accepts stateful counter fixture',
    },
    {
        target: 'js-runtime',
        name: 'JS planner accepts projector-adapter retained-current',
    },
    {
        target: 'python-runtime',
        name: 'Python planner accepts stateful counter fixture',
    },
    {
        target: 'python-runtime',
        name: 'Python planner accepts projector-adapter retained-current',
    },
    {
        target: 'python-runtime',
        name: 'Python planner accepts context-manager resource lifecycle',
    },
    {
        target: 'verilog-hdl',
        name: 'Verilog planner accepts typed bound adder fixture',
    },
];
exports.diagnosticConformanceFixtures = [
    {
        target: 'core-validator',
        name: 'core rejects impossible port interaction',
        code: 'VAL-005',
    },
    {
        target: 'type-system',
        name: 'type-system rejects exact mismatch',
        code: 'EXT-123',
    },
    {
        target: 'js-runtime',
        name: 'JS capability rejects unsupported async invocation',
        code: 'EXT-201',
    },
    {
        target: 'js-runtime',
        name: 'JS planner rejects awaitBeforeNext=false before lowering',
        code: 'JS-004',
    },
    {
        target: 'js-runtime',
        name: 'JS planner rejects required fail-projection policy before lowering',
        code: 'JS-001',
    },
    {
        target: 'js-runtime',
        name: 'JS planner rejects use-error-port without portKey before lowering',
        code: 'JS-005',
    },
    {
        target: 'js-runtime',
        name: 'JS planner rejects owner-less payloadPath retained-current before lowering',
        code: 'JS-006',
    },
    {
        target: 'js-runtime',
        name: 'JS planner rejects unsupported late-bound transactional dynamic fulfillment before lowering',
        code: 'JS-003',
    },
    {
        target: 'python-runtime',
        name: 'Python capability rejects unsupported coroutine invocation',
        code: 'EXT-301',
    },
    {
        target: 'python-runtime',
        name: 'Python planner rejects awaitBeforeNext=false before lowering',
        code: 'PY-004',
    },
    {
        target: 'python-runtime',
        name: 'Python planner rejects required return-exception policy before lowering',
        code: 'PY-001',
    },
    {
        target: 'python-runtime',
        name: 'Python planner rejects use-error-port without portKey before lowering',
        code: 'PY-007',
    },
    {
        target: 'python-runtime',
        name: 'Python planner rejects owner-less payloadPath retained-current before lowering',
        code: 'PY-008',
    },
    {
        target: 'python-runtime',
        name: 'Python planner rejects unsupported late-bound transactional dynamic fulfillment before lowering',
        code: 'PY-003',
    },
    {
        target: 'python-runtime',
        name: 'Python planner rejects required custom resource lifecycle before lowering',
        code: 'PY-005',
    },
    {
        target: 'python-runtime',
        name: 'Python planner rejects required asyncio-task concurrency before lowering',
        code: 'PY-006',
    },
    {
        target: 'python-runtime',
        name: 'Python capability rejects unsupported resource lifecycle',
        code: 'EXT-306',
    },
    {
        target: 'verilog-hdl',
        name: 'Verilog planner requires signal types',
        code: 'HDL-001',
    },
    {
        target: 'verilog-hdl',
        name: 'Verilog planner rejects ambiguous structural slice fan-in',
        code: 'HDL-010',
    },
];
exports.unsupportedRequiredConformanceFixtures = [
    {
        target: 'core-validator',
        name: 'core fails unsupported required extension',
        code: 'VAL-045',
    },
    {
        target: 'type-system',
        name: 'type-system fails unsupported required extension',
        code: 'VAL-045',
    },
    {
        target: 'js-runtime',
        name: 'JS fails unsupported required extension',
        code: 'VAL-045',
    },
    {
        target: 'python-runtime',
        name: 'Python fails unsupported required extension',
        code: 'VAL-045',
    },
    {
        target: 'verilog-hdl',
        name: 'Verilog fails unsupported required extension',
        code: 'VAL-045',
    },
];
exports.coreValidationPlannerConformanceFixtures = [
    {
        target: 'js-runtime',
        name: 'JS planner runs core validation before lowering',
        code: 'VAL-005',
    },
    {
        target: 'python-runtime',
        name: 'Python planner runs core validation before lowering',
        code: 'VAL-005',
    },
    {
        target: 'verilog-hdl',
        name: 'Verilog planner runs core validation before lowering',
        code: 'VAL-005',
    },
];
