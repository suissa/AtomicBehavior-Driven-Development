import type { Command } from "commander";
import type { ArtifactKind } from "../../types/index.js";
import { LocalRepositoryClient } from "../../core/repository/LocalRepositoryClient.js";

export function registerSearchCommand(program: Command): void {
  program
    .command("search")
    .argument("[kind]", "artifact kind, e.g. semantic-type")
    .argument("[query...]", "search query")
    .description("Search the Universal Repository")
    .action(async (kind: ArtifactKind | undefined, queryParts: string[]) => {
      const query = queryParts.join(" ") || kind || "";
      const filters = queryParts.length > 0 && kind ? { kind } : {};
      const results = await new LocalRepositoryClient().search(query, filters);
      for (const result of results.slice(0, 20)) {
        console.log(
          `${result.artifact.kind.padEnd(13)} ${result.artifact.canonicalName.padEnd(24)} v${result.artifact.version} ${result.artifact.maturity} ${result.recommended ? "recommended" : ""}`
        );
      }
    });
}
