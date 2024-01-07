import { AuthRepository } from "../repository/auth-repository";
import { User } from "@prisma/client";
import bcrypt from "bcrypt";

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  public async verifyCredentials(
    email: string,
    password: string
  ): Promise<User | null> {
    const user = await this.authRepository.findOne(email);

    if (!user) {
      return null;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }
    return user;
  }
}
