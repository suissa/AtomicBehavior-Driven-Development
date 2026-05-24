# Piaget Freinet ABDD Builder

Piaget Freinet is an initial TypeScript/Node.js implementation of an **AtomicBehavior-Driven Development Builder**.

It guides a developer through semantic discovery, reuses artifacts from a local Universal Repository, generates `.um` specifications, and projects the same semantic graph into either `beginner` or `state-of-the-art` architecture modes.

## Why Piaget Freinet

The name is a tribute to Jean Piaget and Celestin Freinet.

- Piaget: the tool teaches by construction. The developer builds understanding through guided decisions.
- Freinet: the tool treats developers as producers of reusable semantic culture, not consumers of one-off scaffolds.

## Install

```bash
npm install
npm run build
npm link
```

During development you can use:

```bash
npm run dev -- doctor
```

## CLI

```bash
abdd init ecommerce-demo
cd ecommerce-demo
abdd build
abdd search semantic-type cpf
abdd inspect UserCPF
abdd mode beginner
abdd mode state-of-the-art
abdd generate
abdd validate
abdd reuse-report
abdd collaborate
abdd doctor
```

For a non-interactive ecommerce generation:

```bash
abdd init ecommerce-demo
abdd build --project ecommerce-demo --yes
abdd validate --project ecommerce-demo
abdd generate --project ecommerce-demo
```

## First Run Recommendation

For the first generation, use **Beginner Mode** with the stack you already know.

> Para começar, escolha o framework, a linguagem e a arquitetura que você já domina. A ideia é você conseguir avaliar o código gerado sem precisar aprender uma arquitetura nova ao mesmo tempo. Quando quiser migrar para o modo state-of-the-art, você não precisa alterar nenhuma linha do código semântico. Basta mudar `mode = state-of-the-art` na configuração e rodar `make` na pasta do projeto. O compilador irá reprojetar o mesmo grafo de AtomicBehaviors para a arquitetura avançada.

## Generated Workspace

```text
project/
  .abdd/
    session.json
    decisions.json
    repository-cache.json
    artifact-index.json
    unresolved-artifacts.json
    reuse-report.json
    behavior-graph.json
  specs/
    entities/
    properties/
    tests/
  generated/
    project-plan.json
  project.um
  project.config.um
  Makefile
```

## Beginner to State-of-the-Art

Semantic files are the source of truth:

```text
specs/entities/*.um
specs/properties/*.um
specs/tests/*.test.um
```

To switch architecture projection:

```bash
abdd mode state-of-the-art
make generate
make test
make run
```

No entity or property `.um` file needs to change. Architecture is a projection.

## Universal Repository

The initial repository is local and file-backed:

```text
universal-repository/
  semantic-types/
  entities/
  properties/
  behaviors/
  refutations/
  events/
  tests/
  templates/
  index.json
```

It currently includes ecommerce seed artifacts:

- `User`
- `Product`
- `Order`
- `Payment`
- `UserEmail`
- `UserCPF`
- `UserPhone`
- `Money`
- `EntityId`

The repository client already supports local fuzzy search and is shaped so later backends can use GitHub, HTTP registries, package registries or vector stores.

## Collaboration as Code

`abdd collaborate` generates `collaboration.manifest.json` for unresolved/generated artifacts and simulates the planned pipeline:

```text
issue -> branch -> commit -> tests -> docs -> pull_request -> validation -> merge
```

The first implementation only generates the manifest. Real remote collaboration is intentionally left as the next layer.

## Makefile

Generated projects include:

```bash
make generate
make test
make validate
make run
make clean
```

## Tests

```bash
npm test
```

The tests create a temporary ecommerce project, generate `.um` files, validate the graph, switch mode, and verify semantic specs remain stable.

## Next Steps

- Add real incremental property/entity editing.
- Add semantic search backend via embeddings.
- Add remote Universal Repository adapters.
- Add real frontend/backend/database code generation.
- Add artifact canonicalization with real GitHub pull requests.
- Add richer `.um` parser instead of emitter-only validation.
- Add architecture packs for Next.js, NestJS, Fastify, Prisma, Drizzle and PASS multi-plane targets.
