import { Controller } from "./base-controller";


export class UserController extends Controller {
    private paths = {
        cart: "/user/books",
        edit: "/user/:id",
        delete: "/categories/delete",
      } as const;

      constructor() {
        super();
        // this.userService = new UserService();
    
        // this.bindRoutes([
        //   {
        //     path: this.paths.login,
        //     method: "post",
        //     fn: this.logIn,
        //   },
        //   {
        //     path: this.paths.register,
        //     method: "post",
        //     fn: this.createUser,
        //   },
        //   {
        //     path: this.paths.cart,
        //     method: "get",
        //     fn: this.getCart,
        //   },
        //   {
        //     path: this.paths.edit,
        //     method: "put",
        //     fn: this.updateUser,
        //   },
        //   {
        //     path: this.paths.delete,
        //     method: "delete",
        //     fn: this.deleteUser,
        //   },
        // ]);
      }


      public getCart = async() => {

      }
      public updateUser = async() => {

      }
      public deleteUser = async() => {

      }
}