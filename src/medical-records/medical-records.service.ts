import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from './dto/medical-record.dto';
import { MedicalRecord } from '@prisma/client';

@Injectable()
export class MedicalRecordsService {
  constructor(private prisma: PrismaService) {}

  async create(professionalId: string, data: CreateMedicalRecordDto): Promise<MedicalRecord> {
    // Multi-tenant check: Is the patient linked to this professional?
    const patient = await this.prisma.user.findUnique({
      where: { id: data.patientId },
    });

    if (!patient) {
      throw new NotFoundException('Paciente não encontrado');
    }

    if (patient.professionalId !== professionalId) {
      throw new ForbiddenException('Você não tem permissão para criar prontuários para este paciente');
    }

    return this.prisma.medicalRecord.create({
      data,
    });
  }

  async findAllForPatient(professionalId: string, patientId: string): Promise<MedicalRecord[]> {
    // Multi-tenant check: Does the patient belong to the professional?
    const patient = await this.prisma.user.findFirst({
      where: { id: patientId, professionalId },
    });

    if (!patient) {
      throw new ForbiddenException('Você não tem permissão para acessar os prontuários deste paciente');
    }

    return this.prisma.medicalRecord.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMyRecords(patientId: string): Promise<Partial<MedicalRecord>[]> {
    // Patients should not see clinicalNotes
    return this.prisma.medicalRecord.findMany({
      where: { patientId },
      select: {
        id: true,
        content: true,
        createdAt: true,
        // clinicalNotes: false, // Explicitly excluded by omission
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(professionalId: string, id: string, data: UpdateMedicalRecordDto): Promise<MedicalRecord> {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { id },
      include: { patient: true },
    });

    if (!record) {
      throw new NotFoundException('Prontuário não encontrado');
    }

    if (record.patient.professionalId !== professionalId) {
      throw new ForbiddenException('Você não tem permissão para editar este prontuário');
    }

    return this.prisma.medicalRecord.update({
      where: { id },
      data,
    });
  }
}
