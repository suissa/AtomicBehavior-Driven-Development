import type { Command } from "commander";
import { ProjectValidator } from "../../core/validation/ProjectValidator.js";
import { SessionStore } from "../../core/session/SessionStore.js";
import { resolveProjectRoot } from "./build.js";

export function registerValidateCommand(program: Command): void {
  program
    .command("validate")
    .description("Validate ABDD semantic project")
    .option("--project <path>", "project root")
    .action(async (options: { project?: string }) => {
      const projectRoot = await resolveProjectRoot(options.project);
      const session = await new SessionStore(projectRoot).load();
      const result = new ProjectValidator().validate(session);
      for (const issue of result.issues) {
        console.log(`${issue.severity.toUpperCase()} ${issue.code}: ${issue.message}`);
      }
      if (!result.valid) {
        process.exitCode = 1;
        return;
      }
      console.log("ABDD project is valid.");
    });
}
