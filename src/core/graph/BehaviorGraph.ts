import type { BehaviorGraph, EntitySpec, ProjectSession } from "../../types/index.js";

export class BehaviorGraphBuilder {
  build(session: ProjectSession): BehaviorGraph {
    const graph: BehaviorGraph = { nodes: [], edges: [] };

    for (const entity of session.entities) {
      this.addNode(graph, `entity:${entity.name}`, entity.name, "entity");
      for (const property of entity.properties) {
        const propertyId = `property:${entity.name}.${property.name}`;
        this.addNode(graph, propertyId, `${entity.name}.${property.name}`, "property");
        graph.edges.push({ from: `entity:${entity.name}`, to: propertyId, relation: "owns" });

        this.addPropertyArtifacts(graph, propertyId, property);
      }
    }

    return graph;
  }

  private addPropertyArtifacts(graph: BehaviorGraph, propertyId: string, property: EntitySpec["properties"][number]) {
    for (const behavior of property.behaviors) {
      const id = `behavior:${behavior.name}`;
      this.addNode(graph, id, behavior.name, "behavior");
      graph.edges.push({ from: propertyId, to: id, relation: "uses" });
    }
    for (const refutation of property.refutations) {
      const id = `refutation:${refutation.name}`;
      this.addNode(graph, id, refutation.name, "refutation");
      graph.edges.push({ from: propertyId, to: id, relation: "refutes" });
    }
    for (const event of property.events) {
      const id = `event:${event.name}`;
      this.addNode(graph, id, event.name, "event");
      graph.edges.push({ from: propertyId, to: id, relation: "emits" });
    }
    for (const test of property.tests) {
      const id = `test:${test.name}`;
      this.addNode(graph, id, test.name, "test");
      graph.edges.push({ from: propertyId, to: id, relation: "tests" });
    }
  }

  private addNode(graph: BehaviorGraph, id: string, label: string, kind: BehaviorGraph["nodes"][number]["kind"]): void {
    if (!graph.nodes.some((node) => node.id === id)) {
      graph.nodes.push({ id, label, kind });
    }
  }
}
