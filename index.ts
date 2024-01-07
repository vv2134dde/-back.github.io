import * as dotenv from "dotenv";
import "reflect-metadata";
import { Container } from "inversify";
import { DBService } from "./src/api/db-service";
import { BooksRepository } from "./src/api/model/repository/book-repository";
import { BooksService } from "./src/api/model/services/books-service";
import { BooksController } from "./src/api/controllers/books-controller";


import { App } from "./src/App";
export const TYPES = {
  DBService: Symbol.for("DBService"),
  BooksController: Symbol.for("BooksController"),
  BooksService: Symbol.for("BooksService"),
  BooksRepository: Symbol.for("BooksRepository"),
  App: Symbol.for("App"),
};

dotenv.config();

async function bootstrap() {
  try {
    const container = new Container();
    container
      .bind(TYPES.DBService)
      .to(DBService)
      .inSingletonScope();

    container.bind(TYPES.BooksRepository).to(BooksRepository);
    container.bind(TYPES.BooksService).to(BooksService);
    container.bind(TYPES.BooksController).to(BooksController);
    container.bind(TYPES.App).to(App);

    const app = container.get<App>(TYPES.App);
    await app.run();

    console.log("Execution completed successfully.");
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

bootstrap();

