import { DishStatusValues } from "@/constants/type";
import z from "zod";

export const CreateDishBody = z.object({
  name: z.string().min(1).max(256),
  price: z.coerce.number().positive(),
  description: z.string().max(10000),
  image: z.string().url(),
  status: z.enum(DishStatusValues).optional(),
  sizes: z.array(z.number()).optional(),
});

export type CreateDishBodyType = z.TypeOf<typeof CreateDishBody>;

export const DishListParams = z.object({
  page: z.coerce.number().positive().lte(10000).default(1),
  limit: z.coerce.number().positive().lte(10000).default(5),
  sortBy: z.enum(["name"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().optional(),
  status: z.enum(DishStatusValues).optional(),
  fromPrice: z.coerce.number().optional(),
  toPrice: z.coerce.number().optional(),
});

export const FilterPrice = z
  .object({
    fromPrice: z.coerce.number().optional(),
    toPrice: z.coerce.number().optional(),
  })
  .refine(
    (data) => {
      if (data.fromPrice === 0) return true;
      return data.fromPrice && data.toPrice && data.fromPrice <= data.toPrice;
    },
    {
      message: "From price must be less than to price",
      path: ["toPrice"],
    }
  );

export type FilterPriceType = z.TypeOf<typeof FilterPrice>;

export type DishListParamsType = z.TypeOf<typeof DishListParams>;

export const DishSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.coerce.number(),
  description: z.string(),
  image: z.string(),
  status: z.any(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const DishRes = z.object({
  data: DishSchema,
  message: z.string(),
});

export type DishResType = z.TypeOf<typeof DishRes>;

export const DishListRes = z.object({
  data: z.object({
    items: z.array(DishSchema),
    total: z.number(),
    limit: z.number(),
    page: z.number(),
    totalItem: z.number(),
    totalPage: z.number(),
  }),
  message: z.string(),
});

export type DishListResType = z.TypeOf<typeof DishListRes>;

export const UpdateDishBody = CreateDishBody;
export type UpdateDishBodyType = CreateDishBodyType;
export const DishParams = z.object({
  id: z.coerce.number(),
});
export type DishParamsType = z.TypeOf<typeof DishParams>;
