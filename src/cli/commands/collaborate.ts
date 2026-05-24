import { createHash } from "node:crypto";
import type { Command } from "commander";
import type { CollaborationManifest } from "../../types/index.js";
import { SessionStore } from "../../core/session/SessionStore.js";
import { writeJson } from "../../core/utils/fs.js";
import { resolveProjectRoot } from "./build.js";

export function registerCollaborateCommand(program: Command): void {
  program
    .command("collaborate")
    .description("Create a collaboration manifest for unresolved/generated artifacts")
    .option("--project <path>", "project root")
    .option("--author <name>", "author", "unknown")
    .action(async (options: { project?: string; author: string }) => {
      const projectRoot = await resolveProjectRoot(options.project);
      const store = new SessionStore(projectRoot);
      const session = await store.load();
      const unresolved = await store.readUnresolvedArtifacts();
      const manifest: CollaborationManifest = {
        projectName: session.projectName,
        artifacts: unresolved.map((artifact) => ({
          artifact,
          semanticSignature: `${artifact.kind}:${artifact.canonicalLabel}:${artifact.version}`,
          tests: [],
          refutations: [],
          events: [],
          documentation: `Generated artifact candidate for ${artifact.canonicalName}`,
          version: artifact.version,
          license: "MIT",
          author: options.author,
          hash: createHash("sha256").update(JSON.stringify(artifact)).digest("hex"),
          compatibility: ["beginner", "state-of-the-art"]
        })),
        pipeline: ["issue", "branch", "commit", "tests", "docs", "pull_request", "validation", "merge"],
        createdAt: new Date().toISOString()
      };
      await writeJson(store.file("collaboration.manifest.json"), manifest);
      console.log(`Collaboration manifest generated with ${manifest.artifacts.length} artifact(s).`);
    });
}
