import { DBService } from "../../db-service";

export abstract class BaseRepository<T> {
    protected dbService: DBService;
  
    constructor() {
      this.dbService = new DBService();
    }
  
    protected async executeAndDisconnect<T>(callback: () => Promise<T>): Promise<T> {
      try {
        const result = await callback();
        return result;
      } catch (error) {
        throw new Error(`Error: ${error}`);
      } finally {
        await this.dbService.getClient().$disconnect();
      }
    }

    protected convertToArray<T>(input: T | T[]): T[] {
      if (!Array.isArray(input)) {
        return [input];
      } else {
        return input;
      }
    }
  }
  