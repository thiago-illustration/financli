import prompts from "prompts";
import { cliui } from "@poppinss/cliui";

import {
  create_category,
  delete_categories,
  get_all_categories,
  get_category_by_id,
  get_expenses_count_from_category,
  update_category,
} from "../../lib/db";

const ui = cliui();

// ----------------------------------------------------------------------------
// Create Category Prompt

export async function create_category_prompt() {
  console.clear();

  try {
    const response = await prompts([
      {
        type: "text",
        name: "name",
        message: "What is the name of the category?",
      },
      {
        type: "number",
        name: "budget",
        message: "What is the budget of the category?",
      },
    ]);

    if (!response.name || !response.budget) {
      return;
    }

    await create_category(response.name, response.budget);

    console.log("");
    ui.logger.success("Category created successfully");
    console.log("");
    get_all_categories_prompt();
  } catch (error) {
    ui.logger.error("Error creating category");
    console.error(error);
  }
}

// ----------------------------------------------------------------------------
// Get All Categories Prompt

export async function get_all_categories_prompt() {
  console.clear();

  try {
    const categories = get_all_categories();

    if (categories.length === 0) {
      ui.logger.info("No categories found");
      return;
    }

    const table = ui.table();

    table.head(["ID", "Name", "Budget", "Expenses Count"]);
    categories.forEach((category) => {
      const expensesCount = get_expenses_count_from_category(category.id);

      table.row([
        category.id,
        category.name,
        category.budget.toString(),
        expensesCount.toString(),
      ]);
    });
    table.render();
  } catch (error) {
    ui.logger.error("Error getting all categories");
    console.error(error);
  }
}

// ----------------------------------------------------------------------------
// Get Category By Id Prompt

export async function get_category_prompt() {
  console.clear();

  const categories = get_all_categories();

  if (categories.length === 0) {
    ui.logger.info("No categories found");
    return;
  }

  const response = await prompts({
    type: "select",
    name: "id",
    message: "What is the id of the category?",
    choices: categories.map((category) => ({
      title: category.name,
      value: category.id,
    })),
  });

  const category = get_category_by_id(response.id);

  if (!category) {
    ui.logger.error("Category not found");
    return;
  }

  const expensesCount = get_expenses_count_from_category(category.id);

  ui.table()
    .head(["ID", "Name", "Budget", "Expenses Count"])
    .row([
      category.id,
      category.name,
      category.budget.toString(),
      expensesCount.toString(),
    ])
    .render();
}

// ----------------------------------------------------------------------------
// Update Category Prompt

export async function update_category_prompt() {
  console.clear();

  try {
    const categories = get_all_categories();

    if (categories.length === 0) {
      ui.logger.info("No categories found");
      return;
    }

    const { id } = await prompts([
      {
        type: "select",
        name: "id",
        message: "What is the id of the category?",
        choices: categories.map((category) => ({
          title: category.name,
          value: category.id,
        })),
      },
    ]);

    if (!id) return;

    const category = get_category_by_id(id);

    if (!category) {
      ui.logger.error("Category not found");
      return;
    }

    const response = await prompts([
      {
        type: "text",
        name: "name",
        message: "What is the name of the category?",
        initial: category.name,
      },
      {
        type: "number",
        name: "budget",
        message: "What is the budget of the category?",
        initial: category.budget,
      },
    ]);

    if (!response.name || !response.budget) return;

    await update_category({
      id: category.id,
      name: response.name,
      budget: response.budget,
    });

    console.log("");
    ui.logger.success("Category updated successfully");
    console.log("");
    get_all_categories_prompt();
  } catch (error) {
    ui.logger.error("Error updating category");
    console.error(error);
  }
}

// ----------------------------------------------------------------------------
// Delete Category Prompt

export async function delete_categories_prompt() {
  console.clear();

  try {
    const categories = get_all_categories();

    if (categories.length === 0) {
      ui.logger.info("No categories found");
      return;
    }

    const response = await prompts({
      type: "multiselect",
      name: "id",
      message: "Select the categories to delete",
      choices: categories.map((category) => ({
        title: category.name,
        value: category.id,
      })),
    });

    if (response.id?.length === 0) return;

    await delete_categories(response.id);

    console.log("");
    ui.logger.success("Categories deleted successfully");
    console.log("");
    get_all_categories_prompt();
  } catch (error) {
    ui.logger.error("Error deleting categories");
    console.error(error);
  }
}
