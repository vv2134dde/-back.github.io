import { Controller } from "./base-controller";
import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../index";
import { BooksService } from "../model/services/books-service";
import { Book } from "@prisma/client";
import { param, validationResult, body, query } from "express-validator";
import { ICreateBookPayload } from "../../interfaces/interfaces";


@injectable()
export class BooksController extends Controller {

  private booksService: BooksService;
  private paths = {
    books: "/books",
    booksId: "/books/:id",
  } as const

  constructor() {
    super();
    this.booksService = new BooksService();

    this.bindRoutes([
      {
        path: this.paths.books,
        method: "get",
        fn: this.getBooks,
        validation: [
          query("page").isInt({ min: 1 }).withMessage("Invalid page number"),
          query("perPage")
            .isInt({ min: 1, max: 20 })
            .withMessage("Invalid perPage value"),
          query("categories")
            .isArray({ min: 1 })
            .withMessage("Category field is empty. Choose book category"),
        ],
      },
      {
        path: this.paths.booksId,
        method: "get",
        fn: this.getBook,
        validation: [param("id").isEmpty()!.withMessage("Book id is empty")],
      },
      {
        path: this.paths.books,
        method: "post",
        fn: this.addBook,
        validation: [
          body("book.title").notEmpty().withMessage("Title is required"),
          body("book.language").notEmpty().withMessage("Language is required"),
          body("book.amount")
            .isFloat({ min: 0 })
            .withMessage("Amount must be a positive number"),
          body("book.year").isISO8601().withMessage("Invalid year format"),
          body("book.description")
            .notEmpty()
            .withMessage("Description is required"),
        ],
      },
      {
        path: this.paths.booksId,
        method: "put",
        fn: this.updateBook,
        validation: [param("id").isEmpty()!.withMessage("Book id is empty")]
      },
      {
        path: this.paths.booksId,
        method: "delete",
        fn: this.deleteBook,
      },
    ]);
  }

  public addBook = async (
    req: Request<{}, {}, { bookData: ICreateBookPayload }>,
    res: Response
  ) => {
    try {
      const errors = validationResult(req.body);
      if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
      }
      const { bookData } = req.body;
      const newBook = await this.booksService.createBook(bookData);

      if (!newBook || !newBook.success) {
        return res.status(400).send("Error creating a book");
      }

      res.status(201).send(newBook);
    } catch (error) {
      this.throwServerError(res, error as Error);
    }
  };

  public updateBook = async (
    req: Request<{id: string}, {}, {
        updateData: Partial<Omit<Book, "id">>;
        updatedAuthorIds: number | number[];
        updatedCategoryIds: number | number[];
      }
    >,
    res: Response
  ) => {
    try {
      const { id } = req.params;
      const updateData = req.body.updateData;
      const updatedAuthors = req.body.updatedAuthorIds;
      const updatedCategories = req.body.updatedCategoryIds;
      const updatedBook = await this.booksService.editBook(parseInt(id), updateData, updatedAuthors, updatedCategories);
      return res.status(201).send(updatedBook);
    } catch (error) {
      this.throwServerError(res, error as Error);
    }
  };

  public deleteBook = async (req: Request<{id: string}, {}, {}>, res: Response) => {
    try {
      const { id } = req.params;
      const result = await this.booksService.removeBook(parseInt(id))
      if (result.success) {
        return res.status(201).send(result);
      }
    } catch (error) {
      this.throwServerError(res, error as Error);
    }
  }

  public getBooks = async (
    req: Request<
      {},
      { page: number; perPage: number; categories: string[] },
      {}
    >,
    res: Response
  ) => {
    try {
      const errors = validationResult(req.query); // check this shit again
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const categories = req.query.categories as string[];
      const page = Number(req.query.page);
      const perPage = Number(req.query.perPage);
      const booksList = await this.booksService.getBooks(
        page,
        perPage,
        categories
      );

      res.json(booksList);
    } catch (e) {
      return res.status(500).send(`Something went wrong: ${e}`);
    }
  };

  public getBook = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(param);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { id } = req.params;
      const book = await this.booksService.getBook(parseInt(id));
      if (!book) {
        return res.status(404).send(`Book with id ${id} does not exist`);
      }
      return res.status(200).send(book);
    } catch (error) {
      this.throwServerError(res, error as Error);
    }
  };
}
