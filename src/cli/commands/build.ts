import path from "node:path";
import type { Command } from "commander";
import { ProjectBuilder } from "../../core/build/ProjectBuilder.js";
import { defaultBeginnerMode } from "../../core/mode/ModeManager.js";
import { LocalRepositoryClient } from "../../core/repository/LocalRepositoryClient.js";
import { SessionStore } from "../../core/session/SessionStore.js";
import { runBuildQuestionnaire } from "../../core/questionnaire/QuestionFlow.js";

type BuildOptions = {
  project?: string;
  yes?: boolean;
  domain?: string;
  systemType?: string;
  problem?: string;
};

export function registerBuildCommand(program: Command): void {
  program
    .command("build")
    .description("Run the ABDD builder questionnaire and generate .um specs")
    .option("--project <path>", "project root")
    .option("-y, --yes", "use ecommerce defaults without prompting")
    .option("--domain <domain>", "domain override")
    .option("--system-type <type>", "system type override")
    .option("--problem <text>", "problem statement")
    .action(async (options: BuildOptions) => {
      const projectRoot = await resolveProjectRoot(options.project);
      const repository = new LocalRepositoryClient();
      const questionnaire = options.yes
        ? {
            domain: options.domain ?? "commerce",
            systemType: options.systemType ?? "ecommerce",
            problemStatement: options.problem ?? "Ecommerce system generated from semantic ABDD entities.",
            entityNames: ["User", "Product", "Order", "Payment"],
            mode: defaultBeginnerMode()
          }
        : await runBuildQuestionnaire(repository);

      await new ProjectBuilder(repository).build(projectRoot, questionnaire);
      console.log(`ABDD specs generated at ${projectRoot}`);
      console.log("Next steps: make generate && make test");
    });
}

export async function resolveProjectRoot(project?: string): Promise<string> {
  if (project) return path.resolve(process.cwd(), project);
  const found = await SessionStore.findProjectRoot(process.cwd());
  if (!found) {
    throw new Error("No ABDD project found. Run `abdd init <projectName>` first or pass --project.");
  }
  return found;
}
