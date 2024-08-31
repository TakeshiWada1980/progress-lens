import { Prisma as P } from "@prisma/client";

export type UserQueryOptions<
  T extends P.UserInclude,
  U extends P.UserSelect
> = {
  include?: T;
  select?: U;
};
