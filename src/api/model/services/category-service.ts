import { Category } from "@prisma/client";
import { CategoriesRepository } from "../repository/category-repository";

export class CategoryService {
  private categoriesRepository: CategoriesRepository;

  constructor() {
    this.categoriesRepository = new CategoriesRepository();
  }

  public async createCategory(
    categoryName: string,
    bookIds?: number | number[]
  ) {
    const newCategory = await this.categoriesRepository.create(
      categoryName,
      bookIds
    );
    if (newCategory) {
      return {
        success: true,
        message: `Category ${newCategory.id} successfully created`,
      };
    }
  }

  public async editCategory(category: Category, bookIds?: number | number[]) {
    const updateResult = await this.categoriesRepository.update(
      category,
      bookIds
    );

    if (updateResult) {
      return {
        success: true,
        message: `Category ${updateResult.id} successfully updated`,
      };
    }
  }

  public async removeCategory(id: number | number[]) {
    const deleteResult = await this.categoriesRepository.delete(id);
    if (deleteResult) {
        return {
          success: true,
          message: `Category ${deleteResult.map((cat) => cat.name).join(", ")} successfully removed`,
        };
      }
  }

  public async getCategory(id: number) {
    return this.categoriesRepository.findOne(id)
  }
  public async getCategories(page: number, perPage: number) {
    return this.categoriesRepository.findAll(page, perPage);
  }
}
