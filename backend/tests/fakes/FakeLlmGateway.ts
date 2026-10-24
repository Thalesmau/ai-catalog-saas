import { LlmGateway } from '@application/gateways/LlmGateway';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class FakeLlmGateway extends LlmGateway {
  static script: FakeLlmGateway.Step[] = [];
  static lastParams: LlmGateway.RunAgentParams | undefined;

  static reset() {
    FakeLlmGateway.script = [];
    FakeLlmGateway.lastParams = undefined;
  }

  async runAgent(params: LlmGateway.RunAgentParams): Promise<LlmGateway.RunAgentResult> {
    FakeLlmGateway.lastParams = params;
    let text = '';

    for (const [index, step] of FakeLlmGateway.script.entries()) {
      if (step.type === 'fail') {
        throw step.error;
      }

      if (step.type === 'text') {
        text += step.text;
        params.onEvent({ type: 'text', delta: step.text });
        continue;
      }

      const tool = params.tools.find(t => t.name === step.name);

      if (!tool) {
        throw new Error(`Tool "${step.name}" not provided to the agent.`);
      }

      const id = `call_${index}`;
      params.onEvent({ type: 'tool_call', id, name: step.name, input: step.input });

      const output = await tool.run(tool.inputSchema.parse(step.input));
      params.onEvent({ type: 'tool_result', id, name: step.name, output, isError: false });
    }

    params.onEvent({ type: 'done' });

    return { text };
  }
}

export namespace FakeLlmGateway {
  export type Step =
    | { type: 'text'; text: string }
    | { type: 'tool'; name: string; input: Record<string, unknown> }
    | { type: 'fail'; error: Error };
}
