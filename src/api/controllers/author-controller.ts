import { Author } from "@prisma/client";
import { AuthorService } from "../model/services/author-service";
import { Controller } from "./base-controller";
import { Request, Response } from "express";
import { param, validationResult, body, query } from "express-validator";

export class AuthorController extends Controller {

  private authorService: AuthorService;
  private paths = {
    authors: "/authors",
    authorsId: "/authors/:id",
    delete: "/authors/delete",
  } as const;

  constructor() {
    super();
    this.authorService = new AuthorService();

    this.bindRoutes([
      {
        path: this.paths.authors,
        method: "get",
        fn: this.getAuthors,
        validation: [
          query("page").isInt({ min: 1 }).withMessage("Invalid page number"),
          query("perPage")
            .isInt({ min: 1 })
            .withMessage("Invalid perPage value"),
        ],
      },
      {
        path: this.paths.authorsId,
        method: "get",
        fn: this.getAuthor,
        validation: [
          param("id")
            .isEmpty()!
            .isInt({ min: 1 })
            .withMessage("Invalid or empty author id"),
        ],
      },
      {
        path: this.paths.authors,
        method: "post",
        fn: this.addAuthor,
        validation: [
          body("author.name")
            .isString()
            .notEmpty()
            .withMessage("Invalid or empty author name"),
          body("author.birth")
            .isDate(),
          body("author.death")
          .optional()
            .isDate(),
          body("bookIds")
            .optional()
            .custom((value) => {
              if (
                typeof value === "number" ||
                (Array.isArray(value) &&
                  value.every((item) => typeof item === "number"))
              ) {
                return true;
              }
              throw new Error("Invalid bookIds format");
            }),
        ],
      },
      {
        path: this.paths.delete,
        method: "delete",
        fn: this.deleteAuthor,
        validation: [
          param("id").isEmpty()!.isInt().withMessage("Invalid or empty author id"),
        ],
      },
      {
        path: this.paths.authorsId,
        method: "put",
        fn: this.updateAuthor,
        validation: [
          body("author.id")
            .isInt()
            .notEmpty()
            .withMessage("Invalid or empty author id"),
          body("author.name")
            .isString()
            .notEmpty()
            .withMessage("Invalid or empty author name"),
          body("bookIds")
            .optional()
            .custom((value) => {
              if (
                typeof value === "number" ||
                (Array.isArray(value) &&
                  value.every((item) => typeof item === "number"))
              ) {
                return true;
              }
              throw new Error("Invalid bookIds format");
            }),
        ],
      },
    ]);
  }

  public addAuthor = async (
    req: Request<
      {},
      {},
      {
        author: Omit<Author, "id">,
        bookIds?: number | number[];
      }
    >,
    res: Response
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const author = req.body.author;
      const bookIds = req.body.bookIds;
      const result = await this.authorService.createAuthor(
        author,
        bookIds
      );
      if (result && result.success) {
        res.send(result.message);
      }
    } catch (e) {
      this.throwServerError(res, e as Error);
    }
  };

  public updateAuthor = async (
    req: Request<{}, {}, { author: Author; bookIds?: number | number[] }>,
    res: Response
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const bookIds = req.body.bookIds;
      const author = req.body.author;
      const result = await this.authorService.editAuthor(author, bookIds);
      if (result && result.success) {
        res.send(result.message);
      }
    } catch (e) {
      this.throwServerError(res, e as Error);
    }
  };

  public deleteAuthor = async (
    req: Request<{id: string}, {}, { }>,
    res: Response
  ) => {
    try {
        
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const id = req.params.id;
      const result = await this.authorService.removeAuthor(parseInt(id));
      if (result && result.success) {
        res.send(result.message);
      }
    } catch (e) {
      this.throwServerError(res, e as Error);
    }
  };

  public getAuthors = async (
    req: Request<{}, { page: number; perPage: number }, {}>,
    res: Response
  ) => {
    try {

      const errors = validationResult(param);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const page = Number(req.query.page);
      const perPage = Number(req.query.perPage);
      const authors = await this.authorService.getAuthors(
        page,
        perPage
      );
      res.status(200).send(authors);
    } catch (e) {
      this.throwServerError(res, e as Error);
    }
  };

  public getAuthor = async (
    req: Request<{ id: string }, {}, {}>,
    res: Response
  ) => {
    try {
      const errors = validationResult(param);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const id = req.params.id;
      const author = await this.authorService.getAuthor(parseInt(id));
      if (!author) {
        res.status(400).send(`author with id ${id} does not exist`);
      }
      res.status(200).send(author);
    } catch (e) {
      this.throwServerError(res, e as Error);
    }
  };
}
