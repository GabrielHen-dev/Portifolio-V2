// Schemas Zod do login e verificação 2FA.

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Informe o e-mail.').max(254),

  password: z.string().min(1, 'Informe a senha.').max(200),
});

export const verifyTwoFactorSchema = z.object({
  code: z.string().trim().min(6, 'Informe o codigo.').max(20),
});
