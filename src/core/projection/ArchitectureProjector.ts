import type { BehaviorGraph, GeneratedProjectPlan, ProjectConfig } from "../../types/index.js";

export interface ArchitectureProjector {
  mode: string;
  project(graph: BehaviorGraph, config: ProjectConfig): GeneratedProjectPlan;
}
