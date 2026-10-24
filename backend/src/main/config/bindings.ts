import { AuthTokenService } from '@application/gateways/AuthTokenService';
import { LlmGateway } from '@application/gateways/LlmGateway';
import { PasswordHasher } from '@application/gateways/PasswordHasher';
import { BcryptPasswordHasher } from '@infra/cryptography/BcryptPasswordHasher';
import { GeminiLlmGateway } from '@infra/gateways/GeminiLlmGateway';
import { JwtAuthTokenService } from '@infra/gateways/JwtAuthTokenService';
import { Registry } from '@kernel/di/Registry';

const registry = Registry.getInstance();

registry.bind(PasswordHasher, BcryptPasswordHasher);
registry.bind(AuthTokenService, JwtAuthTokenService);
registry.bind(LlmGateway, GeminiLlmGateway);
