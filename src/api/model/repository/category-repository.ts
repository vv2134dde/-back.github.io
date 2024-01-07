import { BaseRepository } from "./base-repository";
import { Category, Prisma } from "@prisma/client";

export class CategoriesRepository extends BaseRepository<Category> {
  public async create(category: string, bookIds?: number | number[]) {
    return this.executeAndDisconnect(async () => {
      if (!category || category.trim().length === 0) {
        throw new Error("Category information is required");
      }

      const existingCat = await this.dbService.getClient().category.findFirst({
        where: {
          name: category,
        },
      });

      if (existingCat) {
        throw new Error(`Category ${category} already exists`);
      }

      const createData: Prisma.CategoryCreateInput = {
        name: category,
      };

      if (bookIds) {
        const bookIdArray = this.convertToArray(bookIds);
        createData.books = {
          connect: bookIdArray.map((id) => ({ id: id })),
        };
      }

      const newCategory = await this.dbService.getClient().category.create({
        data: createData,
        include: {
          books: true,
        },
      });

      return newCategory;
    });
  }

  public async update(category: Category, bookIds?: number | number[]) {
    return this.executeAndDisconnect(async () => {
      if (!category) {
        throw new Error("Please specify category to be updated");
      }
      const existingCategory = await this.dbService
        .getClient()
        .category.findUnique({
          where: {
            id: category.id,
          },
        });
      if (!existingCategory) {
        throw new Error(`Category with id ${category.id} not found`);
      }
      if (!category.name || category.name.trim().length === 0) {
        throw new Error("Invalid category name");
      }

      const updateData: Prisma.CategoryUpdateInput = {
        name: category.name,
      };

      if (bookIds) {
        const bookIdArray = this.convertToArray(bookIds);
        updateData.books = {
          set: bookIdArray.map((id) => ({ id })),
        };
      }

      const updatedCategory = await this.dbService.getClient().category.update({
        where: { id: category.id },
        data: updateData,
        include: {
          books: true,
        },
      });

      return updatedCategory;
    });
  }

  public async delete(id: number[] | number) {
    return this.executeAndDisconnect(async () => {
      if (!id) {
        throw new Error("Please specify categories to be deleted");
      }

      const categoriesArray = this.convertToArray(id);
      const bookDisconnectPromises = categoriesArray.map(async (categoryId) => {
        const booksToUpdate = await this.dbService.getClient().book.findMany({
          where: { category: { some: { id: categoryId } } },
        });

        const disconnectPromises = booksToUpdate.map((book) =>
          this.dbService.getClient().book.update({
            where: { id: book.id },
            data: { category: { disconnect: { id: categoryId } } },
          })
        );

        await Promise.all(disconnectPromises);
      });

      const categoriesPromises = categoriesArray.map((categoryId) =>
        this.dbService.getClient().category.delete({
          where: {
            id: categoryId,
          },
        })
      );

      const deletedCategories = await Promise.all(categoriesPromises);
      await Promise.all(bookDisconnectPromises);
      return deletedCategories
    });
  }

  public async findOne(id: number) {
    return this.executeAndDisconnect(async () => {
      const category = await this.dbService.getClient().category.findUnique({
        where: { id },
        include: {
          books: true,
        },
      });
      return category;
    });
  }

  public async findAll(page: number, perPage: number) {
    return this.executeAndDisconnect(async () => {
      const offset = (page - 1) * perPage;
      const categoryList = await this.dbService.getClient().category.findMany({
        include: {
          books: true,
        },
        skip: offset,
        take: perPage,
      });
      return categoryList;
    });
  }
}
