import {Injectable} from "../../core/decorators";

export interface Book { id: number; title: string; }

@Injectable()
export class BooksService {
  #data: Book[] = [{ id: 1, title: '1984' }];
  findAll() { return this.#data; }
  findOne(id: number) { return this.#data.find(b => b.id === id); }
  create(title: string) {
    const book = { id: Date.now(), title };
    this.#data.push(book); return book;
  }
}
