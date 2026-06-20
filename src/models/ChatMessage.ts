import { z } from 'zod';
import { chatMessages } from './schema';

export const ChatMessageSchema = z.object({
  userId: z.string(),
  message: z.string().max(280),
});

export type IChatMessage = z.infer<typeof ChatMessageSchema> & {
  id: string;
  _id: string; // Maintain backward compatibility
  createdAt: Date;
};

export const ChatMessage = chatMessages;
export default chatMessages;
