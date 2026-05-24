import type { Command } from "commander";
import { ConfigUmEmitter } from "../../core/artifacts/ConfigUmEmitter.js";
import { defaultBeginnerMode, defaultStateOfTheArtMode } from "../../core/mode/ModeManager.js";
import { SessionStore } from "../../core/session/SessionStore.js";
import { writeText } from "../../core/utils/fs.js";
import { resolveProjectRoot } from "./build.js";

export function registerModeCommand(program: Command): void {
  program
    .command("mode")
    .argument("<mode>", "beginner | state-of-the-art")
    .description("Switch projection mode without changing semantic .um files")
    .option("--project <path>", "project root")
    .action(async (mode: string, options: { project?: string }) => {
      const projectRoot = await resolveProjectRoot(options.project);
      const store = new SessionStore(projectRoot);
      const session = await store.load();
      session.mode = mode === "state-of-the-art" ? defaultStateOfTheArtMode() : defaultBeginnerMode();
      await store.save(session);
      const emitter = new ConfigUmEmitter();
      await writeText(store.file("project.um"), emitter.emitProject(session));
      await writeText(store.file("project.config.um"), emitter.emitConfig(session.mode));
      console.log(`Mode switched to ${session.mode.kind}. Semantic entity/property .um files were not changed.`);
    });
}
