import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { RoutineLogsService } from './routine-logs.service';
import { CreateRoutineLogDto } from './dto/routine-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles, Role } from '../auth/guards/roles.guard';

@Controller('routine-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoutineLogsController {
  constructor(private readonly routineLogsService: RoutineLogsService) {}

  @Post()
  @Roles(Role.PATIENT)
  create(@Req() req: Request, @Body() createRoutineLogDto: CreateRoutineLogDto) {
    return this.routineLogsService.create((req.user as any).sub, createRoutineLogDto);
  }

  @Get('my')
  @Roles(Role.PATIENT)
  findMy(@Req() req: Request) {
    return this.routineLogsService.findMyLogs((req.user as any).sub);
  }

  @Get('patient/:patientId')
  @Roles(Role.PROFESSIONAL)
  findAllForPatient(@Req() req: Request, @Param('patientId') patientId: string) {
    return this.routineLogsService.findAllForPatient((req.user as any).sub, patientId);
  }
}
