import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class OnboardingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Promove um usuário comum para PACIENTE ativo.
   * Cria o registro médico inicial (Anamnese do Onboarding).
   */
  async promoteToPatient(userId: string, medicalData?: { anamnesis: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    return this.prisma.$transaction(async (tx) => {
      // 1. Marca onboarding como completo e garante role PATIENT
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { 
          onboardingCompleted: true,
          role: Role.PATIENT 
        },
      });

      // 2. Cria o registro médico inicial se houver dados
      if (medicalData?.anamnesis) {
        await tx.medicalRecord.create({
          data: {
            patientId: userId,
            content: medicalData.anamnesis,
            clinicalNotes: 'Registro automático do Onboarding inicial.',
          },
        });
      }

      return updatedUser;
    });
  }

  /**
   * Promove um usuário comum para PROFISSIONAL ativo (Gestor de Clínica).
   * Cria a Clínica, associa o dono e prepara a assinatura.
   */
  async promoteToProfessional(userId: string, data: { 
    clinicName: string, 
    cnpj?: string, 
    address?: string, 
    phone?: string,
    plan: string,
    team?: { email: string, role: string }[] 
  }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    return this.prisma.$transaction(async (tx) => {
      // 1. Cria a Clínica vinculada ao usuário
      const clinic = await tx.clinic.create({
        data: {
          name: data.clinicName,
          cnpj: data.cnpj,
          address: data.address,
          phone: data.phone,
          ownerId: userId,
        },
      });

      // 2. Atualiza o usuário para PROFESSIONAL e vincula à clínica
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { 
          onboardingCompleted: true,
          role: Role.PROFESSIONAL,
          clinicId: clinic.id
        },
      });

      // 3. Processa convites para a equipe (opcional no MVP)
      if (data.team && data.team.length > 0) {
        for (const member of data.team) {
          await tx.invite.create({
            data: {
              email: member.email,
              professionalId: userId,
              status: 'PENDING',
            },
          });
        }
      }

      // 4. Cria a assinatura com base no plano selecionado
      await tx.subscription.upsert({
        where: { userId },
        create: {
          userId,
          status: 'ACTIVE',
          planType: data.plan,
        },
        update: {
          status: 'ACTIVE',
          planType: data.plan,
        },
      });

      return { user: updatedUser, clinic };
    });
  }
}
