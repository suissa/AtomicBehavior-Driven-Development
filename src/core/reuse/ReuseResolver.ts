import type {
  ArtifactReference,
  ArtifactKind,
  ReuseDecision,
  ReuseReport,
  UniversalArtifact
} from "../../types/index.js";
import { uniqueBy } from "../utils/fs.js";

export function artifactRef(artifact: UniversalArtifact): ArtifactReference {
  return {
    kind: artifact.kind,
    canonicalName: artifact.canonicalName,
    canonicalLabel: artifact.canonicalLabel,
    version: artifact.version,
    path: artifact.path,
    maturity: artifact.maturity,
    source: "universal-repository"
  };
}

export class ReuseResolver {
  private readonly reused = new Map<string, ArtifactReference>();
  private readonly decisions: ReuseDecision[] = [];

  reuse(requested: string, artifact: UniversalArtifact, reason = "semantic artifact reused"): ArtifactReference {
    const ref = artifactRef(artifact);
    this.reused.set(`${ref.kind}:${ref.canonicalName}`, ref);
    this.decisions.push({
      requested,
      selected: artifact.canonicalName,
      kind: artifact.kind,
      decision: "reused",
      reason,
      artifactRef: ref
    });
    return ref;
  }

  unresolved(kind: ArtifactKind, requested: string, reason: string): ReuseDecision {
    const decision: ReuseDecision = {
      requested,
      selected: requested,
      kind,
      decision: "unresolved",
      reason
    };
    this.decisions.push(decision);
    return decision;
  }

  report(): ReuseReport {
    return {
      reused: uniqueBy([...this.reused.values()], (ref) => `${ref.kind}:${ref.canonicalName}`),
      generated: [],
      custom: [],
      unresolved: [],
      decisions: this.decisions,
      updatedAt: new Date().toISOString()
    };
  }
}
