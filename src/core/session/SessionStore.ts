import path from "node:path";
import type { ProjectSession, ReuseReport, UnresolvedArtifact } from "../../types/index.js";
import { ensureDir, makeId, pathExists, readJson, writeJson } from "../utils/fs.js";

export class SessionStore {
  constructor(public readonly projectRoot: string) {}

  static async create(projectRoot: string, projectName: string): Promise<ProjectSession> {
    const now = new Date().toISOString();
    const store = new SessionStore(projectRoot);
    await ensureDir(projectRoot);
    await ensureDir(store.abddPath());
    await ensureDir(store.specsPath("entities"));
    await ensureDir(store.specsPath("properties"));
    await ensureDir(store.specsPath("tests"));

    const session: ProjectSession = {
      id: makeId("session"),
      projectName,
      domain: "",
      systemType: "",
      problemStatement: "",
      entities: [],
      decisions: [],
      createdAt: now,
      updatedAt: now
    };

    await store.save(session);
    await writeJson(store.file(".abdd/decisions.json"), []);
    await writeJson(store.file(".abdd/repository-cache.json"), {});
    await writeJson(store.file(".abdd/artifact-index.json"), {});
    await writeJson(store.file(".abdd/unresolved-artifacts.json"), []);
    await store.writeReuseReport({
      reused: [],
      generated: [],
      custom: [],
      unresolved: [],
      decisions: [],
      updatedAt: now
    });
    return session;
  }

  static async findProjectRoot(startDir: string): Promise<string | undefined> {
    let current = path.resolve(startDir);
    while (true) {
      if (await pathExists(path.join(current, ".abdd", "session.json"))) {
        return current;
      }
      const parent = path.dirname(current);
      if (parent === current) {
        return undefined;
      }
      current = parent;
    }
  }

  abddPath(): string {
    return path.join(this.projectRoot, ".abdd");
  }

  specsPath(kind?: "entities" | "properties" | "tests"): string {
    return kind ? path.join(this.projectRoot, "specs", kind) : path.join(this.projectRoot, "specs");
  }

  file(relativePath: string): string {
    return path.join(this.projectRoot, relativePath);
  }

  async load(): Promise<ProjectSession> {
    return readJson<ProjectSession>(this.file(".abdd/session.json"));
  }

  async save(session: ProjectSession): Promise<void> {
    session.updatedAt = new Date().toISOString();
    await writeJson(this.file(".abdd/session.json"), session);
    await writeJson(this.file(".abdd/decisions.json"), session.decisions);
  }

  async readReuseReport(): Promise<ReuseReport> {
    return readJson<ReuseReport>(this.file(".abdd/reuse-report.json"));
  }

  async writeReuseReport(report: ReuseReport): Promise<void> {
    report.updatedAt = new Date().toISOString();
    await writeJson(this.file(".abdd/reuse-report.json"), report);
  }

  async readUnresolvedArtifacts(): Promise<UnresolvedArtifact[]> {
    return readJson<UnresolvedArtifact[]>(this.file(".abdd/unresolved-artifacts.json"));
  }

  async writeUnresolvedArtifacts(artifacts: UnresolvedArtifact[]): Promise<void> {
    await writeJson(this.file(".abdd/unresolved-artifacts.json"), artifacts);
  }
}
