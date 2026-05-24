import path from "node:path";
import type {
  AtomicBehaviorSpec,
  EntitySpec,
  EventContractSpec,
  GenerationMode,
  PropertySpec,
  RefutationSpec,
  TestCaseSpec,
  TestOracleSpec,
  UniversalArtifact
} from "../../types/index.js";
import { SessionStore } from "../session/SessionStore.js";
import { LocalRepositoryClient } from "../repository/LocalRepositoryClient.js";
import type { UniversalRepositoryClient } from "../repository/UniversalRepositoryClient.js";
import { ReuseResolver, artifactRef } from "../reuse/ReuseResolver.js";
import { UmEmitter } from "../artifacts/UmEmitter.js";
import { defaultBeginnerMode } from "../mode/ModeManager.js";
import { toDotLabel, writeText } from "../utils/fs.js";

export type BuildProjectOptions = {
  domain?: string;
  systemType?: string;
  problemStatement?: string;
  entityNames?: string[];
  mode?: GenerationMode;
};

export class ProjectBuilder {
  constructor(
    private readonly repository: UniversalRepositoryClient = new LocalRepositoryClient(),
    private readonly emitter = new UmEmitter()
  ) {}

  async build(projectRoot: string, options: BuildProjectOptions = {}): Promise<void> {
    const store = new SessionStore(projectRoot);
    const session = await store.load();
    const domain = options.domain ?? (session.domain || "commerce");
    const systemType = options.systemType ?? (session.systemType || "ecommerce");
    const problemStatement =
      options.problemStatement ?? (session.problemStatement || "Generate a reusable ABDD system from semantic entities.");

    const reuse = new ReuseResolver();
    const recommendedEntities = await this.repository.recommendedEntities(domain, systemType);
    const selectedEntities = recommendedEntities.filter(
      (entity) => !options.entityNames || options.entityNames.includes(entity.canonicalName)
    );

    session.domain = domain;
    session.systemType = systemType;
    session.problemStatement = problemStatement;
    session.entities = [];

    for (const entityArtifact of selectedEntities) {
      const entityRef = reuse.reuse(entityArtifact.canonicalName, entityArtifact, "recommended entity reused");
      const properties = await this.buildProperties(entityArtifact, domain, systemType, reuse);
      const entity: EntitySpec = {
        name: entityArtifact.canonicalName,
        canonicalLabel: entityArtifact.canonicalLabel,
        description: entityArtifact.description,
        properties,
        behaviors: this.behaviorsFromNames(entityArtifact.behaviors ?? [], reuse),
        source: "reused",
        artifactRef: entityRef
      };
      session.entities.push(entity);
    }

    session.mode = options.mode ?? session.mode ?? defaultBeginnerMode();
    session.decisions = reuse.report().decisions;

    await store.save(session);
    await store.writeReuseReport(reuse.report());
    await store.writeUnresolvedArtifacts([]);
    await this.emitter.emitAll(projectRoot, session);
    await this.writeMakefile(projectRoot);
  }

  private async buildProperties(
    entityArtifact: UniversalArtifact,
    domain: string,
    systemType: string,
    reuse: ReuseResolver
  ): Promise<PropertySpec[]> {
    const propertyArtifacts = await this.repository.recommendedProperties(entityArtifact.canonicalName, domain, systemType);
    const properties: PropertySpec[] = [];

    for (const propertyArtifact of propertyArtifacts) {
      const propertyRef = reuse.reuse(propertyArtifact.canonicalName, propertyArtifact, "recommended property reused");
      if (propertyArtifact.semanticType) {
        const semanticType = await this.repository.artifactByCanonicalName(propertyArtifact.semanticType);
        if (semanticType) {
          reuse.reuse(propertyArtifact.semanticType, semanticType, "semantic type reused");
        }
      }

      properties.push({
        entityName: entityArtifact.canonicalName,
        name: propertyArtifact.property ?? toDotLabel(propertyArtifact.canonicalName).split(".").at(-1) ?? propertyArtifact.canonicalName,
        canonicalLabel: propertyArtifact.canonicalLabel,
        semanticType: propertyArtifact.semanticType ?? propertyArtifact.canonicalName,
        primitiveEnvelope: propertyArtifact.primitiveEnvelope ?? "Word",
        required: propertyArtifact.required ?? true,
        behaviors: this.behaviorsFromNames(propertyArtifact.behaviors ?? [], reuse),
        refutations: this.refutationsFromNames(propertyArtifact.refutations ?? [], reuse),
        events: this.eventsFromNames(propertyArtifact.events ?? [], reuse),
        tests: this.testsFromArtifact(propertyArtifact, reuse),
        source: "reused",
        artifactRef: propertyRef
      });
    }

    return properties;
  }

  private behaviorsFromNames(names: string[], reuse: ReuseResolver): AtomicBehaviorSpec[] {
    return names.map((name) => ({
      name,
      canonicalLabel: toDotLabel(name),
      behaviorType: this.inferBehaviorType(name),
      source: "reused",
      artifactRef: undefined
    }));
  }

  private refutationsFromNames(names: string[], reuse: ReuseResolver): RefutationSpec[] {
    void reuse;
    return names.map((name) => ({
      name,
      canonicalLabel: toDotLabel(name),
      source: "reused"
    }));
  }

  private eventsFromNames(names: string[], reuse: ReuseResolver): EventContractSpec[] {
    void reuse;
    return names.map((name) => ({
      name,
      canonicalLabel: name.toLowerCase(),
      source: "reused"
    }));
  }

  private testsFromArtifact(artifact: UniversalArtifact, reuse: ReuseResolver): TestOracleSpec[] {
    const cases: TestCaseSpec[] = [
      ...(artifact.tests?.positive ?? []).map((name): TestCaseSpec => ({ name, kind: "positive" })),
      ...(artifact.tests?.negative ?? []).map((test): TestCaseSpec => ({
        name: test.name,
        kind: "negative",
        expects: test.expects
      })),
      ...(artifact.tests?.healing ?? []).map((test): TestCaseSpec => ({
        name: test.name,
        kind: "healing",
        expects: test.expects
      }))
    ];

    const oracleName = `${artifact.canonicalName}TestOracle`;
    return [
      {
        name: oracleName,
        canonicalLabel: toDotLabel(oracleName),
        cases,
        source: "reused",
        artifactRef: {
          kind: "test",
          canonicalName: oracleName,
          canonicalLabel: toDotLabel(oracleName),
          version: artifact.version,
          path: `tests/${artifact.canonicalLabel}.test.um`,
          maturity: artifact.maturity,
          source: "universal-repository"
        }
      }
    ];
  }

  private inferBehaviorType(name: string): AtomicBehaviorSpec["behaviorType"] {
    if (/^(Normalize|Extract|Trim|Lowercase)/.test(name)) return "normalizer";
    if (/^(Construct|Create|Build)/.test(name)) return "constructor";
    if (/^(Bind|Attach|Link)/.test(name)) return "binder";
    if (/^(Emit)/.test(name)) return "emitter";
    if (/^(Generate).*Oracle/.test(name)) return "oracle";
    if (/^(Validate|Refute|Check)/.test(name)) return "validator";
    return "unknown";
  }

  private async writeMakefile(projectRoot: string): Promise<void> {
    await writeText(
      path.join(projectRoot, "Makefile"),
      `generate:
\tabdd generate

test:
\tabdd validate

validate:
\tabdd validate

run:
\t@echo "Runtime generation is planned. Use 'abdd generate' to inspect the current projection plan."

clean:
\t@rm -rf generated
`
    );
  }
}
