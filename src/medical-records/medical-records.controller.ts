import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from './dto/medical-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles, Role } from '../auth/guards/roles.guard';

@Controller('medical-records')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post()
  @Roles(Role.PROFESSIONAL)
  create(@Req() req: Request, @Body() createMedicalRecordDto: CreateMedicalRecordDto) {
    return this.medicalRecordsService.create((req.user as any).sub, createMedicalRecordDto);
  }

  @Get('my')
  @Roles(Role.PATIENT)
  findMy(@Req() req: Request) {
    return this.medicalRecordsService.findMyRecords((req.user as any).sub);
  }

  @Get('patient/:patientId')
  @Roles(Role.PROFESSIONAL)
  findAllForPatient(@Req() req: Request, @Param('patientId') patientId: string) {
    return this.medicalRecordsService.findAllForPatient((req.user as any).sub, patientId);
  }

  @Patch(':id')
  @Roles(Role.PROFESSIONAL)
  update(@Req() req: Request, @Param('id') id: string, @Body() updateMedicalRecordDto: UpdateMedicalRecordDto) {
    return this.medicalRecordsService.update((req.user as any).sub, id, updateMedicalRecordDto);
  }
}
