import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { IJwtPayload } from "../../../interfaces/interfaces";

export abstract class Middleware implements Middleware {
  public handle(req: Request, res: Response, next: NextFunction) {}
}

export class LoggerMiddleware extends Middleware {
  constructor() {
    super();
  }

  public handle(req: Request, res: Response, next: NextFunction) {
    console.log(req.method, req.path);

    next();
  }
}

export class ValidateMiddleware extends Middleware {
  public handle(req: Request, res: Response, next: NextFunction) {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(422).send({ error: "No username or password" });
    }
  }
}

export class AuthMiddleware extends Middleware {
  public handle(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).send({ error: true });
    }

    const token: string | null = Array.isArray(authHeader)
      ? authHeader[0].split(" ")[1]
      : typeof authHeader === "string"
      ? authHeader.split(" ")[1]
      : null;

      if (!token) {
        return res.status(401).send({ error: true });
      }

    jwt.verify(token, process.env.JWTSECRET as jwt.Secret, (err: jwt.VerifyErrors | null, payload: string | jwt.JwtPayload | undefined) => {
      if (err) {
        res.status(401).send({ error: true });
      } else {
        req.jwtPayload = payload as IJwtPayload;
        next();
      }
    });
  }
}
