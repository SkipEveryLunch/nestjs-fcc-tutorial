import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { getUser } from '../auth/decorators';
import { JwtGuard } from '../auth/guard';
import { BookmarkService } from './bookmark.service';
import { EditBookmarkDto } from './dto';
import { CreateBookmarkDto } from './dto/create-bookmark-dto';

@UseGuards(JwtGuard)
@Controller('bookmark')
export class BookmarkController {
  constructor(private bookmarkService: BookmarkService){}
  @Get()
  async getBookmarks(
    @getUser('id') id: number
  ){
    return this.bookmarkService.getBookMarks(id)
  }
  @Get(':id')
  async getBookmarkById(
    @getUser('id') id: number,
    @Param('id', ParseIntPipe) bookmarkId: number
  ){
    return this.bookmarkService.getBookMarkById(id, bookmarkId)
  }
  @Post()
  async createBookmark(
    @getUser('id') id: number,
    @Body() dto: CreateBookmarkDto
  ){
    return this.bookmarkService.createBookMark(id,dto)
  }
  @HttpCode(HttpStatus.CREATED)
  @Patch(':id')
  async editBookmark(
    @getUser('id') id: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
    @Body() dto: EditBookmarkDto
  ){
    return this.bookmarkService.editBookMark(id,bookmarkId, dto)
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteBookmark(
    @getUser('id') id: number,
    @Param('id', ParseIntPipe) bookmarkId: number
  ){
    return this.bookmarkService.deleteBookMark(id,bookmarkId)
  }
}
