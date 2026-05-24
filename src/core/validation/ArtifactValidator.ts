import type { UniversalArtifact, ValidationIssue } from "../../types/index.js";

export class ArtifactValidator {
  validate(artifact: UniversalArtifact): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    if (!artifact.version) {
      issues.push({
        severity: "error",
        code: "artifact.version.required",
        message: `${artifact.canonicalName} must have version`
      });
    }
    if (!artifact.path) {
      issues.push({
        severity: "error",
        code: "artifact.path.required",
        message: `${artifact.canonicalName} must have repository path`
      });
    }
    return issues;
  }
}
