import type { BehaviorGraph } from "../../types/index.js";

export class DependencyResolver {
  criticalPath(graph: BehaviorGraph): string[] {
    return graph.nodes
      .filter((node) => node.kind === "behavior" || node.kind === "refutation")
      .map((node) => node.label);
  }
}
