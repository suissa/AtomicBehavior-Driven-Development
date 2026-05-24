import path from "node:path";
import type { Command } from "commander";
import { SessionStore } from "../../core/session/SessionStore.js";

export function registerInitCommand(program: Command): void {
  program
    .command("init")
    .argument("[projectName]", "project folder/name", ".")
    .description("Initialize an ABDD project workspace")
    .action(async (projectName: string) => {
      const projectRoot = projectName === "." ? process.cwd() : path.resolve(process.cwd(), projectName);
      const name = projectName === "." ? path.basename(projectRoot) : projectName;
      await SessionStore.create(projectRoot, name);
      console.log(`ABDD project initialized at ${projectRoot}`);
    });
}
