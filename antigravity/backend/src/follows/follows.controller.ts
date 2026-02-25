import { Controller, Post, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users') // Notice we are binding to users route since the path is /users/:username/follow
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':username/follow')
  follow(@Request() req: any, @Param('username') username: string) {
    return this.followsService.follow(req.user.id, username);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':username/follow')
  unfollow(@Request() req: any, @Param('username') username: string) {
    return this.followsService.unfollow(req.user.id, username);
  }
}
