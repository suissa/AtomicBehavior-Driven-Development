import path from "node:path";
import type { ProjectSession } from "../../types/index.js";
import { toKebabCase, writeText } from "../utils/fs.js";
import { ConfigUmEmitter } from "./ConfigUmEmitter.js";
import { EntityUmEmitter } from "./EntityUmEmitter.js";
import { PropertyUmEmitter } from "./PropertyUmEmitter.js";
import { TestUmEmitter } from "./TestUmEmitter.js";

export class UmEmitter {
  private readonly entityEmitter = new EntityUmEmitter();
  private readonly propertyEmitter = new PropertyUmEmitter();
  private readonly testEmitter = new TestUmEmitter();
  private readonly configEmitter = new ConfigUmEmitter();

  async emitAll(projectRoot: string, session: ProjectSession): Promise<void> {
    for (const entity of session.entities) {
      await writeText(
        path.join(projectRoot, "specs", "entities", `${toKebabCase(entity.name)}.um`),
        this.entityEmitter.emit(entity, session)
      );

      await writeText(
        path.join(projectRoot, "specs", "tests", `${toKebabCase(entity.name)}.test.um`),
        this.testEmitter.emit(entity)
      );

      for (const property of entity.properties) {
        await writeText(
          path.join(projectRoot, "specs", "properties", `${entity.canonicalLabel}.${property.name}.um`),
          this.propertyEmitter.emit(property)
        );
      }
    }

    await writeText(path.join(projectRoot, "project.um"), this.configEmitter.emitProject(session));
    if (session.mode) {
      await writeText(path.join(projectRoot, "project.config.um"), this.configEmitter.emitConfig(session.mode));
    }
  }
}
