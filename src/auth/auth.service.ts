import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  login(){
    return 'logged in'
  }
  signup(){
    return 'signed up'
  }
}
