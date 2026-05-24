import type { Command } from "commander";
import { registerBuildCommand } from "./build.js";

export function registerAskCommand(program: Command): void {
  program
    .command("ask")
    .description("Alias for interactive build")
    .option("--project <path>", "project root")
    .action(async (options: { project?: string }) => {
      const build = program.commands.find((command) => command.name() === "build");
      await build?.parseAsync(["node", "abdd", "build", ...(options.project ? ["--project", options.project] : [])], {
        from: "user"
      });
    });
}
