import { Module } from '@nestjs/common';
import { RoutineLogsService } from './routine-logs.service';
import { RoutineLogsController } from './routine-logs.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [RoutineLogsController],
  providers: [RoutineLogsService],
  exports: [RoutineLogsService],
})
export class RoutineLogsModule {}
