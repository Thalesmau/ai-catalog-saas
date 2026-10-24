import { buildCatalogAgentPrompt } from '@application/ai/prompts/catalogAgentPrompt';
import { createProductTools } from '@application/ai/tools/productTools';
import { ErrorCode } from '@application/errors/ErrorCode';
import { NotFound } from '@application/errors/http/NotFound';
import { LlmGateway } from '@application/gateways/LlmGateway';
import { CompanyRepository } from '@infra/database/repositories/CompanyRepository';
import { ProductRepository } from '@infra/database/repositories/ProductRepository';
import { Injectable } from '@kernel/decorators/Injectable';

const MAX_HISTORY_MESSAGES = 10;

@Injectable()
export class ChatUseCase {
  constructor(
    private readonly llmGateway: LlmGateway,
    private readonly companyRepository: CompanyRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute({ companyId, message, history, onEvent, signal }: ChatUseCase.Input): Promise<ChatUseCase.Output> {
    const company = await this.companyRepository.findById(companyId);

    if (!company) {
      throw new NotFound(ErrorCode.COMPANY_NOT_FOUND, 'Empresa não encontrada.');
    }

    const tools = createProductTools({ companyId, productRepository: this.productRepository });

    const { text } = await this.llmGateway.runAgent({
      system: buildCatalogAgentPrompt(company.name),
      messages: [...history.slice(-MAX_HISTORY_MESSAGES), { role: 'user', content: message }],
      tools,
      onEvent,
      signal,
    });

    return { answer: text };
  }
}

export namespace ChatUseCase {
  export type Input = {
    companyId: string;
    message: string;
    history: LlmGateway.Message[];
    onEvent: (event: LlmGateway.AgentEvent) => void;
    signal?: AbortSignal;
  };

  export type Output = {
    answer: string;
  };
}
