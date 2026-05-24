import type { ProjectSession, ValidationIssue, ValidationResult } from "../../types/index.js";

const pascalCase = /^[A-Z][A-Za-z0-9]*$/;
const camelCase = /^[a-z][A-Za-z0-9]*$/;
const dotLabel = /^[a-z0-9]+(\.[a-z0-9]+)*$/;

export class ProjectValidator {
  validate(session: ProjectSession): ValidationResult {
    const issues: ValidationIssue[] = [];

    for (const entity of session.entities) {
      if (!pascalCase.test(entity.name)) {
        issues.push({ severity: "error", code: "entity.name.pascal_case", message: `${entity.name} must be PascalCase` });
      }
      if (!dotLabel.test(entity.canonicalLabel)) {
        issues.push({
          severity: "error",
          code: "entity.canonical_label.dot_notation",
          message: `${entity.canonicalLabel} must be lowercase dot notation`
        });
      }

      for (const property of entity.properties) {
        if (!camelCase.test(property.name)) {
          issues.push({
            severity: "error",
            code: "property.name.camel_case",
            message: `${entity.name}.${property.name} must use camelCase`
          });
        }
        if (!dotLabel.test(property.canonicalLabel)) {
          issues.push({
            severity: "error",
            code: "property.canonical_label.dot_notation",
            message: `${property.canonicalLabel} must be lowercase dot notation`
          });
        }
        if (!property.semanticType) {
          issues.push({
            severity: "error",
            code: "property.semantic_type.required",
            message: `${property.entityName}.${property.name} must have SemanticType`
          });
        }
        if (!property.primitiveEnvelope) {
          issues.push({
            severity: "error",
            code: "property.primitive_envelope.required",
            message: `${property.entityName}.${property.name} must have primitive envelope`
          });
        }
        if (property.behaviors.length === 0 && !property.justification) {
          issues.push({
            severity: "error",
            code: "property.behavior_or_justification.required",
            message: `${property.entityName}.${property.name} must have at least one behavior or justification`
          });
        }

        const negativeExpects = new Set(
          property.tests.flatMap((test) => test.cases).filter((testCase) => testCase.kind === "negative").map((testCase) => testCase.expects)
        );
        for (const refutation of property.refutations) {
          if (!negativeExpects.has(refutation.name)) {
            issues.push({
              severity: "error",
              code: "refutation.negative_test.required",
              message: `${refutation.name} must have a negative test`
            });
          }
        }

        const hasPositive = property.tests.some((test) => test.cases.some((testCase) => testCase.kind === "positive"));
        for (const event of property.events) {
          if (/\.success$/i.test(event.name) && !hasPositive) {
            issues.push({
              severity: "error",
              code: "success_event.positive_test.required",
              message: `${event.name} must have a positive test`
            });
          }
        }
      }
    }

    return { valid: issues.every((issue) => issue.severity !== "error"), issues };
  }
}
