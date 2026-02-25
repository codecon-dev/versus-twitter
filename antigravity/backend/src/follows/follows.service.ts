import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';


@Injectable()
export class FollowsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

  async follow(followerId: string, followingUsername: string) {
    const userToFollow = await this.prisma.user.findUnique({
      where: { username: followingUsername }
    });

    if (!userToFollow) {
      throw new NotFoundException('User not found');
    }

    if (userToFollow.id === followerId) {
      throw new ConflictException('Cannot follow yourself');
    }

    try {
      await this.prisma.follow.create({
        data: {
          followerId,
          followingId: userToFollow.id
        }
      });
      await this.notificationsService.createNotification(userToFollow.id, followerId, 'FOLLOW');
      return { success: true };
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new ConflictException('Already following this user');
      }
      throw e;
    }
  }

  async unfollow(followerId: string, followingUsername: string) {
    const userToUnfollow = await this.prisma.user.findUnique({
      where: { username: followingUsername }
    });

    if (!userToUnfollow) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.follow.deleteMany({
      where: {
        followerId,
        followingId: userToUnfollow.id
      }
    });

    return { success: true };
  }
}
