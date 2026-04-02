import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('complete-patient')
  async completePatient(
    @Req() req: Request,
    @Body() medicalData?: { anamnesis: string }
  ) {
    const userId = (req.user as any).sub;
    return this.onboardingService.promoteToPatient(userId, medicalData);
  }

  @Post('complete-professional')
  async completeProfessional(
    @Req() req: Request,
    @Body() data: {
      clinicName: string,
      cnpj?: string,
      address?: string,
      phone?: string,
      plan: string,
      team?: { email: string, role: string }[]
    }
  ) {
    const userId = (req.user as any).sub;
    return this.onboardingService.promoteToProfessional(userId, data);
  }
}
