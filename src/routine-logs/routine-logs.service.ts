import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoutineLogDto } from './dto/routine-log.dto';
import { RoutineLog } from '@prisma/client';

@Injectable()
export class RoutineLogsService {
  constructor(private prisma: PrismaService) {}

  async create(patientId: string, data: CreateRoutineLogDto): Promise<RoutineLog> {
    // Multi-tenant check: Does the plan belong to the patient?
    const plan = await this.prisma.plan.findUnique({
      where: { id: data.planId },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    if (plan.patientId !== patientId) {
      throw new ForbiddenException('Este plano não pertence a você');
    }

    return this.prisma.routineLog.create({
      data: {
        ...data,
        patientId,
      },
    });
  }

  async findMyLogs(patientId: string): Promise<RoutineLog[]> {
    return this.prisma.routineLog.findMany({
      where: { patientId },
      include: { plan: true },
      orderBy: { loggedAt: 'desc' },
    });
  }

  async findAllForPatient(professionalId: string, patientId: string): Promise<RoutineLog[]> {
    // Multi-tenant check: Does the patient belong to the professional?
    const patient = await this.prisma.user.findFirst({
      where: { id: patientId, professionalId },
    });

    if (!patient) {
      throw new ForbiddenException('Você não tem permissão para acessar os registros deste paciente');
    }

    return this.prisma.routineLog.findMany({
      where: { patientId },
      include: { plan: true },
      orderBy: { loggedAt: 'desc' },
    });
  }
}
