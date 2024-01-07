import { Author, Prisma } from "@prisma/client";
import { BaseRepository } from "./base-repository";

export class AuthorsRepository extends BaseRepository<Author> {
  
  public async create(author: Omit<Author, "id">, bookIds?: number | number[]) {
    return this.executeAndDisconnect(async () => {
      if (!author || !author.name || !author.birth) {
        throw new Error("Author information is required");
      }

      const existingAuthor = await this.dbService.getClient().author.findFirst({
        where: {
          name: author.name,
        },
      });

      if (existingAuthor) {
        throw new Error(
          `Author with name ${author.name} already exists in the database`
        );
      }

      const createData: Prisma.AuthorCreateInput = {
        name: author.name,
        birth: new Date(author.birth).toISOString(),
        death: author.death ? new Date(author.death).toISOString() : null,
      };

      if (bookIds) {
        const bookIdArray = this.convertToArray(bookIds);
        createData.books = {
          connect: bookIdArray.map((id) => ({ id: id })),
        };
      }

      const newAuthor = await this.dbService.getClient().author.create({
        data: createData,
        include: {
          books: true,
        },
      });
      return newAuthor;
    });
  }


  public async update(author: Author, bookIds?: number | number[]) {
    return this.executeAndDisconnect(async () => {
      if (!author) {
        throw new Error("Please specify author to be updated");
      }
      const existingAuthor = await this.dbService
        .getClient()
        .author.findUnique({
          where: {
            id: author.id,
          },
        });
      if (!existingAuthor) {
        throw new Error(`Author with id ${author.id} not found`);
      }

      if (!author.name || author.name.trim().length === 0) {
        throw new Error("Invalid author name");
      }

      const updateData: Prisma.AuthorUpdateInput = {
        name: author.name || existingAuthor.name,
        birth: author.birth
          ? new Date(author.birth).toISOString()
          : existingAuthor.birth,
        death: author.death
          ? new Date(author.death).toISOString()
          : existingAuthor.death,
      };

      if (bookIds) {
        const bookIdArray = this.convertToArray(bookIds);
        updateData.books = {
          set: bookIdArray.map((id) => ({ id })),
        };
      }

      const updatedAuthor = await this.dbService.getClient().author.update({
        where: { id: author.id },
        data: updateData,
        include: {
          books: true,
        },
      });

      return updatedAuthor;
    });
  }

  public async delete(id: number[] | number) {
    return this.executeAndDisconnect(async () => {
      if (!id) {
        throw new Error("Please specify authors to be deleted");
      }
      const authorsArray = this.convertToArray(id);
      const bookDisconnectPromises = authorsArray.map(async (authorId) => {
        const booksToUpdate = await this.dbService.getClient().book.findMany({
          where: { category: { some: { id: authorId } } },
        });

        const disconnectPromises = booksToUpdate.map((book) =>
          this.dbService.getClient().book.update({
            where: { id: book.id },
            data: { category: { disconnect: { id: authorId } } },
          })
        );

        await Promise.all(disconnectPromises);
      });

      const authorPromises = authorsArray.map((item) => {
        return this.dbService.getClient().author.delete({
          where: {
            id: item,
          },
        });
      });
      const deletedAuthors = await Promise.all(authorPromises);
      await Promise.all(bookDisconnectPromises);
      return deletedAuthors;
    });
  }


  public async findOne(id: number) {
    return this.executeAndDisconnect(async () => {
      const author = await this.dbService.getClient().author.findUnique({
        where: {
          id: id,
        },
        include: {
          books: true,
        },
      });
      return author;
    });
  }
  
  public async findAll(page: number, perPage: number) {
    return this.executeAndDisconnect(async () => {
      const offset = (page - 1) * perPage;
      const authorList = await this.dbService.getClient().author.findMany({
        include: {
          books: true,
        },
        skip: offset,
        take: perPage,
      });
      return authorList;
    });
  }

}
