import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async createNotification(userId: string, actorId: string, type: string, postId?: string) {
    if (userId === actorId) return; // Don't notify yourself

    await this.prisma.notification.create({
      data: {
        userId,
        actorId,
        type,
        postId
      }
    });
  }

  async getNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        actor: { select: { id: true, name: true, username: true, profilePic: true } },
        post: { select: { content: true } }
      }
    });
  }

  async markAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });
  }
}
