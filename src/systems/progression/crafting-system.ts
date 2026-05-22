import type { InventoryLoadout, QuickUseItem } from "../inventory/loadout-data";

export interface RecipeMaterial {
  itemId: string;
  quantity: number;
}

export interface CraftingRecipe {
  id: string;
  result: QuickUseItem;
  materials: RecipeMaterial[];
  craftTimeSeconds: number;
}

export const CRAFTING_RECIPES: CraftingRecipe[] = [
  {
    id: "recipe-rip-9x19-lv2",
    result: { id: "smg-rip-9x19-lv2", label: "9x19 RIP Lv.2", kind: "ammo", quantity: 30 },
    materials: [
      { itemId: "mat-casing", quantity: 10 },
      { itemId: "mat-soft-core", quantity: 6 },
    ],
    craftTimeSeconds: 3,
  },
  {
    id: "recipe-bandage",
    result: { id: "med-bandage", label: "Bandage", kind: "med", quantity: 1 },
    materials: [
      { itemId: "mat-cloth", quantity: 4 },
      { itemId: "mat-antiseptic", quantity: 1 },
    ],
    craftTimeSeconds: 2,
  },
];

export class CraftingSystem {
  canCraft(recipe: CraftingRecipe, inventory: InventoryLoadout): boolean {
    return recipe.materials.every((mat) => inventory.getMaterialQuantity(mat.itemId) >= mat.quantity);
  }

  craft(recipeId: string, inventory: InventoryLoadout): { success: boolean; message: string } {
    const recipe = CRAFTING_RECIPES.find((entry) => entry.id === recipeId);
    if (!recipe) {
      return { success: false, message: "Recipe not found." };
    }

    if (!this.canCraft(recipe, inventory)) {
      return { success: false, message: "Missing crafting materials." };
    }

    const consumed = inventory.consumeMaterials(recipe.materials);
    if (!consumed) {
      return { success: false, message: "Failed to consume materials." };
    }

    const added = inventory.addToBackpack(recipe.result);
    if (!added) {
      return { success: false, message: "Crafted item ready, but backpack has no free slot." };
    }

    return { success: true, message: `Crafted ${recipe.result.label}.` };
  }
}
