import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { NutritionalInputsService } from './nutritional-inputs.service';
import { CreateNutritionalInputDto } from './dto/nutritional-input.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles, Role } from '../auth/guards/roles.guard';

@Controller('nutritional-inputs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NutritionalInputsController {
  constructor(private readonly nutritionalInputsService: NutritionalInputsService) {}

  @Post()
  @Roles(Role.PATIENT)
  create(@Req() req: Request, @Body() createNutritionalInputDto: CreateNutritionalInputDto) {
    return this.nutritionalInputsService.create((req.user as any).sub, createNutritionalInputDto);
  }

  @Get('my')
  @Roles(Role.PATIENT)
  findMy(@Req() req: Request) {
    return this.nutritionalInputsService.findMyInputs((req.user as any).sub);
  }

  @Get('patient/:patientId')
  @Roles(Role.PROFESSIONAL)
  findAllForPatient(@Req() req: Request, @Param('patientId') patientId: string) {
    return this.nutritionalInputsService.findAllForPatient((req.user as any).sub, patientId);
  }
}
