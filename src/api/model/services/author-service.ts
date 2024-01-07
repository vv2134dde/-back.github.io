import { Author } from "@prisma/client";
import { AuthorsRepository } from "../repository/author-repository";

export class AuthorService {
  private authorsRepository: AuthorsRepository;

  constructor() {
    this.authorsRepository = new AuthorsRepository();
  }

  public async createAuthor(
    author: Omit<Author, "id">,
    bookIds?: number | number[]
  ) {
    const newAuthor = await this.authorsRepository.create(author, bookIds);
    if (newAuthor) {
      return {
        success: true,
        message: `Author ${newAuthor.id} successfully created`,
      };
    }
  }

  public async editAuthor(author: Author, bookIds?: number | number[]) {
    const updateResult = await this.authorsRepository.update(author, bookIds);

    if (updateResult) {
      return {
        success: true,
        message: `author ${updateResult.id} successfully updated`,
      };
    }
  }

  public async removeAuthor(id: number | number[]) {
    const deleteResult = await this.authorsRepository.delete(id);
    if (deleteResult) {
      return {
        success: true,
        message: `Author(s) ${deleteResult
          .map((cat) => cat.name)
          .join(", ")} successfully removed`,
      };
    }
  }

  public async getAuthor(id: number) {
    return this.authorsRepository.findOne(id);
  }

  public async getAuthors(page: number, perPage: number) {
    return this.authorsRepository.findAll(page, perPage);
  }
}
