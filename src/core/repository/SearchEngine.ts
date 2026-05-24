import Fuse from "fuse.js";
import type {
  RepositorySearchFilters,
  RepositorySearchResult,
  UniversalArtifact
} from "../../types/index.js";

export class SearchEngine {
  private readonly fuse: Fuse<UniversalArtifact>;

  constructor(private readonly artifacts: UniversalArtifact[]) {
    this.fuse = new Fuse(artifacts, {
      includeScore: true,
      threshold: 0.35,
      ignoreLocation: true,
      keys: [
        "canonicalName",
        "canonicalLabel",
        "aliases",
        "tags",
        "domainTags",
        "systemTypes",
        "entity",
        "property",
        "semanticType",
        "description"
      ]
    });
  }

  search(query: string, filters: RepositorySearchFilters = {}): RepositorySearchResult[] {
    const normalizedQuery = query.trim();
    const candidates =
      normalizedQuery.length === 0
        ? this.artifacts.map((artifact) => ({ item: artifact, score: 0 }))
        : this.fuse.search(normalizedQuery).map((result) => ({
            item: result.item,
            score: result.score ?? 0
          }));

    return candidates
      .filter(({ item }) => this.matchesFilters(item, filters))
      .map(({ item, score }) => ({
        artifact: item,
        score,
        recommended: item.maturity === "stable" && score <= 0.2,
        reason: item.maturity === "stable" ? "stable semantic match" : `${item.maturity} match`
      }))
      .sort((a, b) => Number(b.recommended) - Number(a.recommended) || a.score - b.score);
  }

  private matchesFilters(artifact: UniversalArtifact, filters: RepositorySearchFilters): boolean {
    if (filters.kind && artifact.kind !== filters.kind) return false;
    if (filters.domain && !(artifact.domainTags ?? []).includes(filters.domain)) return false;
    if (filters.entity && artifact.entity !== filters.entity && artifact.canonicalName !== filters.entity) return false;
    if (filters.property && artifact.property !== filters.property) return false;
    if (filters.semanticType && artifact.semanticType !== filters.semanticType && artifact.canonicalName !== filters.semanticType) {
      return false;
    }
    if (filters.maturity && artifact.maturity !== filters.maturity) return false;
    if (filters.architecture && !(artifact.architectureCompatibility ?? []).includes(filters.architecture)) {
      return false;
    }
    return true;
  }
}
