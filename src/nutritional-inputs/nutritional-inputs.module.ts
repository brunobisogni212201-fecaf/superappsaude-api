import { Module } from '@nestjs/common';
import { NutritionalInputsService } from './nutritional-inputs.service';
import { NutritionalInputsController } from './nutritional-inputs.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [NutritionalInputsController],
  providers: [NutritionalInputsService],
  exports: [NutritionalInputsService],
})
export class NutritionalInputsModule {}
