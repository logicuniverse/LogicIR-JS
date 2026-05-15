import {
  applyNumberPropertyCommand,
  runOperator,
} from './legacy-node-snapshot';
import type {
  EndpointRef,
  EventKey,
  NodeId,
  RuntimeGraph,
  RuntimeNode,
  RuntimeSnapshot,
  RuntimeValue,
  StreamConnection,
  TraceEntry,
} from './types';

export class HeadlessReactiveRuntime {
  private nodes = new Map<NodeId, RuntimeNode>();
  private values: Record<NodeId, Record<string, RuntimeValue>> = {};
  private trace: TraceEntry[] = [];
  private streamConnections: StreamConnection[] = [];

  constructor(graph: RuntimeGraph) {
    this.streamConnections = graph.streamConnections;
    for (const node of graph.nodes) {
      this.nodes.set(node.id, node);
      this.values[node.id] = {};
    }
  }

  initialize(): RuntimeSnapshot {
    for (const node of this.nodes.values()) {
      if (node.kind === 'property') {
        this.setValue(node.id, 'output', node.initial, 'initialize');
      } else if (node.kind === 'number-property') {
        this.setValue(node.id, 'value', node.initial, 'initialize');
      }
    }
    this.recomputeAll();
    return this.snapshot();
  }

  emit(nodeId: NodeId, eventKey: EventKey, value: RuntimeValue): RuntimeSnapshot {
    this.trace.push({ kind: 'event', nodeId, eventKey, value });
    this.deliver({ nodeId, portKey: eventKey }, value);
    this.recomputeAll();
    return this.snapshot();
  }

  read(endpoint: EndpointRef): RuntimeValue | undefined {
    return this.values[endpoint.nodeId]?.[endpoint.portKey];
  }

  snapshot(): RuntimeSnapshot {
    return {
      values: cloneValues(this.values),
      trace: [...this.trace],
    };
  }

  private deliver(endpoint: EndpointRef, value: RuntimeValue): void {
    const node = this.nodes.get(endpoint.nodeId);
    if (!node) {
      throw new Error(`Unknown node ${endpoint.nodeId}.`);
    }

    if (node.kind === 'number-property') {
      const current = this.read({ nodeId: node.id, portKey: 'value' });
      const next = applyNumberPropertyCommand(
        typeof current === 'number' ? current : node.initial,
        endpoint.portKey,
        value,
      );
      this.setValue(node.id, 'value', next, 'state');
    } else if (node.kind === 'property') {
      this.setValue(node.id, 'output', value, 'state');
    } else if (
      (node.kind === 'event-merge' || node.kind === 'event-mux') &&
      endpoint.portKey !== 'out'
    ) {
      this.forward({ nodeId: node.id, portKey: 'out' }, value);
    }

    this.forward(endpoint, value);
  }

  private forward(from: EndpointRef, value: RuntimeValue): void {
    for (const connection of this.streamConnections) {
      if (!sameEndpoint(connection.from, from)) {
        continue;
      }
      this.trace.push({
        kind: 'forward',
        from,
        to: connection.to,
        value,
      });
      this.deliver(connection.to, value);
    }
  }

  private recomputeAll(): void {
    let changed = true;
    let remainingPasses = this.nodes.size + 1;

    while (changed && remainingPasses > 0) {
      changed = false;
      remainingPasses--;
      for (const node of this.nodes.values()) {
        if (node.kind !== 'operator') {
          continue;
        }
        const a = this.read(node.inputs.a);
        const b = this.read(node.inputs.b);
        if (a === undefined || b === undefined) {
          continue;
        }
        const next = runOperator(node.operator, a, b);
        const current = this.read({ nodeId: node.id, portKey: 'value' });
        if (!Object.is(current, next)) {
          this.setValue(node.id, 'value', next, 'derived');
          changed = true;
        }
      }
    }

    if (remainingPasses === 0) {
      throw new Error('Reactive recomputation did not stabilize.');
    }
  }

  private setValue(
    nodeId: NodeId,
    portKey: string,
    value: RuntimeValue,
    kind: 'initialize' | 'state' | 'derived',
  ): void {
    this.values[nodeId][portKey] = value;
    this.trace.push({ kind, nodeId, portKey, value });
  }
}

const sameEndpoint = (left: EndpointRef, right: EndpointRef): boolean =>
  left.nodeId === right.nodeId && left.portKey === right.portKey;

const cloneValues = (
  values: Record<NodeId, Record<string, RuntimeValue>>,
): Record<NodeId, Record<string, RuntimeValue>> =>
  JSON.parse(JSON.stringify(values)) as Record<NodeId, Record<string, RuntimeValue>>;
