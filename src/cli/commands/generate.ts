import path from "node:path";
import type { Command } from "commander";
import { BehaviorGraphBuilder } from "../../core/graph/BehaviorGraph.js";
import { BeginnerProjector } from "../../core/projection/BeginnerProjector.js";
import { StateOfTheArtProjector } from "../../core/projection/StateOfTheArtProjector.js";
import { SessionStore } from "../../core/session/SessionStore.js";
import { ProjectValidator } from "../../core/validation/ProjectValidator.js";
import { ensureDir, writeJson } from "../../core/utils/fs.js";
import { resolveProjectRoot } from "./build.js";

export function registerGenerateCommand(program: Command): void {
  program
    .command("generate")
    .description("Generate an architecture projection plan from semantic graph")
    .option("--project <path>", "project root")
    .action(async (options: { project?: string }) => {
      const projectRoot = await resolveProjectRoot(options.project);
      const session = await new SessionStore(projectRoot).load();
      const validation = new ProjectValidator().validate(session);
      if (!validation.valid) {
        for (const issue of validation.issues) {
          console.log(`${issue.severity.toUpperCase()} ${issue.code}: ${issue.message}`);
        }
        throw new Error("Cannot generate from invalid semantic graph.");
      }
      const graph = new BehaviorGraphBuilder().build(session);
      const projector =
        session.mode?.kind === "state-of-the-art" ? new StateOfTheArtProjector() : new BeginnerProjector();
      const plan = projector.project(graph, {
        projectName: session.projectName,
        mode: session.mode ?? {
          kind: "beginner",
          language: "TypeScript",
          frontend: "NextJS",
          backend: "NestJS",
          database: "PostgreSQL",
          architecture: "modular-monolith"
        }
      });
      await ensureDir(path.join(projectRoot, "generated"));
      await writeJson(path.join(projectRoot, "generated", "project-plan.json"), plan);
      await writeJson(path.join(projectRoot, ".abdd", "behavior-graph.json"), graph);
      console.log(`Generated ${plan.mode} projection plan at ${path.join(projectRoot, "generated", "project-plan.json")}`);
    });
}
