import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { NotificationsService } from '../notifications/notifications.service';


@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

  async create(userId: string, createPostDto: CreatePostDto) {
    return await this.prisma.post.create({
      data: {
        content: createPostDto.content,
        authorId: userId,
      },
      include: {
        author: {
          select: { name: true, username: true, profilePic: true }
        }
      }
    });
  }

  async findAll() {
    return this.prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, username: true, profilePic: true } },
        _count: { select: { likes: true, retweets: true, comments: true } }
      }
    });
  }

  async findUserPosts(userId: string) {
    const authoredPosts = await this.prisma.post.findMany({
      where: { authorId: userId },
      include: {
        author: { select: { id: true, name: true, username: true, profilePic: true } },
        _count: { select: { likes: true, retweets: true, comments: true } }
      }
    });

    const retweets = await this.prisma.retweet.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            author: { select: { id: true, name: true, username: true, profilePic: true } },
            _count: { select: { likes: true, retweets: true, comments: true } }
          }
        },
        user: { select: { name: true, username: true } }
      }
    });

    const mappedRetweets = retweets.map(r => ({
      ...r.post,
      createdAt: r.createdAt, // Override with retweet time for sorting
      isRetweet: true,
      retweetedBy: r.user.name,
      retweetedByUsername: r.user.username
    }));

    const combinedPosts = [...authoredPosts, ...mappedRetweets];
    
    // Sort descending by either post creation or retweet time
    combinedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return combinedPosts;
  }

  async likePost(userId: string, postId: string) {
    try {
      await this.prisma.like.create({
        data: { userId, postId }
      });
      const post = await this.prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
      if (post && post.authorId !== userId) {
        await this.notificationsService.createNotification(post.authorId, userId, 'LIKE', postId);
      }
      return { success: true };
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new ConflictException('Already liked this post');
      }
      throw e;
    }
  }

  async unlikePost(userId: string, postId: string) {
    await this.prisma.like.deleteMany({
      where: { userId, postId }
    });
    return { success: true };
  }

  async retweetPost(userId: string, postId: string) {
    try {
      await this.prisma.retweet.create({
        data: { userId, postId }
      });
      const post = await this.prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
      if (post && post.authorId !== userId) {
        await this.notificationsService.createNotification(post.authorId, userId, 'RETWEET', postId);
      }
      return { success: true };
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new ConflictException('Already retweeted this post');
      }
      throw e;
    }
  }

  async unretweetPost(userId: string, postId: string) {
    await this.prisma.retweet.deleteMany({
      where: { userId, postId }
    });
    return { success: true };
  }

  async getFeed(userId: string) {
    // Advanced algorithm: chronological order of posts from users the current user is following, Plus their own posts
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true }
    });

    const followingIds = following.map(f => f.followingId);
    followingIds.push(userId); // include own posts

    // Also include retweets from these users.
    // For simplicity, we just fetch posts where the author is in the following list.
    const posts = await this.prisma.post.findMany({
      where: { authorId: { in: followingIds } },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, username: true, profilePic: true } },
        _count: { select: { likes: true, retweets: true, comments: true } }
      }
    });

    return posts;
  }
  async getPost(id: string) {
    return this.prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, username: true, profilePic: true } },
        _count: { select: { likes: true, retweets: true, comments: true } }
      }
    });
  }

  async getComments(postId: string) {
    return this.prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, username: true, profilePic: true } }
      }
    });
  }

  async createComment(userId: string, postId: string, content: string) {
    const comment = await this.prisma.comment.create({
      data: {
        content,
        authorId: userId,
        postId,
      },
      include: {
        author: { select: { id: true, name: true, username: true, profilePic: true } }
      }
    });

    const post = await this.prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
    if (post && post.authorId !== userId) {
      await this.notificationsService.createNotification(post.authorId, userId, 'COMMENT', postId);
    }
    return comment;
  }
}
