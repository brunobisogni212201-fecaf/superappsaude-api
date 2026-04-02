import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { firebaseUid },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: {
    firebaseUid: string;
    email: string;
    name: string;
    role?: Role;
    onboardingCompleted?: boolean;
  }): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async completeOnboarding(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { onboardingCompleted: true },
    });
  }
}
