import { Category } from "@prisma/client";
import { CategoryService } from "../model/services/category-service";
import { Controller } from "./base-controller";
import { Request, Response } from "express";
import { param, validationResult, body, query } from "express-validator";

export class CategoryController extends Controller {
  private categoryService: CategoryService;
  private paths = {
    categories: "/categories",
    categoriesId: "/categories/:id",
    delete: "/categories/delete",
  } as const;

  constructor() {
    super();
    this.categoryService = new CategoryService();

    this.bindRoutes([
      {
        path: this.paths.categories,
        method: "get",
        fn: this.getCategories,
        validation: [
          query("page").isInt({ min: 1 }).withMessage("Invalid page number"),
          query("perPage")
            .isInt({ min: 1 })
            .withMessage("Invalid perPage value"),
        ],
      },
      {
        path: this.paths.categoriesId,
        method: "get",
        fn: this.getCategory,
        validation: [
          param("id")
            .isEmpty()!
            .isInt({ min: 1 })
            .withMessage("Invalid or empty category id"),
        ],
      },
      {
        path: this.paths.categories,
        method: "post",
        fn: this.addCategory,
        validation: [
          body("categoryName")
            .isString()
            .notEmpty()
            .withMessage("Invalid or empty category id"),
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
        method: "put",
        fn: this.deleteCategory,
        validation: [
          body("ids").custom((value) => {
            if (
              typeof value === "number" ||
              (Array.isArray(value) &&
                value.every((item) => typeof item === "number"))
            ) {
              return true;
            }
            throw new Error("Invalid ids format");
          }),
        ],
      },
      {
        path: this.paths.categoriesId,
        method: "put",
        fn: this.updateCategory,
        validation: [
          body("category.id")
            .isInt()
            .notEmpty()
            .withMessage("Invalid or empty category id"),
          body("category.name")
            .isString()
            .notEmpty()
            .withMessage("Invalid or empty category name"),
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

  public addCategory = async (
    req: Request<
      {},
      {},
      {
        categoryName: string;
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

      const categoryName = req.body.categoryName;
      const bookIds = req.body.bookIds;
      const result = await this.categoryService.createCategory(
        categoryName,
        bookIds
      );
      if (result && result.success) {
        res.send(result.message);
      }
    } catch (e) {
      this.throwServerError(res, e as Error);
    }
  };

  public updateCategory = async (
    req: Request<{}, {}, { category: Category; bookIds?: number | number[] }>,
    res: Response
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const bookIds = req.body.bookIds;
      const category = req.body.category;
      const result = await this.categoryService.editCategory(category, bookIds);
      if (result && result.success) {
        res.send(result.message);
      }
    } catch (e) {
      this.throwServerError(res, e as Error);
    }
  };

  public deleteCategory = async (
    req: Request<{}, {}, { ids: number | number[] }>,
    res: Response
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const ids = req.body.ids;
      console.log(ids);
      const result = await this.categoryService.removeCategory(ids);
      if (result && result.success) {
        res.send(result.message);
      }
    } catch (e) {
      this.throwServerError(res, e as Error);
    }
  };

  public getCategories = async (
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
      const categories = await this.categoryService.getCategories(
        page,
        perPage
      );
      res.status(200).send(categories);
    } catch (e) {
      this.throwServerError(res, e as Error);
    }
  };

  public getCategory = async (
    req: Request<{ id: string }, {}, {}>,
    res: Response
  ) => {
    try {
      const errors = validationResult(param);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const id = req.params.id;
      const category = await this.categoryService.getCategory(parseInt(id));
      if (!category) {
        res.status(400).send(`Category with id ${id} does not exist`);
      }
      res.status(200).send(category);
    } catch (e) {
      this.throwServerError(res, e as Error);
    }
  };
}
