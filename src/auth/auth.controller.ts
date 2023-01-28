import { Body, Controller, Post } from '@nestjs/common';
import { AuthDto } from 'src/dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    public authService: AuthService
  ){}
  @Post('signin')
  signin(@Body() dto: AuthDto){
    return this.authService.signin(dto)
  }
  @Post('signup')
  signup(@Body() dto: AuthDto){
    return this.authService.signup(dto)
  }
}
