// import { inject, injectable } from "inversify";
// import { TYPES } from "../../../../index";
// import { DBService } from "../../db-service";
import { Book} from "@prisma/client";
import { ICreateBookPayload } from "../../../interfaces/interfaces";
import { Prisma } from "@prisma/client";
import { BaseRepository } from "./base-repository";

// @injectable()
export class BooksRepository extends BaseRepository<Book> {

  public async create(bookData: ICreateBookPayload) {
    return this.executeAndDisconnect(async () => {
      if (!bookData) {
        throw new Error("No book data to add to the database");
      }
      const { book, authorsIds, categoriesIds, currency } = bookData;
      const year = new Date(book.year).toISOString();
      const newBook = await this.dbService.getClient().book.create({
        data: {
          title: book.title,
          language: book.language,
          amount: book.amount,
          year: year,
          description: book.description,
          currency: {
            connect: { shortName: currency.shortName },
          },
        },
        include: {
          author: true,
          category: true,
          rating: true,
        },
      });

      if (!newBook) {
        throw new Error("Failed to create new book");
      }

      if (authorsIds) {
        const updateAuthorIds = this.convertToArray(authorsIds);
        if (updateAuthorIds.length > 0) {
          await this.dbService.getClient().book.update({
            where: { id: newBook.id },
            data: {
              author: {
                connect: authorsIds.map((id) => ({ id: id })),
              },
            },
          });
        }
      }

      if (categoriesIds) {
        const updateCatIds = this.convertToArray(categoriesIds);
        if (updateCatIds.length > 0) {
          await this.dbService.getClient().book.update({
            where: { id: newBook.id },
            data: {
              author: {
                connect: authorsIds.map((id) => ({ id: id })),
              },
            },
          });
        }
      }

      return newBook;
    });
  }

  public async update(
    bookId: number,
    updateData: Partial<Omit<Book, "id">>,
    authorsIds: number | number[],
    categoriesIds: number | number[]
  ) {
    return this.executeAndDisconnect(async () => {
      const existingBook = await this.findOne(bookId);
      if (!existingBook) {
        throw new Error(`Book with id ${bookId} not found`);
      }
      if (!updateData) {
        throw new Error(`Invalid input data`);
      }
      const updateObject: Prisma.BookUpdateInput = {
        title: updateData.title ?? existingBook.title,
        language: updateData.language ?? existingBook.language,
        amount: updateData.amount ?? existingBook.amount,
        year: updateData.year
          ? new Date(updateData.year).toISOString()
          : existingBook.year,
        description: updateData.description ?? existingBook.description,
        currency: {
          connect: {
            shortName: updateData.currencyId ?? existingBook.currencyId,
          },
        },
      };

      if (authorsIds) {
        const updateAuthorIds = this.convertToArray(authorsIds);
        if (updateAuthorIds.length > 0) {
          updateObject.author = {
            set: updateAuthorIds.map((id) => ({ id: id })),
          };
        }
      }

      if (categoriesIds) {
        const updateCatIds = this.convertToArray(categoriesIds);
        if (updateCatIds.length > 0) {
          updateObject.author = {
            set: updateCatIds.map((id) => ({ id })),
          };
        }
      }

      const updatedBook = await this.dbService.getClient().book.update({
        where: { id: bookId },
        data: updateObject,
        include: {
          author: true,
          category: true,
        },
      });

      if (updatedBook) {
        return updatedBook
      }
    });
  }

  public async delete(bookId: number) {
    return this.executeAndDisconnect(async () => {
      const book = await this.dbService.getClient().book.findUnique({
        where: { id: bookId },
        include: { author: true, category: true },
      });

      if (!book) {
        throw new Error("Book not found");
      }

      await this.dbService.getClient().book.delete({ where: { id: bookId } });

      if (book.author.length > 0) {
        await Promise.all(
          book.author.map((author) => {
            this.dbService.getClient().author.update({
              where: { id: author.id },
              data: { books: { disconnect: { id: bookId } } },
            });
          })
        );
      }

      if (book.category.length > 0) {
        await Promise.all(
          book.category.map((category) =>
            this.dbService.getClient().category.update({
              where: { id: category.id },
              data: { books: { disconnect: { id: bookId } } },
            })
          )
        );
      }

      return {
        success: true,
        message: `Book ${book.id} and related data successfully deleted`,
      };
    });
  }

  public async findOne(id: number) {
    return this.executeAndDisconnect(async () => {
      const book = await this.dbService.getClient().book.findUnique({
        where: {
          id: id,
        },
      });
      return book;
    });
  }

  public async findAll(page: number, perPage: number, categoryNames: string[]) {
    return this.executeAndDisconnect(async () => {
      const offset = (page - 1) * perPage;
      const booksList = await this.dbService.getClient().book.findMany({
        include: {
          author: true,
          category: true,
          rating: true,
        },
        skip: offset,
        take: perPage,
        where: {
          category: {
            some: {
              name: {
                in: categoryNames,
              },
            },
          },
        },
      });
      return booksList;
    });
  }

  public async addRating(bookId: number, userId: number, ratingValue: number) {
    return this.executeAndDisconnect(async () => {
      if (!bookId || !userId || ratingValue < 1 || ratingValue > 5) {
        throw new Error("Invalid rating data");
      }
      const existingRating = await this.dbService
        .getClient()
        .rating.findUnique({
          where: {
            bookId_userId: { bookId, userId },
          },
        });

      if (existingRating) {
        throw new Error("Rating already exists for this book and user");
      }

      const newRating = await this.dbService.getClient().rating.create({
        data: {
          book: { connect: { id: bookId } },
          user: { connect: { id: userId } },
          ratingValue,
        },
      });

      return newRating;
    });
  }
}
