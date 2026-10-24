import { Controller } from '@application/contracts/Controller';
import { StreamController } from '@application/contracts/StreamController';
import { LlmGateway } from '@application/gateways/LlmGateway';
import { ChatUseCase } from '@application/usecases/chat/ChatUseCase';
import { Injectable } from '@kernel/decorators/Injectable';
import { Schema } from '@kernel/decorators/Schema';

import { ChatBody, chatSchema } from './schemas/chatSchema';

@Injectable()
@Schema(chatSchema)
export class ChatController extends StreamController<LlmGateway.AgentEvent, ChatBody> {
  constructor(private readonly chatUseCase: ChatUseCase) {
    super();
  }

  protected override async stream(
    { auth, body }: Controller.Request<'private', ChatBody>,
    emit: (event: LlmGateway.AgentEvent) => void,
    signal: AbortSignal,
  ): Promise<void> {
    await this.chatUseCase.execute({
      companyId: auth.companyId,
      message: body.message,
      history: body.history,
      onEvent: emit,
      signal,
    });
  }
}
