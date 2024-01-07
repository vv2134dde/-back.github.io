import { injectable, inject } from "inversify";
import { BooksRepository } from "../repository/book-repository";
import { TYPES } from "../../../../index";
import { Book } from "@prisma/client";
import { ICreateBookPayload } from "../../../interfaces/interfaces";

@injectable()

export class BooksService {
  private booksRepository: BooksRepository;

  constructor() {
    this.booksRepository = new BooksRepository();
  }

  public async createBook(bookData: ICreateBookPayload) {
    const newBook = await this.booksRepository.create(bookData);
    if (newBook) {
      return {
        success: true,
        message: `Book ${newBook.id} and related data successfully created`,
      };
    }
  }

  public async editBook(
    bookId: number,
    updateData: Partial<Omit<Book, "id">>,
    updateAuthors: number | number[],
    updateCategories: number | number[]
  ) {
    const updateResult = await this.booksRepository.update(
      bookId,
      updateData,
      updateAuthors,
      updateCategories
    );

    if (updateResult) {
      return {
        success: true,
        message: `Book ${updateResult.id} and related data successfully updated`,
      };
    }
  }

  public removeBook(bookId: number) {
    return this.booksRepository.delete(bookId);
  }

  public async getBook(id: number) {
    return this.booksRepository.findOne(id);
  }

  public async getBooks(page = 1, perPage = 5, categoryNames: string[]) {
    return this.booksRepository.findAll(page, perPage, categoryNames);
  }
}
