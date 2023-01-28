import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2'
import { AuthDto } from 'src/dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService
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
    delete user.hash
    return user
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
      delete user.hash;
      return user
    }catch(e){
      if(e instanceof PrismaClientKnownRequestError){
        if(e.code === 'P2002'){
          throw new ForbiddenException('Credentials Taken')
        }
      }
      throw e;
    }
  }
}
