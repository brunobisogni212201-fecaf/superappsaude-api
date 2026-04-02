import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNutritionalInputDto } from './dto/nutritional-input.dto';
import { NutritionalInput } from '@prisma/client';

@Injectable()
export class NutritionalInputsService {
  constructor(private prisma: PrismaService) {}

  async create(patientId: string, data: CreateNutritionalInputDto): Promise<NutritionalInput> {
    return this.prisma.nutritionalInput.create({
      data: {
        ...data,
        patientId,
      },
    });
  }

  async findMyInputs(patientId: string): Promise<NutritionalInput[]> {
    return this.prisma.nutritionalInput.findMany({
      where: { patientId },
      orderBy: { registeredAt: 'desc' },
    });
  }

  async findAllForPatient(professionalId: string, patientId: string): Promise<NutritionalInput[]> {
    // Multi-tenant check: Does the patient belong to the professional?
    const patient = await this.prisma.user.findFirst({
      where: { id: patientId, professionalId },
    });

    if (!patient) {
      throw new ForbiddenException('Você não tem permissão para acessar os inputs nutricionais deste paciente');
    }

    return this.prisma.nutritionalInput.findMany({
      where: { patientId },
      orderBy: { registeredAt: 'desc' },
    });
  }
}
