import type { Command } from "commander";
import { LocalRepositoryClient } from "../../core/repository/LocalRepositoryClient.js";

export function registerDoctorCommand(program: Command): void {
  program
    .command("doctor")
    .description("Check local ABDD Builder installation")
    .action(async () => {
      const repository = new LocalRepositoryClient();
      const semanticTypes = await repository.byKind("semantic-type");
      const entities = await repository.byKind("entity");
      console.log("Piaget Freinet ABDD Builder");
      console.log(`Universal repository: ${semanticTypes.length} semantic types, ${entities.length} entities`);
      console.log("Status: ok");
    });
}
