export type ArtifactKind =
  | "semantic-type"
  | "entity"
  | "property"
  | "behavior"
  | "refutation"
  | "event"
  | "test"
  | "template";

export type ArtifactSource = "reused" | "generated" | "custom";
export type ArtifactMaturity = "experimental" | "stable" | "deprecated";

export type PrimitiveEnvelope =
  | "Word"
  | "Word(Number)"
  | "Word(Email)"
  | "Number"
  | "Money"
  | "DateTime"
  | "UUID"
  | "Boolean"
  | string;

export type ArtifactReference = {
  kind: ArtifactKind;
  canonicalName: string;
  canonicalLabel: string;
  version: string;
  path: string;
  maturity: ArtifactMaturity;
  source: "universal-repository" | "project";
};

export type AtomicBehaviorSpec = {
  name: string;
  canonicalLabel: string;
  behaviorType: "normalizer" | "validator" | "constructor" | "binder" | "emitter" | "oracle" | "unknown";
  source: ArtifactSource;
  artifactRef?: ArtifactReference;
};

export type RefutationSpec = {
  name: string;
  canonicalLabel: string;
  source: ArtifactSource;
  artifactRef?: ArtifactReference;
};

export type EventContractSpec = {
  name: string;
  canonicalLabel: string;
  source: ArtifactSource;
  artifactRef?: ArtifactReference;
};

export type TestCaseSpec = {
  name: string;
  kind: "positive" | "negative" | "healing";
  expects?: string;
};

export type TestOracleSpec = {
  name: string;
  canonicalLabel: string;
  cases: TestCaseSpec[];
  source: ArtifactSource;
  artifactRef?: ArtifactReference;
};

export type SemanticTypeSpec = {
  name: string;
  canonicalLabel: string;
  primitiveEnvelope: PrimitiveEnvelope;
  source: ArtifactSource;
  artifactRef?: ArtifactReference;
};

export type PropertySpec = {
  entityName: string;
  name: string;
  canonicalLabel: string;
  semanticType: string;
  primitiveEnvelope: PrimitiveEnvelope;
  required: boolean;
  behaviors: AtomicBehaviorSpec[];
  refutations: RefutationSpec[];
  events: EventContractSpec[];
  tests: TestOracleSpec[];
  source: ArtifactSource;
  artifactRef?: ArtifactReference;
  justification?: string;
};

export type EntitySpec = {
  name: string;
  canonicalLabel: string;
  description?: string;
  properties: PropertySpec[];
  behaviors: AtomicBehaviorSpec[];
  source: ArtifactSource;
  artifactRef?: ArtifactReference;
};

export type ArchitecturePlane = {
  name: string;
  language: string;
  purpose: string;
};

export type GenerationMode =
  | {
      kind: "beginner";
      language: string;
      frontend: string;
      backend: string;
      database: string;
      architecture: "modular-monolith" | "mvc" | "clean-architecture" | "custom";
    }
  | {
      kind: "state-of-the-art";
      architecture: "pass-multiplane";
      planes: ArchitecturePlane[];
    };

export type ProjectIntent = {
  domain: string;
  systemType: string;
  problemStatement: string;
};

export type ProjectSession = {
  id: string;
  projectName: string;
  domain: string;
  systemType: string;
  problemStatement: string;
  entities: EntitySpec[];
  decisions: ReuseDecision[];
  mode?: GenerationMode;
  createdAt: string;
  updatedAt: string;
};

export type DomainProfile = {
  domain: string;
  label: string;
  systemTypes: string[];
};

export type SystemTypeProfile = {
  systemType: string;
  label: string;
  recommendedEntities: string[];
};

export type RepositorySearchFilters = {
  kind?: ArtifactKind;
  domain?: string;
  entity?: string;
  property?: string;
  semanticType?: string;
  behavior?: string;
  event?: string;
  refutation?: string;
  maturity?: ArtifactMaturity;
  architecture?: string;
};

export type RepositorySearchResult = {
  artifact: UniversalArtifact;
  score: number;
  recommended: boolean;
  reason: string;
};

export type ReuseDecision = {
  requested: string;
  selected: string;
  kind: ArtifactKind;
  decision: "reused" | "generated" | "custom" | "unresolved";
  reason: string;
  artifactRef?: ArtifactReference;
};

export type ReuseReport = {
  reused: ArtifactReference[];
  generated: ArtifactReference[];
  custom: ArtifactReference[];
  unresolved: UnresolvedArtifact[];
  decisions: ReuseDecision[];
  updatedAt: string;
};

export type UnresolvedArtifact = {
  kind: ArtifactKind;
  canonicalName: string;
  canonicalLabel: string;
  reason: string;
  suggestedPath: string;
  version: string;
};

export type CollaborationManifest = {
  projectName: string;
  artifacts: CollaborationArtifact[];
  pipeline: string[];
  createdAt: string;
};

export type CollaborationArtifact = {
  artifact: UnresolvedArtifact;
  semanticSignature: string;
  tests: string[];
  refutations: string[];
  events: string[];
  documentation: string;
  version: string;
  license: string;
  author: string;
  hash: string;
  compatibility: string[];
};

export type UniversalArtifact = {
  id: string;
  kind: ArtifactKind;
  canonicalName: string;
  canonicalLabel: string;
  version: string;
  maturity: ArtifactMaturity;
  path: string;
  aliases?: string[];
  tags?: string[];
  domainTags?: string[];
  systemTypes?: string[];
  architectureCompatibility?: string[];
  description?: string;
  entity?: string;
  property?: string;
  semanticType?: string;
  primitiveEnvelope?: PrimitiveEnvelope;
  required?: boolean;
  properties?: string[];
  behaviors?: string[];
  refutations?: string[];
  events?: string[];
  tests?: {
    positive?: string[];
    negative?: Array<{ name: string; expects: string }>;
    healing?: Array<{ name: string; expects: string }>;
  };
};

export type BehaviorGraphNode = {
  id: string;
  label: string;
  kind: "entity" | "property" | "behavior" | "refutation" | "event" | "test";
};

export type BehaviorGraphEdge = {
  from: string;
  to: string;
  relation: "owns" | "uses" | "emits" | "tests" | "refutes" | "depends_on";
};

export type BehaviorGraph = {
  nodes: BehaviorGraphNode[];
  edges: BehaviorGraphEdge[];
};

export type ProjectConfig = {
  projectName: string;
  mode: GenerationMode;
};

export type GeneratedProjectPlan = {
  mode: string;
  projectName: string;
  summary: string;
  targets: Array<{
    name: string;
    kind: string;
    files: string[];
    notes: string[];
  }>;
  generatedAt: string;
};

export type ValidationIssue = {
  severity: "error" | "warning";
  code: string;
  message: string;
  path?: string;
};

export type ValidationResult = {
  valid: boolean;
  issues: ValidationIssue[];
};
