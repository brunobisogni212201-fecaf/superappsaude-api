import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// O decorator @Global garante que o banco de dados possa ser instanciado em QUALQUER
// lugar do NestJS sem precisarmos ficar re-importando este módulo nos PatientsModule, PlansModule, etc.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
