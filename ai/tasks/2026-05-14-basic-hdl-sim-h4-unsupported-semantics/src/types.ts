export type FeatureUse = {
  namespace: string;
  key: string;
  version?: string;
};

export type LogicUnit = {
  schemaVersion: '0.0.0-draft';
  features: Record<string, FeatureUse>;
  requirements: Record<string, unknown>;
  core: {
    kindOrganization: { kind: 'combinational' };
    ports: Record<string, unknown>;
    connections: Record<string, unknown>;
    closures: Record<string, unknown>;
    luis: Record<string, unknown>;
  };
};

export type Diagnostic = {
  code: 'HDL_UNSUPPORTED_REQUIRED_FEATURE';
  severity: 'error';
  feature: string;
  message: string;
};

export type ProjectionResult =
  | {
      kind: 'projected';
      artifactPath: string;
      diagnostics: Diagnostic[];
    }
  | {
      kind: 'rejected';
      diagnostics: Diagnostic[];
    };
