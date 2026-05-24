import type { GenerationMode, ProjectSession } from "../../types/index.js";

export class ConfigUmEmitter {
  emitProject(session: ProjectSession): string {
    const entities = session.entities.map((entity) => `  entity ${entity.name}`).join("\n");
    const mode = session.mode?.kind === "state-of-the-art" ? "state_of_the_art" : session.mode?.kind ?? "beginner";
    return `project ${session.projectName} {
  domain ${session.domain}
  system_type ${session.systemType}

${entities}

  mode ${mode}
}`;
  }

  emitConfig(mode: GenerationMode): string {
    if (mode.kind === "state-of-the-art") {
      return `config {
  mode state_of_the_art

  state_of_the_art {
    architecture PASS_MultiPlane

${mode.planes.map((plane) => `    plane ${plane.name} uses ${plane.language}`).join("\n")}

    data_plane Write uses PostgreSQL
    data_plane Read uses MongoDB
    data_plane Cache uses Redis
    data_plane Vector uses Qdrant
    data_plane Graph uses Neo4j
    data_plane Events uses EventStoreDB
    data_plane Logs uses ClickHouse
    data_plane Files uses MinIO
    data_plane Search uses Meilisearch
  }
}`;
    }

    return `config {
  mode beginner

  beginner {
    language ${mode.language}
    frontend ${mode.frontend}
    backend ${mode.backend}
    database ${mode.database}
    architecture ${mode.architecture.replaceAll("-", "_")}
  }
}`;
  }
}
