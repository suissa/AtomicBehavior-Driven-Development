import type { BehaviorGraph, GeneratedProjectPlan, ProjectConfig } from "../../types/index.js";
import type { ArchitectureProjector } from "./ArchitectureProjector.js";

export class BeginnerProjector implements ArchitectureProjector {
  mode = "beginner";

  project(graph: BehaviorGraph, config: ProjectConfig): GeneratedProjectPlan {
    return {
      mode: this.mode,
      projectName: config.projectName,
      summary: "Modular monolith projection plan generated from ABDD semantic graph.",
      targets: [
        {
          name: "frontend",
          kind: "NextJS",
          files: graph.nodes.filter((node) => node.kind === "property").map((node) => `app/forms/${node.label}.tsx`),
          notes: ["forms and client validators are generated from SemanticTypes"]
        },
        {
          name: "backend",
          kind: "NestJS",
          files: graph.nodes.filter((node) => node.kind === "entity").map((node) => `src/modules/${node.label}/index.ts`),
          notes: ["DTOs, services and ports are generated from entity specs"]
        },
        {
          name: "database",
          kind: "PostgreSQL",
          files: ["prisma/schema.prisma", "migrations/0001_init.sql"],
          notes: ["constraints are derived from property refutations and primitive envelopes"]
        }
      ],
      generatedAt: new Date().toISOString()
    };
  }
}
