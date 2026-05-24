import assert from "node:assert/strict";
import { mkdtemp, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { ProjectBuilder } from "../src/core/build/ProjectBuilder.js";
import { defaultBeginnerMode, defaultStateOfTheArtMode } from "../src/core/mode/ModeManager.js";
import { LocalRepositoryClient } from "../src/core/repository/LocalRepositoryClient.js";
import { SessionStore } from "../src/core/session/SessionStore.js";
import { ProjectValidator } from "../src/core/validation/ProjectValidator.js";
import { ConfigUmEmitter } from "../src/core/artifacts/ConfigUmEmitter.js";
import { writeText } from "../src/core/utils/fs.js";

test("builds and validates an ecommerce ABDD workspace", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "abdd-"));
  const projectRoot = path.join(root, "ecommerce");
  await SessionStore.create(projectRoot, "ecommerce");
  await new ProjectBuilder(new LocalRepositoryClient()).build(projectRoot, {
    domain: "commerce",
    systemType: "ecommerce",
    problemStatement: "Ecommerce test project",
    entityNames: ["User", "Product", "Order", "Payment"],
    mode: defaultBeginnerMode()
  });

  await stat(path.join(projectRoot, "specs/entities/user.um"));
  await stat(path.join(projectRoot, "specs/properties/user.cpf.um"));
  await stat(path.join(projectRoot, "specs/properties/product.price.um"));
  await stat(path.join(projectRoot, "specs/tests/user.test.um"));
  await stat(path.join(projectRoot, "project.um"));
  await stat(path.join(projectRoot, "project.config.um"));
  await stat(path.join(projectRoot, ".abdd/session.json"));
  await stat(path.join(projectRoot, ".abdd/reuse-report.json"));

  const session = await new SessionStore(projectRoot).load();
  const validation = new ProjectValidator().validate(session);
  assert.equal(validation.valid, true, JSON.stringify(validation.issues, null, 2));
});

test("switches to state-of-the-art without changing semantic entity/property files", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "abdd-mode-"));
  const projectRoot = path.join(root, "ecommerce");
  await SessionStore.create(projectRoot, "ecommerce");
  await new ProjectBuilder(new LocalRepositoryClient()).build(projectRoot, {
    domain: "commerce",
    systemType: "ecommerce",
    entityNames: ["User", "Product"],
    mode: defaultBeginnerMode()
  });

  const entityBefore = await readFile(path.join(projectRoot, "specs/entities/user.um"), "utf8");
  const propertyBefore = await readFile(path.join(projectRoot, "specs/properties/user.cpf.um"), "utf8");
  const store = new SessionStore(projectRoot);
  const session = await store.load();
  session.mode = defaultStateOfTheArtMode();
  await store.save(session);
  const emitter = new ConfigUmEmitter();
  await writeText(store.file("project.um"), emitter.emitProject(session));
  await writeText(store.file("project.config.um"), emitter.emitConfig(session.mode));

  const entityAfter = await readFile(path.join(projectRoot, "specs/entities/user.um"), "utf8");
  const propertyAfter = await readFile(path.join(projectRoot, "specs/properties/user.cpf.um"), "utf8");
  assert.equal(entityAfter, entityBefore);
  assert.equal(propertyAfter, propertyBefore);
});
