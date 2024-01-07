declare namespace Express {
    interface Request {
      jwtPayload?: JwtPayload;
    }
  }