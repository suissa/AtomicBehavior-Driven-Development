#!/usr/bin/env node
import { Command } from "commander";
import { registerAskCommand } from "./commands/ask.js";
import { registerBuildCommand } from "./commands/build.js";
import { registerCollaborateCommand } from "./commands/collaborate.js";
import { registerDoctorCommand } from "./commands/doctor.js";
import { registerGenerateCommand } from "./commands/generate.js";
import { registerInitCommand } from "./commands/init.js";
import { registerInspectCommand } from "./commands/inspect.js";
import { registerModeCommand } from "./commands/mode.js";
import { registerReuseReportCommand } from "./commands/reuse-report.js";
import { registerSearchCommand } from "./commands/search.js";
import { registerValidateCommand } from "./commands/validate.js";

const program = new Command();

program
  .name("abdd")
  .description("Piaget Freinet: AtomicBehavior-Driven Development Builder")
  .version("0.1.0");

registerInitCommand(program);
registerBuildCommand(program);
registerAskCommand(program);
registerSearchCommand(program);
registerInspectCommand(program);
registerGenerateCommand(program);
registerModeCommand(program);
registerReuseReportCommand(program);
registerCollaborateCommand(program);
registerValidateCommand(program);
registerDoctorCommand(program);

await program.parseAsync(process.argv);
