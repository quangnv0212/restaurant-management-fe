"use client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GuestLoginBody,
  GuestLoginBodyType,
} from "@/schemaValidations/guest.schema";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TablesDialog } from "@/app/[locale]/manage/orders/tables-dialog";
import { GetListGuestsResType } from "@/schemaValidations/account.schema";
import { Switch } from "@/components/ui/switch";
import GuestsDialog from "@/app/[locale]/manage/orders/guests-dialog";
import { CreateOrdersBodyType } from "@/schemaValidations/order.schema";
import Quantity from "@/app/[locale]/guest/menu/quantity";
import Image from "next/image";
import { cn, formatCurrency, handleErrorApi } from "@/lib/utils";
import { DishStatus } from "@/constants/type";
import { useDishListQuery } from "@/queries/useDish";
import { useCreateOrderMutation } from "@/queries/useOrder";
import { useCreateGuestMutation } from "@/queries/useAccount";
import { toast } from "@/components/ui/use-toast";
import DOMPurify from "dompurify";

export default function AddOrder() {
  const [open, setOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<
    GetListGuestsResType["data"][0] | null
  >(null);
  const [isNewGuest, setIsNewGuest] = useState(true);
  const [orders, setOrders] = useState<CreateOrdersBodyType["orders"]>([]);
  const { data } = useDishListQuery({
    status: DishStatus.Available,
    page: 1,
    limit: 10000,
  });

  const dishes = useMemo(() => data?.payload.data.items ?? [], [data]);

  const totalPrice = useMemo(() => {
    return dishes.reduce((result, dish) => {
      const order = orders.find((order) => order.dishId === dish.id);
      if (!order) return result;
      return result + order.quantity * dish.price;
    }, 0);
  }, [dishes, orders]);
  const createOrderMutation = useCreateOrderMutation();
  const createGuestMutation = useCreateGuestMutation();

  const form = useForm<GuestLoginBodyType>({
    resolver: zodResolver(GuestLoginBody),
    defaultValues: {
      name: "",
      tableNumber: 0,
    },
  });
  const name = form.watch("name");
  const tableNumber = form.watch("tableNumber");

  const handleQuantityChange = (dishId: number, quantity: number) => {
    setOrders((prevOrders) => {
      if (quantity === 0) {
        return prevOrders.filter((order) => order.dishId !== dishId);
      }
      const index = prevOrders.findIndex((order) => order.dishId === dishId);
      if (index === -1) {
        return [...prevOrders, { dishId, quantity }];
      }
      const newOrders = [...prevOrders];
      newOrders[index] = { ...newOrders[index], quantity };
      return newOrders;
    });
  };

  const handleOrder = async () => {
    try {
      let guestId = selectedGuest?.id;
      if (isNewGuest) {
        const guestRes = await createGuestMutation.mutateAsync({
          name,
          tableNumber,
        });
        guestId = guestRes.payload.data.id;
      }
      if (!guestId) {
        toast({
          description: "Please select a guest",
        });
        return;
      }
      await createOrderMutation.mutateAsync({
        guestId,
        orders,
      });
      reset();
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError,
      });
    }
  };

  const reset = () => {
    form.reset();
    setSelectedGuest(null);
    setIsNewGuest(true);
    setOrders([]);
    setOpen(false);
  };

  return (
    <Dialog
      onOpenChange={(value) => {
        if (!value) {
          reset();
        }
        setOpen(value);
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button size="lg" className="h-10 gap-1 uppercase font-semibold">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Create order
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-screen overflow-auto">
        <DialogHeader>
          <DialogTitle>Create order</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 items-center justify-items-start gap-4">
          <Label htmlFor="isNewGuest">New guest</Label>
          <div className="col-span-3 flex items-center">
            <Switch
              id="isNewGuest"
              checked={isNewGuest}
              onCheckedChange={setIsNewGuest}
            />
          </div>
        </div>
        {isNewGuest && (
          <Form {...form}>
            <form
              noValidate
              className="grid auto-rows-max items-start gap-4 md:gap-8"
              id="add-employee-form"
            >
              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="name">Guest name</Label>
                        <div className="col-span-3 w-full space-y-2">
                          <Input id="name" className="w-full" {...field} />
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tableNumber"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="tableNumber">Choose table</Label>
                        <div className="col-span-3 w-full space-y-2">
                          <div className="flex items-center gap-4">
                            <div>{field.value}</div>
                            <TablesDialog
                              onChoose={(table) => {
                                field.onChange(table.number);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        )}
        {!isNewGuest && (
          <GuestsDialog
            onChoose={(guest) => {
              setSelectedGuest(guest);
            }}
          />
        )}
        {!isNewGuest && selectedGuest && (
          <div className="grid grid-cols-4 items-center justify-items-start gap-4">
            <Label htmlFor="selectedGuest">Selected guest</Label>
            <div className="col-span-3 w-full gap-4 flex items-center">
              <div>
                {selectedGuest.name} (#{selectedGuest.id})
              </div>
              <div>Table: {selectedGuest.tableNumber}</div>
            </div>
          </div>
        )}
        {dishes
          .filter((dish) => dish.status !== DishStatus.Hidden)
          .map((dish) => (
            <div
              key={dish.id}
              className={cn("flex gap-4", {
                "pointer-events-none": dish.status === DishStatus.Unavailable,
              })}
            >
              <div className="flex-shrink-0 relative">
                {dish.status === DishStatus.Unavailable && (
                  <span className="absolute inset-0 flex items-center justify-center text-sm">
                    Out of stock
                  </span>
                )}
                <Image
                  src={dish.image}
                  alt={dish.name}
                  height={100}
                  width={100}
                  quality={100}
                  className="object-cover w-[80px] h-[80px] rounded-md"
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm">{dish.name}</h3>
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(dish.description),
                  }}
                  className="whitespace-pre-line"
                />
                <p className="text-xs font-semibold">
                  {formatCurrency(dish.price)}
                </p>
              </div>
              <div className="flex-shrink-0 ml-auto flex justify-center items-center">
                <Quantity
                  onChange={(value) => handleQuantityChange(dish.id, value)}
                  value={
                    orders.find((order) => order.dishId === dish.id)
                      ?.quantity ?? 0
                  }
                />
              </div>
            </div>
          ))}
        <DialogFooter>
          <Button
            className="w-full justify-between"
            onClick={handleOrder}
            disabled={orders.length === 0}
          >
            <span>Create order · {orders.length} dishes</span>
            <span>{formatCurrency(totalPrice)}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
