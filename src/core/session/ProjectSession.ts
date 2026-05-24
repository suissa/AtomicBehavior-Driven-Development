import { z } from "zod";

export const projectSessionSchema = z.object({
  id: z.string(),
  projectName: z.string(),
  domain: z.string(),
  systemType: z.string(),
  problemStatement: z.string(),
  entities: z.array(z.unknown()),
  decisions: z.array(z.unknown()),
  mode: z.unknown().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});
