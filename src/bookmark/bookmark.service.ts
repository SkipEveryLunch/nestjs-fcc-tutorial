import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma:PrismaService){}
  async getBookMarks(userId: number){
    return await this.prisma.bookmark.findMany({
      where: {
        userId
      }
    })
  }
  async getBookMarkById(userId: number, bookId: number){
    const bookmark = await this.prisma.bookmark.findFirst({
      where: {
        id: bookId,
      }
    })
    return bookmark
  }
  async createBookMark(userId: number, dto: CreateBookmarkDto){
    const bookmark =
      await this.prisma.bookmark.create({
        data: {
          userId,
          ...dto,
        },
      });
    return bookmark
  }
  async editBookMark(userId: number, bookmarkId: number, dto: EditBookmarkDto){
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {id: bookmarkId}
    })
    if(!bookmark || bookmark.userId !== userId){
      throw new ForbiddenException('bookmarked by another user')
    }
    return this.prisma.bookmark.update({
      where: {id: bookmarkId},
      data: {...dto},
    })
  }
  async deleteBookMark(userId: number, bookmarkId: number){
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {id: bookmarkId}
    })
    if(!bookmark || bookmark.userId !== userId){
      throw new ForbiddenException('bookmarked by another user')
    }
    await this.prisma.bookmark.delete({
      where: {id: bookmarkId},
    })
  }
}
