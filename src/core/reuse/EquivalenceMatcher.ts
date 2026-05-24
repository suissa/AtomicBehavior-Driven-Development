import type { UniversalArtifact } from "../../types/index.js";

export class EquivalenceMatcher {
  equivalentSignature(a: UniversalArtifact, b: UniversalArtifact): boolean {
    return (
      a.kind === b.kind &&
      a.canonicalLabel === b.canonicalLabel &&
      (a.semanticType ?? a.canonicalName) === (b.semanticType ?? b.canonicalName)
    );
  }

  compatibleContract(candidate: UniversalArtifact, requested: UniversalArtifact): boolean {
    const candidateBehaviors = new Set(candidate.behaviors ?? []);
    return (requested.behaviors ?? []).every((behavior) => candidateBehaviors.has(behavior));
  }
}
