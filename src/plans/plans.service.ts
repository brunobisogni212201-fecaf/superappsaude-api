import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto, UpdatePlanDto } from './dto/plan.dto';
import { Plan } from '@prisma/client';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  async create(professionalId: string, data: CreatePlanDto): Promise<Plan> {
    // Multi-tenant check: Is the patient linked to this professional?
    const patient = await this.prisma.user.findUnique({
      where: { id: data.patientId },
    });

    if (!patient) {
      throw new NotFoundException('Paciente não encontrado');
    }

    if (patient.professionalId !== professionalId) {
      throw new ForbiddenException('Você não tem permissão para criar planos para este paciente');
    }

    return this.prisma.plan.create({
      data: {
        ...data,
        professionalId,
      },
    });
  }

  async findAllForPatient(professionalId: string, patientId: string): Promise<Plan[]> {
    // Multi-tenant check: Does the patient belong to the professional?
    const patient = await this.prisma.user.findFirst({
      where: { id: patientId, professionalId },
    });

    if (!patient) {
      throw new ForbiddenException('Você não tem permissão para acessar os planos deste paciente');
    }

    return this.prisma.plan.findMany({
      where: { patientId },
    });
  }

  async findMyPlans(patientId: string): Promise<Plan[]> {
    return this.prisma.plan.findMany({
      where: { patientId },
    });
  }

  async findOne(id: string): Promise<Plan | null> {
    return this.prisma.plan.findUnique({
      where: { id },
    });
  }

  async update(professionalId: string, id: string, data: UpdatePlanDto): Promise<Plan> {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    if (plan.professionalId !== professionalId) {
      throw new ForbiddenException('Você não tem permissão para editar este plano');
    }

    return this.prisma.plan.update({
      where: { id },
      data,
    });
  }

  async remove(professionalId: string, id: string): Promise<Plan> {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    if (plan.professionalId !== professionalId) {
      throw new ForbiddenException('Você não tem permissão para remover este plano');
    }

    return this.prisma.plan.delete({
      where: { id },
    });
  }
}
