import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FilterIcon } from "lucide-react";
import { useState } from "react";

export const FilterPrice = () => {
  const [priceRange, setPriceRange] = useState<{
    min: number | undefined;
    max: number | undefined;
  }>({ min: undefined, max: undefined });
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" role="combobox">
          <FilterIcon className="h-4 w-4 mr-2" />
          Price Range
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Min Price</Label>
            <Input
              type="number"
              placeholder="Min price"
              value={priceRange.min ?? ""}
              onChange={(e) =>
                setPriceRange((prev) => ({
                  ...prev,
                  min: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Max Price</Label>
            <Input
              type="number"
              placeholder="Max price"
              value={priceRange.max ?? ""}
              onChange={(e) =>
                setPriceRange((prev) => ({
                  ...prev,
                  max: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
          </div>
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setPriceRange({ min: undefined, max: undefined });
              }}
            >
              Reset
            </Button>
            <Button onClick={() => {}}>Apply</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
