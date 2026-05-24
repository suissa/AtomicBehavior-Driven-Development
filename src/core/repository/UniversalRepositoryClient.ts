import type {
  ArtifactKind,
  RepositorySearchFilters,
  RepositorySearchResult,
  UniversalArtifact
} from "../../types/index.js";

export interface UniversalRepositoryClient {
  search(query: string, filters?: RepositorySearchFilters): Promise<RepositorySearchResult[]>;
  inspect(canonicalName: string): Promise<UniversalArtifact | undefined>;
  byKind(kind: ArtifactKind): Promise<UniversalArtifact[]>;
  recommendedEntities(domain: string, systemType: string): Promise<UniversalArtifact[]>;
  recommendedProperties(entityName: string, domain: string, systemType: string): Promise<UniversalArtifact[]>;
  artifactByCanonicalName(canonicalName: string): Promise<UniversalArtifact | undefined>;
}
