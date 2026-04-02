import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { PlansModule } from './plans/plans.module';
import { RoutineLogsModule } from './routine-logs/routine-logs.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { NutritionalInputsModule } from './nutritional-inputs/nutritional-inputs.module';
import { OnboardingModule } from './onboarding/onboarding.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 300000, // 5 minutes
        limit: 5,
      },
    ]),
    PrismaModule,
    UsersModule,
    AuthModule,
    HealthModule,
    PlansModule,
    RoutineLogsModule,
    MedicalRecordsModule,
    NutritionalInputsModule,
    OnboardingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
