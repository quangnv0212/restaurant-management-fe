import {
  OrderObjectByGuestID,
  ServingGuestByTableNumber,
  Statics,
} from "@/app/[locale]/manage/orders/order-table";
import { OrderStatus } from "@/constants/type";
import { GetOrdersResType } from "@/schemaValidations/order.schema";
import { useMemo } from "react";

export const useOrderService = (orderList: GetOrdersResType["data"]) => {
  const result = useMemo(() => {
    const statics: Statics = {
      status: {
        Pending: 0,
        Processing: 0,
        Delivered: 0,
        Paid: 0,
        Rejected: 0,
      },
      table: {},
    };
    const orderObjectByGuestId: OrderObjectByGuestID = {};
    const guestByTableNumber: ServingGuestByTableNumber = {};
    orderList.forEach((order) => {
      statics.status[order.status] = statics.status[order.status] + 1;
      // If table and guest is not deleted
      if (order.tableNumber !== null && order.guestId !== null) {
        if (!statics.table[order.tableNumber]) {
          statics.table[order.tableNumber] = {};
        }
        statics.table[order.tableNumber][order.guestId] = {
          ...statics.table[order.tableNumber]?.[order.guestId],
          [order.status]:
            (statics.table[order.tableNumber]?.[order.guestId]?.[
              order.status
            ] ?? 0) + 1,
        };
      }

      // Calculate for orderObjectByGuestId
      if (order.guestId) {
        if (!orderObjectByGuestId[order.guestId]) {
          orderObjectByGuestId[order.guestId] = [];
        }
        orderObjectByGuestId[order.guestId].push(order);
      }

      // Calculate for guestByTableNumber
      if (order.tableNumber && order.guestId) {
        if (!guestByTableNumber[order.tableNumber]) {
          guestByTableNumber[order.tableNumber] = {};
        }
        guestByTableNumber[order.tableNumber][order.guestId] =
          orderObjectByGuestId[order.guestId];
      }
    });

    // Need to filter again to be standard
    // Guests who are no longer served will be removed
    const servingGuestByTableNumber: ServingGuestByTableNumber = {};
    for (const tableNumber in guestByTableNumber) {
      const guestObject = guestByTableNumber[tableNumber];
      const servingGuestObject: OrderObjectByGuestID = {};
      for (const guestId in guestObject) {
        const guestOrders = guestObject[guestId];
        const isServingGuest = guestOrders.some((order) =>
          [
            OrderStatus.Pending,
            OrderStatus.Processing,
            OrderStatus.Delivered,
          ].includes(order.status as any)
        );
        if (isServingGuest) {
          servingGuestObject[Number(guestId)] = guestOrders;
        }
      }
      if (Object.keys(servingGuestObject).length) {
        servingGuestByTableNumber[Number(tableNumber)] = servingGuestObject;
      }
    }
    return {
      statics,
      orderObjectByGuestId,
      servingGuestByTableNumber,
    };
  }, [orderList]);
  return result;
};
