import {Module} from "../../core/decorators";

import {BooksService} from "./books.service";
import {BooksController} from "./books.controller";

@Module({
  controllers: [BooksController],
  providers:   [BooksService],
})
export class BooksModule {}
