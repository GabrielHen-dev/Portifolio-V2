// CLI que cria o administrador: senha sem eco, QR do TOTP e códigos de recuperação.

import { stdin, stdout } from 'node:process';
import qrcode from 'qrcode';
import { buildContainer } from '../container.js';
import { runMigrations } from '../infrastructure/database/migrator.js';
import { closeDatabase } from '../infrastructure/database/connection.js';
import { DomainError } from '../shared/errors/index.js';

const KEY_CTRL_C = 3;
const KEY_CTRL_D = 4;
const KEY_BACKSPACE = 8;
const KEY_DELETE = 127;
const FIRST_PRINTABLE = 32;

function createPrompter() {
  const isTty = stdin.isTTY === true;

  let lineBuffer = '';
  let lastWasCarriageReturn = false;
  let masked = false;

  const readyLines: string[] = [];
  let waiting: ((line: string) => void) | null = null;

  const finishLine = (): void => {
    const line = lineBuffer;
    lineBuffer = '';
    stdout.write('\n');

    if (waiting) {
      const resolve = waiting;
      waiting = null;
      resolve(line);
    } else {
      readyLines.push(line);
    }
  };

  const onData = (chunk: string): void => {
    for (const char of chunk) {
      const code = char.charCodeAt(0);

      if (code === KEY_CTRL_C) {
        stdout.write('\n');
        process.exit(130);
      }

      if (char === '\n' && lastWasCarriageReturn) {
        lastWasCarriageReturn = false;
        continue;
      }
      lastWasCarriageReturn = char === '\r';

      if (char === '\n' || char === '\r' || code === KEY_CTRL_D) {
        finishLine();
        continue;
      }

      if (code === KEY_BACKSPACE || code === KEY_DELETE) {
        if (lineBuffer.length > 0) {
          lineBuffer = lineBuffer.slice(0, -1);
          if (isTty && !masked) stdout.write('\b \b');
        }
        continue;
      }

      if (code < FIRST_PRINTABLE) continue;

      lineBuffer += char;

      if (isTty && !masked) stdout.write(char);
    }
  };

  if (isTty) stdin.setRawMode(true);
  stdin.setEncoding('utf8');
  stdin.on('data', onData);
  stdin.resume();

  return {
    ask(label: string, options: { mask?: boolean } = {}): Promise<string> {
      masked = options.mask === true;
      stdout.write(label);

      const buffered = readyLines.shift();
      if (buffered !== undefined) {
        return Promise.resolve(buffered);
      }

      return new Promise<string>((resolve) => {
        waiting = resolve;
      });
    },

    close(): void {
      stdin.off('data', onData);
      if (isTty) stdin.setRawMode(false);
      stdin.pause();
    },
  };
}

async function main(): Promise<void> {
  await runMigrations();

  const prompt = createPrompter();
  const container = buildContainer();

  try {
    console.log('\n=== Criacao do administrador do painel ===\n');

    const email = await prompt.ask('E-mail: ');
    const name = await prompt.ask('Nome de exibicao [Gabriel]: ');
    const password = await prompt.ask('Senha (min. 12 caracteres, com maiuscula, minuscula e numero): ', {
      mask: true,
    });
    const confirmation = await prompt.ask('Confirme a senha: ', { mask: true });

    if (password !== confirmation) {
      console.error('\nAs senhas nao conferem. Nada foi criado.');
      process.exit(1);
    }

    const result = await container.identity.provisionAdmin.execute({
      email: email.trim(),
      name: name.trim() || 'Gabriel',
      password,
    });

    const qr = await qrcode.toString(result.enrollmentUrl, { type: 'terminal', small: true });

    console.log('\nAdministrador criado.\n');
    console.log('1) Escaneie o QR code abaixo no Google Authenticator, Authy ou 1Password:\n');
    console.log(qr);
    console.log(`Se o QR nao renderizar, cadastre manualmente por esta URL:\n   ${result.enrollmentUrl}\n`);
    console.log('2) Guarde os codigos de recuperacao. Eles NAO serao exibidos de novo:\n');

    for (const code of result.recoveryCodes) {
      console.log(`   ${code}`);
    }

    console.log('\nCada codigo funciona uma unica vez, no lugar do codigo de 6 digitos.');
    console.log('Guarde fora do computador — num gerenciador de senhas ou no papel.\n');
  } finally {
    prompt.close();
  }
}

main()
  .then(async () => {
    await closeDatabase();
    process.exit(0);
  })
  .catch(async (err) => {
    if (err instanceof DomainError) {
      console.error(`\nErro: ${err.message}\n`);
    } else {
      console.error('\nFalha ao criar o administrador:', err);
    }
    await closeDatabase().catch(() => {});
    process.exit(1);
  });
