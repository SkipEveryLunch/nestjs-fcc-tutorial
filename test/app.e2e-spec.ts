import { INestApplication, ValidationPipe } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import { PrismaService } from "../src/prisma/prisma.service"
import { AppModule } from "../src/app.module"
import * as pactum from 'pactum'
import { AuthDto } from "src/dto"
import { EditUserDto } from "src/user/dto"
import { CreateBookmarkDto, EditBookmarkDto } from "src/bookmark/dto"

describe('App e2s', () => {
  let app: INestApplication
  let prisma: PrismaService
  beforeAll(async()=>{
    const moduleRef = await Test.createTestingModule({
      imports:[AppModule]
    }).compile();
    app = moduleRef.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true
    }))
    await app.init()
    await app.listen(3333)

    prisma = app.get(PrismaService)
    prisma.cleanDb()
    pactum.request.setBaseUrl('http://localhost:3333')
  })
  afterAll(async()=>{
    app.close();
  })
  const dto: AuthDto = {
    email: '01@test.io',
    password: '123'
  }
  const editUserDto: EditUserDto = {
    firstName: 'test',
    lastName: 'test'
  }
  describe('Auth',()=>{
    describe('Signup',()=>{
      it('should failed to signup without email',()=>{
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password
          })
          .expectStatus(400)
      })
      it('should failed to signup without password',()=>{
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email
          })
          .expectStatus(400)
      })
      it('should signup',()=>{
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201)
      })
    })
    describe('Signin',()=>{
      it('should failed to signin without email',()=>{
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password
          })
          .expectStatus(400)
      })
      it('should failed to signin without password',()=>{
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email
          })
          .expectStatus(400)
      })
      it('should signin',()=>{
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt','access_token')
      })
    })
  })
  describe('User',()=>{
    it('should fail t0 get the current user without token',()=>{
      return pactum
        .spec()
        .get('/users/me')
        .expectStatus(401)
    })
    it('should get the current user',()=>{
      return pactum
        .spec()
        .get('/users/me')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}'
        })
        .expectStatus(200)
    })
    it('should fail to edit the current user without token',()=>{
      return pactum
        .spec()
        .patch('/users/me')
        .withBody(editUserDto)
        .expectStatus(401)
    })
    it('should edit the current user',()=>{
      return pactum
        .spec()
        .patch('/users/me')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}'
        })
        .withBody(editUserDto)
        .expectStatus(200)
    })
  })
  describe('Bookmarks',()=>{
    const createBookMarkDto: CreateBookmarkDto = {
      title: "test",
      description: "test",
      link: "test"
    }
    describe('Create a bookmark',()=>{
      it('should create a bookmark',()=>{
        return pactum
          .spec()
          .post('/bookmark')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .withBody(createBookMarkDto)
          .expectStatus(201)
          .stores('bookmarkId', 'id')
      })
    })
    describe('Get bookmarks',()=>{
      it('should get bookmarks',()=>{
        return pactum
          .spec()
          .get('/bookmark')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .expectStatus(200)
          .expectJsonLength(1)
      })
    })
    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmark/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}')
      });
    });
    describe('Edit a bookmark', () => {
      it('should edit a bookmark', () => {
        const newDto: EditBookmarkDto = {
          title: "newTest",
          description: "newTest",
          link: "newTest"
        }
        return pactum
          .spec()
          .patch('/bookmark/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(newDto)
          .expectStatus(201)
          .expectBodyContains(newDto.title)
          .expectBodyContains(newDto.description)
          .expectBodyContains(newDto.link);
      });
    });
    describe('Delete a bookmark', () => {
      it('should delete a bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmark/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(204)
      });
    });
  })
 })