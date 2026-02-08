import {Body, Controller, Get, Param, Post, UseGuards, UsePipes} from "../../core/decorators";

import {BooksService} from './books.service.js';
import {ZodValidationPipe} from "../pipes/zod.pipe";
import {booksSchema} from "./books.schema";
import {Roles, RolesGuard} from "../guards/roles.guard";

@Controller('/books')
@UseGuards(RolesGuard) // застосовуємо глобально до всіх методів контролера
export class BooksController {
  constructor(private svc: BooksService) {}

  @Get('/')
  @Roles('admin')
  list() {
    return this.svc.findAll();
  }

  @Get('/:id')
  one(@Param('id') id:string) {
    return this.svc.findOne(+id);
  }

  @Post('/')
  @UsePipes(ZodValidationPipe)
  add(@Body() body: { title: string }) {
    return this.svc.create(body.title);
  }
}
