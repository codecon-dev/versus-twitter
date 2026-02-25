import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserCreateDto, UserResponseDto, UserUpdateDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: UserCreateDto): Promise<UserResponseDto> {
    try {
      return await this.prisma.user.create({ data });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException('Username or email already exists');
      }
      throw error;
    }
  }

  async findByUsername(username: string): Promise<UserResponseDto | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async findById(id: string): Promise<UserResponseDto | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: string, data: UserUpdateDto): Promise<UserResponseDto> {
    try {
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }
      return await this.prisma.user.update({
        where: { id },
        data,
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException('Username or email already exists');
      }
      throw error;
    }
  }

  async getProfile(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        profilePic: true,
        createdAt: true,
        _count: {
          select: { followers: true, following: true }
        }
      }
    });
  }
}
