import type { Command } from "commander";
import { LocalRepositoryClient } from "../../core/repository/LocalRepositoryClient.js";

export function registerInspectCommand(program: Command): void {
  program
    .command("inspect")
    .argument("<canonicalName>", "artifact canonical name")
    .description("Inspect one Universal Repository artifact")
    .action(async (canonicalName: string) => {
      const artifact = await new LocalRepositoryClient().inspect(canonicalName);
      if (!artifact) {
        throw new Error(`Artifact not found: ${canonicalName}`);
      }
      console.log(JSON.stringify(artifact, null, 2));
    });
}
