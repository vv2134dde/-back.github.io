import { NextFunction, Request, Response } from "express";
import { Controller } from "./base-controller";
import { AuthMiddleware, ValidateMiddleware } from "./middleware/Middleware";

export class AuthController extends Controller {

    private paths = {
        login: "/user/login",
        register: "/user/register",
      } as const;

    constructor() {
        super();

        this.bindRoutes([
            {
                path: this.paths.register,
                method: 'post',
                fn: this.register,
                middleware: [new ValidateMiddleware()],
            },
            {
                path: this.paths.login,
                method: 'post',
                fn: this.login,
                middleware: [new ValidateMiddleware()],
            }
        ])
    }

    private register = async (req: Request, res: Response) => {
        // this.authService.registerUser(req.body);
    }

    private login = async() => {
        
    }
}  