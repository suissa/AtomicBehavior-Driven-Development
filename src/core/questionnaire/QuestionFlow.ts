import prompts from "prompts";
import type { GenerationMode } from "../../types/index.js";
import { defaultBeginnerMode, defaultStateOfTheArtMode } from "../mode/ModeManager.js";
import type { UniversalRepositoryClient } from "../repository/UniversalRepositoryClient.js";

export type BuildQuestionnaireResult = {
  domain: string;
  systemType: string;
  problemStatement: string;
  entityNames: string[];
  mode: GenerationMode;
};

export async function runBuildQuestionnaire(repository: UniversalRepositoryClient): Promise<BuildQuestionnaireResult> {
  const first = await prompts([
    {
      type: "select",
      name: "domain",
      message: "Qual domínio do sistema?",
      choices: [
        { title: "commerce", value: "commerce" },
        { title: "healthcare", value: "healthcare" },
        { title: "finance", value: "finance" },
        { title: "education", value: "education" },
        { title: "custom", value: "custom" }
      ],
      initial: 0
    },
    {
      type: "select",
      name: "systemType",
      message: "Qual tipo do sistema?",
      choices: [
        { title: "ecommerce", value: "ecommerce" },
        { title: "marketplace", value: "marketplace" },
        { title: "CRM", value: "crm" },
        { title: "ERP", value: "erp" },
        { title: "scheduling", value: "scheduling" },
        { title: "custom", value: "custom" }
      ],
      initial: 0
    },
    {
      type: "text",
      name: "problemStatement",
      message: "Qual problema o sistema resolve?",
      initial: "Generate a reusable ABDD system from semantic entities."
    }
  ]);

  const recommended = await repository.recommendedEntities(first.domain, first.systemType);
  const entitySelection = await prompts({
    type: "multiselect",
    name: "entityNames",
    message: `Entidades sugeridas para ${first.systemType}:`,
    choices: recommended.map((entity) => ({
      title: `${entity.canonicalName} - ${entity.description ?? entity.canonicalLabel}`,
      value: entity.canonicalName,
      selected: ["User", "Product", "Order", "Payment"].includes(entity.canonicalName)
    })),
    min: 1
  });

  const mode = await runModeQuestionnaire();

  return {
    domain: first.domain,
    systemType: first.systemType,
    problemStatement: first.problemStatement,
    entityNames: entitySelection.entityNames,
    mode
  };
}

export async function runModeQuestionnaire(): Promise<GenerationMode> {
  console.log("");
  console.log("Agora escolha o modo de projeção arquitetural.");
  console.log(
    "Para começar, escolha o framework, a linguagem e a arquitetura que você já domina. A ideia é você conseguir avaliar o código gerado sem precisar aprender uma arquitetura nova ao mesmo tempo. Quando quiser migrar para o modo state-of-the-art, você não precisa alterar nenhuma linha do código semântico. Basta mudar `mode = state-of-the-art` na configuração e rodar `make` na pasta do projeto. O compilador irá reprojetar o mesmo grafo de AtomicBehaviors para a arquitetura avançada."
  );
  console.log("");

  const answer = await prompts({
    type: "select",
    name: "mode",
    message: "Mode arquitetural:",
    choices: [
      {
        title: "Beginner Mode",
        description: "Use a stack que você já domina para avaliar e debugar o código gerado.",
        value: "beginner"
      },
      {
        title: "State-of-the-Art Mode",
        description: "Projeta o mesmo grafo para arquitetura PASS multi-plane.",
        value: "state-of-the-art"
      }
    ],
    initial: 0
  });

  if (answer.mode === "state-of-the-art") {
    return defaultStateOfTheArtMode();
  }

  const beginner = await prompts([
    { type: "text", name: "language", message: "Linguagem principal:", initial: "TypeScript" },
    { type: "text", name: "frontend", message: "Frontend:", initial: "NextJS" },
    { type: "text", name: "backend", message: "Backend:", initial: "NestJS" },
    { type: "text", name: "database", message: "Banco:", initial: "PostgreSQL" },
    {
      type: "select",
      name: "architecture",
      message: "Arquitetura:",
      choices: [
        { title: "modular-monolith", value: "modular-monolith" },
        { title: "mvc", value: "mvc" },
        { title: "clean-architecture", value: "clean-architecture" },
        { title: "custom", value: "custom" }
      ],
      initial: 0
    }
  ]);

  return {
    kind: "beginner",
    language: beginner.language,
    frontend: beginner.frontend,
    backend: beginner.backend,
    database: beginner.database,
    architecture: beginner.architecture
  };
}
