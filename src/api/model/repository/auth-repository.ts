import { User } from "@prisma/client";
import { BaseRepository } from "./base-repository";


export class AuthRepository extends BaseRepository<User> {

  public async findOne(email: string) {
    return this.executeAndDisconnect(async () => {
      const user = await this.dbService.getClient().user.findFirst({
        where: {
            email: email,
        },
      });
      return user;
    });
  }


}
