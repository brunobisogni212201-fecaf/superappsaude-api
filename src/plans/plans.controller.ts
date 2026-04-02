import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { PlansService } from './plans.service';
import { CreatePlanDto, UpdatePlanDto } from './dto/plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles, Role } from '../auth/guards/roles.guard';

@Controller('plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @Roles(Role.PROFESSIONAL)
  create(@Req() req: Request, @Body() createPlanDto: CreatePlanDto) {
    return this.plansService.create((req.user as any).sub, createPlanDto);
  }

  @Get('my')
  @Roles(Role.PATIENT)
  findMy(@Req() req: Request) {
    return this.plansService.findMyPlans((req.user as any).sub);
  }

  @Get('patient/:patientId')
  @Roles(Role.PROFESSIONAL)
  findAllForPatient(@Req() req: Request, @Param('patientId') patientId: string) {
    return this.plansService.findAllForPatient((req.user as any).sub, patientId);
  }

  @Patch(':id')
  @Roles(Role.PROFESSIONAL)
  update(@Req() req: Request, @Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.plansService.update((req.user as any).sub, id, updatePlanDto);
  }

  @Delete(':id')
  @Roles(Role.PROFESSIONAL)
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.plansService.remove((req.user as any).sub, id);
  }
}
