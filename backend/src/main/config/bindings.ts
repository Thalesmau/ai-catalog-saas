import { AuthTokenService } from '@application/gateways/AuthTokenService';
import { PasswordHasher } from '@application/gateways/PasswordHasher';
import { BcryptPasswordHasher } from '@infra/cryptography/BcryptPasswordHasher';
import { JwtAuthTokenService } from '@infra/gateways/JwtAuthTokenService';
import { Registry } from '@kernel/di/Registry';

const registry = Registry.getInstance();

registry.bind(PasswordHasher, BcryptPasswordHasher);
registry.bind(AuthTokenService, JwtAuthTokenService);
