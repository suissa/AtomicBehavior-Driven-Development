import type { ArchitecturePlane, GenerationMode } from "../../types/index.js";

export function defaultBeginnerMode(): GenerationMode {
  return {
    kind: "beginner",
    language: "TypeScript",
    frontend: "NextJS",
    backend: "NestJS",
    database: "PostgreSQL",
    architecture: "modular-monolith"
  };
}

export function defaultStateOfTheArtMode(): GenerationMode {
  const planes: ArchitecturePlane[] = [
    { name: "UI", language: "TypeScript", purpose: "frontend interaction" },
    { name: "Gateway", language: "Go", purpose: "edge and API gateway" },
    { name: "SemanticAlgebra", language: "Prolog", purpose: "semantic judgment" },
    { name: "AtomicEvidence", language: "Haskell", purpose: "proof and evidence" },
    { name: "Effects", language: "Koka", purpose: "typed effects" },
    { name: "LinearCapability", language: "Austral", purpose: "linear resources" },
    { name: "ActorAgent", language: "Gleam", purpose: "actor orchestration" },
    { name: "Crypto", language: "Rust", purpose: "cryptographic boundary" }
  ];

  return {
    kind: "state-of-the-art",
    architecture: "pass-multiplane",
    planes
  };
}
