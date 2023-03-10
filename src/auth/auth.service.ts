import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2'
import { AuthDto } from '../dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService
  ){}
  async signin(dto: AuthDto){
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email
      }
    })
    if(!user){
      throw new ForbiddenException('Incorrect credentials')
    }
    const pwMatch = await argon.verify(user.hash, dto.password)
    if(!pwMatch){
      throw new ForbiddenException('Incorrect credentials')
    }
    return this.signToken(user.id, user.email)
  }
  async signup(dto: AuthDto){
    const hash = await argon.hash(dto.password)
    try{
      const user = await this.prisma.user.create({
        data:{
          email: dto.email,
          hash,
        }
      })
      return this.signToken(user.id, user.email)
    }catch(e){
      if(e instanceof PrismaClientKnownRequestError){
        if(e.code === 'P2002'){
          throw new ForbiddenException('Credentials Taken')
        }
      }
      throw e;
    }
  }
  async signToken(
    userId: number,
    email: string
  ):Promise<{access_token: string}>{
    const payload = {
      sub: userId,
      email
    }
    const access_token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: this.config.get("JWT_SECRET")
    })
    return {access_token}
  }
}
