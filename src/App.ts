import express, { Express } from "express";
import { json } from "body-parser";
import { injectable } from "inversify";
import { BooksController } from "./api/controllers/books-controller";
import bodyParser from "body-parser";
import { CategoryController } from "./api/controllers/category-controller";

@injectable()
export class App {
  private app: Express;
  private booksController: BooksController;
  private categoriesController: CategoryController;

  private readonly port: number;

  constructor() {
    this.app = express();
    this.port = Number(process.env.APP_PORT) || 3000;
    this.booksController = new BooksController();
    this.categoriesController = new CategoryController();
  }

  private configureRoutes() {
    this.app.use("/api/v1", this.booksController.getRouter());
    this.app.use("/api/v1", this.categoriesController.getRouter());
  }

  public async run() {
    this.app.use(json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.listen(this.port, () => {
      console.log("Приложение запущено!");
    });
    this.configureRoutes();
  }
}
