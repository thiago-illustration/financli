import prompts, { type PromptObject } from "prompts";
import { cliui } from "@poppinss/cliui";

import type { Expense } from "../../domain";

import {
  create_expense,
  delete_expenses,
  get_all_expenses,
  get_expense_by_id,
  get_all_categories,
  update_expense,
  get_expense_category,
  sum_all_expenses_by_category,
  sum_all_expenses,
  create_category,
} from "../../lib/db";

const ui = cliui();

function get_expense_response(initial?: Expense) {
  const categories = get_all_categories();

  const questions: PromptObject[] = [
    {
      type: "text",
      name: "name",
      message: "What is the name of the expense?",
      initial: initial?.name,
    },
    {
      type: "number",
      name: "amount",
      message: "What is the amount of the expense?",
      initial: initial?.amount,
    },
    {
      type: "select",
      name: "category_id",
      message: "What is the category of the expense?",
      choices: [
        ...categories.map((category) => ({
          title: category.name,
          value: category.id,
        })),
        {
          title: "New",
          value: "new",
        },
      ],
    },
    {
      type: (prev) => (prev === "new" ? "text" : undefined),
      name: "new_category_name",
      message: "What is the name of the new category?",
    },
    {
      type: (prev) =>
        !categories.some((c) => c.id === prev) ? "number" : undefined,
      name: "new_category_budget",
      message: "What is the budget of the new category?",
    },
  ];

  return prompts(questions);
}

// ----------------------------------------------------------------------------
// Create Expense Prompt

export async function create_expense_prompt() {
  console.clear();

  try {
    const response = await get_expense_response();

    if (!response.name || !response.amount || !response.category_id) {
      return;
    }

    let category_id = response.category_id;

    if (response.category_id === "new") {
      const category = await create_category(
        response.new_category_name,
        response.new_category_budget
      );
      category_id = category?.id || response.category_id;
    }

    await create_expense({
      name: response.name,
      amount: response.amount,
      category_id: category_id,
    });

    console.log("");
    ui.logger.success("Expense created successfully");
    console.log("");
    get_all_expenses_prompt();
  } catch (error) {
    ui.logger.error("Error creating expense");
    console.error(error);
  }
}

// ----------------------------------------------------------------------------
// Get All Expenses Prompt

export async function get_all_expenses_prompt() {
  console.clear();

  try {
    const expenses = get_all_expenses();

    if (expenses.length === 0) {
      ui.logger.info("No expenses found");
      return;
    }

    const table = ui.table();

    expenses.forEach((expense) => {
      const category = get_expense_category(expense.category_id);

      table.row([
        expense.name,
        category?.name || "No category",
        expense.amount.toString(),
      ]);
    });

    table.row(["", "Total", sum_all_expenses().toString()]);
    table.head(["Name", "Category", "Amount"]);
    table.render();
  } catch (error) {
    ui.logger.error("Error getting all expenses");
    console.error(error);
  }
}

// ----------------------------------------------------------------------------
// Get Expense By Id Prompt

export async function get_expense_prompt() {
  console.clear();

  const expenses = get_all_expenses();

  if (expenses.length === 0) {
    ui.logger.info("No expenses found");
    return;
  }

  const response = await prompts({
    type: "select",
    name: "id",
    message: "What is the id of the expense?",
    choices: expenses.map((expense) => ({
      title: expense.name,
      value: expense.id,
    })),
  });

  const expense = get_expense_by_id(response.id);

  if (!expense) {
    ui.logger.error("Expense not found");
    return;
  }

  const category = get_expense_category(expense.category_id);

  ui.table()
    .head(["ID", "Name", "Amount", "Category"])
    .row([
      expense.id,
      expense.name,
      expense.amount.toString(),
      category?.name || "No category",
    ])
    .render();
}

// ----------------------------------------------------------------------------
// Update Expense Prompt

export async function update_expense_prompt() {
  console.clear();

  try {
    const expenses = get_all_expenses();

    if (expenses.length === 0) {
      ui.logger.info("No expenses found");
      return;
    }

    const { id } = await prompts([
      {
        type: "select",
        name: "id",
        message: "What is the id of the expense?",
        choices: expenses.map((expense) => ({
          title: expense.name,
          value: expense.id,
        })),
      },
    ]);

    if (!id) return;

    const expense = get_expense_by_id(id)!;
    const response = await get_expense_response(expense);

    if (!response.name || !response.amount || !response.category_id) {
      return;
    }

    await update_expense({
      id: expense.id,
      name: response.name,
      amount: response.amount,
      category_id: response.category_id,
    });

    console.log("");
    ui.logger.success("Expense updated successfully");
    console.log("");
    get_all_expenses_prompt();
  } catch (error) {
    ui.logger.error("Error updating expense");
    console.error(error);
  }
}

// ----------------------------------------------------------------------------
// Delete Expense Prompt

export async function delete_expenses_prompt() {
  console.clear();

  try {
    const expenses = get_all_expenses();

    if (expenses.length === 0) {
      ui.logger.info("No expenses found");
      return;
    }

    const response = await prompts({
      type: "multiselect",
      name: "id",
      message: "Select the expenses to delete",
      choices: expenses.map((expense) => ({
        title: expense.name,
        value: expense.id,
      })),
    });

    if (response.id?.length === 0) return;

    await delete_expenses(response.id);

    console.log("");
    ui.logger.success("Expenses deleted successfully");
    console.log("");
    get_all_expenses_prompt();
  } catch (error) {
    ui.logger.error("Error deleting expenses");
    console.error(error);
  }
}

// ----------------------------------------------------------------------------
// Get Expenses By Category Prompt

export async function get_expenses_by_category_prompt() {
  console.clear();

  try {
    const categories = get_all_categories();

    if (categories.length === 0) {
      ui.logger.info("No categories found");
      return;
    }

    const record = sum_all_expenses_by_category();
    const table = ui.table();

    table.head(["Category", "Budget", "Amount", "Remaining"]);

    Object.entries(record).forEach(([category, { budget, amount }]) => {
      table.row([
        category,
        budget.toString(),
        amount.toString(),
        (budget - amount).toString(),
      ]);
    });

    table.render();
  } catch (error) {
    ui.logger.error("Error getting expenses by category");
    console.error(error);
  }
}
