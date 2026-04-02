import { Controller, Post, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('complete-onboarding')
  async completeOnboarding(@Req() req: Request) {
    return this.usersService.completeOnboarding((req.user as any).sub);
  }
}
