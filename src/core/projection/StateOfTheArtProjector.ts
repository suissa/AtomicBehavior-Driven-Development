import type { BehaviorGraph, GeneratedProjectPlan, ProjectConfig } from "../../types/index.js";
import type { ArchitectureProjector } from "./ArchitectureProjector.js";

export class StateOfTheArtProjector implements ArchitectureProjector {
  mode = "state-of-the-art";

  project(graph: BehaviorGraph, config: ProjectConfig): GeneratedProjectPlan {
    return {
      mode: this.mode,
      projectName: config.projectName,
      summary: "PASS multi-plane projection plan generated from the same ABDD semantic graph.",
      targets: [
        {
          name: "UI Plane",
          kind: "TypeScript",
          files: graph.nodes.filter((node) => node.kind === "property").map((node) => `planes/ui/${node.label}.tsx`),
          notes: ["semantic forms and interaction states"]
        },
        {
          name: "Semantic Algebra Plane",
          kind: "Prolog",
          files: graph.nodes.filter((node) => node.kind === "behavior").map((node) => `planes/semantic/${node.label}.pro`),
          notes: ["composed semantic judgments"]
        },
        {
          name: "Atomic Evidence Plane",
          kind: "Haskell",
          files: graph.nodes.filter((node) => node.kind === "refutation").map((node) => `planes/evidence/${node.label}.hs`),
          notes: ["proof and refutation witnesses"]
        },
        {
          name: "Data Plane",
          kind: "Polyglot",
          files: ["postgres/write.sql", "mongo/read-projections.js", "qdrant/vector-index.json", "neo4j/graph.cypher"],
          notes: ["entity views are split by write, read, vector and graph concerns"]
        }
      ],
      generatedAt: new Date().toISOString()
    };
  }
}
