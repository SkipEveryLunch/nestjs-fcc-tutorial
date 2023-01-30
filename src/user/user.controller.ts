import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { getUser } from '../auth/decorators';
import { JwtGuard } from '../auth/guard';
import { UserService } from './user.service';
import { EditUserDto } from './dto'

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(
    private userService: UserService
  ){}
  @Get('me')
  getMe(@getUser() user:User){
    return user;
  }
  @Patch('me')
  async editUser(
    @getUser('id') userId: number,
    @Body() dto:EditUserDto
  ){
    return await this.userService.editUser(userId, dto)
  }
}
