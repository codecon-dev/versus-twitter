import { Controller, Get, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserUpdateDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req: any) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(@Request() req: any, @Body() updateDto: UserUpdateDto) {
    return this.usersService.update(req.user.id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':username')
  async getUserProfile(@Param('username') username: string) {
    return this.usersService.getProfile(username);
  }
}
