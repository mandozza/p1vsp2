import { z } from 'zod';
import { appSettings } from './schema';

export const AppSettingsSchema = z.object({
  key: z.string().min(1),
  value: z.any(),
});

export type IAppSettings = z.infer<typeof AppSettingsSchema> & {
  id: string;
  _id: string; // Maintain backward compatibility
  createdAt: Date;
  updatedAt: Date;
};

export const AppSettings = appSettings;
export default appSettings;
