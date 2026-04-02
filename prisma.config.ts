import path from 'node:path';
import type { PrismaConfig } from 'prisma';

export default {
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  migrate: {
    async development() {
      return {
        url: process.env.DATABASE_URL ?? 'postgresql://postgres:Saude123SenhaForte!@34.122.203.232:5432/saude_db?schema=public',
      };
    },
  },
} satisfies PrismaConfig;
