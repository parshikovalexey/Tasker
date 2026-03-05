import { z } from "zod";

export const taskSchema = z.object({
  id: z.string(),
  text: z.string(),
  color: z.string().optional(),
});
export type Task = z.infer<typeof taskSchema>;

export const storageSchema = z.record(z.string(), z.array(taskSchema));
export type StorageData = z.infer<typeof storageSchema>;
