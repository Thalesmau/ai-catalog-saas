import { z } from 'zod';

export interface IAgentTool<TInput extends z.ZodType = z.ZodType> {
  name: string;
  description: string;
  inputSchema: TInput;
  run(input: z.infer<TInput>): Promise<unknown>;
}

export function defineTool<TInput extends z.ZodType>(tool: IAgentTool<TInput>): IAgentTool {
  return tool as unknown as IAgentTool;
}
