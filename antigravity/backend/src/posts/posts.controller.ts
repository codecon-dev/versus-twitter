import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { PostsService } from './posts.service';
import { UsersService } from '../users/users.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly usersService: UsersService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: any, @Body() createPostDto: CreatePostDto) {
    return this.postsService.create(req.user.id, createPostDto);
  }

  // Optional: A public feed or absolute list of all posts (useful for discovery)
  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('feed')
  getFeed(@Request() req: any) {
    return this.postsService.getFeed(req.user.id);
  }

  @Get('user/:username')
  async getUserPosts(@Param('username') username: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');
    return this.postsService.findUserPosts(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  likePost(@Request() req: any, @Param('id') id: string) {
    return this.postsService.likePost(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/like')
  unlikePost(@Request() req: any, @Param('id') id: string) {
    return this.postsService.unlikePost(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/retweet')
  retweetPost(@Request() req: any, @Param('id') id: string) {
    return this.postsService.retweetPost(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/retweet')
  unretweetPost(@Request() req: any, @Param('id') id: string) {
    return this.postsService.unretweetPost(req.user.id, id);
  }

  @Get(':id')
  async getPost(@Param('id') id: string) {
    const post = await this.postsService.getPost(id);
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  @Get(':id/comments')
  getComments(@Param('id') id: string) {
    return this.postsService.getComments(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  createComment(
    @Request() req: any,
    @Param('id') postId: string,
    @Body('content') content: string
  ) {
    return this.postsService.createComment(req.user.id, postId, content);
  }
}
