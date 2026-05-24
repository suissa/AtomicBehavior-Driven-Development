import type { Command } from "commander";
import { SessionStore } from "../../core/session/SessionStore.js";
import { resolveProjectRoot } from "./build.js";

export function registerReuseReportCommand(program: Command): void {
  program
    .command("reuse-report")
    .description("Print reuse report")
    .option("--project <path>", "project root")
    .action(async (options: { project?: string }) => {
      const projectRoot = await resolveProjectRoot(options.project);
      const report = await new SessionStore(projectRoot).readReuseReport();
      console.log(JSON.stringify(report, null, 2));
    });
}
