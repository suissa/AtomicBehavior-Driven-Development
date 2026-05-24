import { fileURLToPath } from "node:url";
import path from "node:path";
import { existsSync } from "node:fs";
import type {
  ArtifactKind,
  RepositorySearchFilters,
  RepositorySearchResult,
  UniversalArtifact
} from "../../types/index.js";
import { readJson } from "../utils/fs.js";
import { SearchEngine } from "./SearchEngine.js";
import type { UniversalRepositoryClient } from "./UniversalRepositoryClient.js";

type RepositoryIndex = {
  artifacts: UniversalArtifact[];
};

export class LocalRepositoryClient implements UniversalRepositoryClient {
  private artifacts?: UniversalArtifact[];
  private searchEngine?: SearchEngine;

  constructor(private readonly repositoryRoot = LocalRepositoryClient.defaultRepositoryRoot()) {}

  static defaultRepositoryRoot(): string {
    const currentFile = fileURLToPath(import.meta.url);
    let current = path.dirname(currentFile);
    while (true) {
      const candidate = path.join(current, "universal-repository");
      if (existsSync(path.join(candidate, "index.json"))) {
        return candidate;
      }
      const parent = path.dirname(current);
      if (parent === current) {
        throw new Error("Unable to locate universal-repository/index.json");
      }
      current = parent;
    }
  }

  async search(query: string, filters: RepositorySearchFilters = {}): Promise<RepositorySearchResult[]> {
    await this.ensureLoaded();
    return this.searchEngine!.search(query, filters);
  }

  async inspect(canonicalName: string): Promise<UniversalArtifact | undefined> {
    return this.artifactByCanonicalName(canonicalName);
  }

  async byKind(kind: ArtifactKind): Promise<UniversalArtifact[]> {
    await this.ensureLoaded();
    return this.artifacts!.filter((artifact) => artifact.kind === kind);
  }

  async recommendedEntities(domain: string, systemType: string): Promise<UniversalArtifact[]> {
    await this.ensureLoaded();
    return this.artifacts!
      .filter(
        (artifact) =>
          artifact.kind === "entity" &&
          (artifact.domainTags ?? []).includes(domain) &&
          (artifact.systemTypes ?? []).includes(systemType)
      )
      .sort((a, b) => a.canonicalName.localeCompare(b.canonicalName));
  }

  async recommendedProperties(entityName: string, domain: string, systemType: string): Promise<UniversalArtifact[]> {
    await this.ensureLoaded();
    return this.artifacts!
      .filter(
        (artifact) =>
          artifact.kind === "property" &&
          artifact.entity === entityName &&
          (artifact.domainTags ?? []).includes(domain) &&
          (artifact.systemTypes ?? []).includes(systemType)
      )
      .sort((a, b) => (a.property ?? a.canonicalName).localeCompare(b.property ?? b.canonicalName));
  }

  async artifactByCanonicalName(canonicalName: string): Promise<UniversalArtifact | undefined> {
    await this.ensureLoaded();
    const normalized = canonicalName.toLowerCase();
    return this.artifacts!.find(
      (artifact) =>
        artifact.canonicalName.toLowerCase() === normalized ||
        artifact.canonicalLabel.toLowerCase() === normalized ||
        (artifact.aliases ?? []).some((alias) => alias.toLowerCase() === normalized)
    );
  }

  private async ensureLoaded(): Promise<void> {
    if (this.artifacts && this.searchEngine) return;
    const index = await readJson<RepositoryIndex>(path.join(this.repositoryRoot, "index.json"));
    this.artifacts = index.artifacts;
    this.searchEngine = new SearchEngine(this.artifacts);
  }
}
