import type { CollaborationManifest } from "../../types/index.js";

export class CollaborationPipeline {
  readonly plannedSteps = ["issue", "branch", "commit", "tests", "docs", "pull_request", "validation", "merge"];

  simulate(manifest: CollaborationManifest): string[] {
    return this.plannedSteps.map((step) => `${step}: simulated for ${manifest.artifacts.length} artifact(s)`);
  }
}
