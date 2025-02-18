import http from "@/lib/http";
import {
  CreateDishBodyType,
  DishListResType,
  DishResType,
  DishListParamsType,
  UpdateDishBodyType,
} from "@/schemaValidations/dish.schema";
import queryString from "query-string";

const dishApiRequest = {
  list: (params: DishListParamsType) =>
    http.get<DishListResType>(`dishes?${queryString.stringify(params)}`, {
      next: { tags: ["dishes"] },
    }),
  add: (body: CreateDishBodyType) => http.post<DishResType>("dishes", body),
  getDish: (id: number) => http.get<DishResType>(`dishes/${id}`),
  updateDish: (id: number, body: UpdateDishBodyType) =>
    http.put<DishResType>(`dishes/${id}`, body),
  deleteDish: (id: number) => http.delete<DishResType>(`dishes/${id}`),
};

export default dishApiRequest;
