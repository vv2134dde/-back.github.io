// export interface IBook {
//     id: string;
//     title: string;
//     authors: string | string[];
//     language: string;
//     categories: string[];
//     amount: number;
//     currencyCode: ICurrency;
//     year: string; 
//     averageRating?: number;
//     ratingsCount?: number;
//     description?: string;
//     thumbnail?: string;
//   }

//   export interface IUser {
//     id: string,
//     name: string,
//     signUpDate: string,
//     email: string,
//     bio: string,
//     password: string,
//     image?: string,
//   }

//   export interface ICategory {
//     books: Pick<IBook, "title">[];
//     name: string;
//   }

//   export enum CurrencyFullName {
//     USD = "United States Dollar",
//     EUR = "Euro",
//     GBP = "British Pound Sterling",
//     JPY = "Japanese Yen",
//     AUD = "Australian Dollar",
//   }
  
//   export enum CurrencyShortName {
//     USD = "USD",
//     EUR = "EUR",
//     GBP = "GBP",
//     JPY = "JPY",
//     AUD = "AUD",
//   }

//   export interface ICurrency {
//     name: CurrencyFullName;
//     shortName: CurrencyShortName;
//   }

//   export interface IAuthor {
//     name: string,
//     birth: number,
//     death: number | null,
//     books: IBook[],
//   }

//   export interface IRating {
//     userId: string,
//     ratingValue: number,
//   }

import { Author, Book, Category, Currency } from "@prisma/client";

export interface ICreateBookPayload {
    book: Omit<Book, "id">,
    authorsIds: number[],
    categoriesIds: number[],
    currency: Pick<Currency, "shortName">,
}

const method = {
    get: "get",
    post: "post",
    put: "put",
    delete: "delete",
    patch: "patch"
    } as const;

type ObjectValues<T> = T[keyof T]
export type MethodName = ObjectValues<typeof method>

export interface IJwtPayload {
    userId: number; 
    email: string;
    iat: number; 
  }