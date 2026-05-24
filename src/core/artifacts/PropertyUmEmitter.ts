import type { PropertySpec } from "../../types/index.js";

export class PropertyUmEmitter {
  emit(property: PropertySpec): string {
    const normalizers = property.behaviors
      .filter((behavior) => behavior.behaviorType === "normalizer")
      .map((behavior) => `  normalizer ${behavior.name}`)
      .join("\n");
    const validators = property.behaviors
      .filter((behavior) => behavior.behaviorType !== "normalizer")
      .map((behavior) => `  validator ${behavior.name}`)
      .join("\n");
    const refutations = property.refutations.map((refutation) => `  refutation ${refutation.name}`).join("\n");
    const events = property.events.map((event) => `  event ${event.name}`).join("\n");
    const testOracles = property.tests.map((test) => `  test_oracle ${test.name}`).join("\n");

    return `property ${property.entityName}.${property.name} {
  canonical_label "${property.canonicalLabel}"
  semantic_type ${property.semanticType}
  primitive_envelope ${property.primitiveEnvelope}

  required ${String(property.required)}

${normalizers || "  // no normalizer declared"}
${validators || "  // no validator declared"}

${refutations || "  // no refutations declared"}

${events || "  // no events declared"}

${testOracles || "  // no test oracle declared"}
}`;
  }
}
