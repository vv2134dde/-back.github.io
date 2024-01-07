import { Router, Request, Response, NextFunction } from "express";
import { MethodName } from "../../interfaces/interfaces";

interface IMiddleware {
  handle: (req: Request, res: Response, next: NextFunction) => void;
}

interface ControllerRoute {
  method?: MethodName;
  path: string;
  fn: (req: Request<any, any, any>, res: Response, next?: NextFunction) => void;
  validation?: Array<any>;
  middleware?: IMiddleware[]
}

export class Controller {
  private _router: Router;

  constructor() {
    this._router = Router();
  }

  protected bindRoutes(routes: ControllerRoute[]) {
    routes.forEach((route) => {
      const ctxHandler = route.fn.bind(this);
      const validators = route.validation ?? [];
      const routeHandlers = route.middleware ? [...route.middleware.map((m) => m.handle), ctxHandler] : ctxHandler;
      this._router[route.method ?? "get"](route.path, validators, routeHandlers);
    });
  }

  protected throwServerError = (res: Response, e: Error) => {
    console.debug(e.message);
    res.status(500);
    res.send(e.message);
  };
  

  public getRouter() {
    return this._router;
  }
}
