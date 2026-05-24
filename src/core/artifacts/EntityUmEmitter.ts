import type { EntitySpec, ProjectSession } from "../../types/index.js";

export class EntityUmEmitter {
  emit(entity: EntitySpec, session: ProjectSession): string {
    const properties = entity.properties
      .map((property) => `  property ${property.name} uses ${property.semanticType}`)
      .join("\n");
    const behaviors = entity.behaviors.map((behavior) => `  behavior ${behavior.name}`).join("\n");
    const emittedEvents = entity.properties
      .flatMap((property) => property.events)
      .map((event) => `  emits ${event.name}`)
      .join("\n");

    return `entity ${entity.name} {
  canonical_label "${entity.canonicalLabel}"
  domain "${session.domain}"

${properties}

${behaviors || "  // behavior graph derived from properties"}

${emittedEvents || "  // no events declared"}
}`;
  }
}
