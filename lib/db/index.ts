import { v4 as uuidv4 } from "uuid";
import { JSONFilePreset } from "lowdb/node";

import type { Category, CreateExpenseInput, DB, Expense } from "../../domain";

// ----------------------------------------------------------------------------
// DB
// ----------------------------------------------------------------------------

const db = await JSONFilePreset<DB>("db.json", {
  categories: [],
  expenses: [],
});

// ----------------------------------------------------------------------------
// Categories
// ----------------------------------------------------------------------------

export const create_category = async (name: string, budget: number) => {
  const id = uuidv4();

  await db.update(({ categories }) => {
    categories.push({ id, name, budget });
  });

  return db.data.categories.find((category) => category.id === id);
};

export const get_all_categories = () => {
  return db.data.categories;
};

export const get_category_by_id = (id: string) => {
  return db.data.categories.find((category) => category.id === id);
};

export const get_expenses_count_from_category = (category_id: string) => {
  return db.data.expenses.filter(
    (expense) => expense.category_id === category_id
  ).length;
};

export const update_category = ({ id, name }: Category) => {
  return db.update(({ categories }) => {
    return categories.map((category) => {
      if (category.id === id) {
        category.name = name;
      }
      return category;
    });
  });
};

export const delete_categories = async (ids: string[]) => {
  await db.update(({ categories }) => {
    const indexesToRemove = categories
      .map((category, index) => (ids.includes(category.id) ? index : -1))
      .filter((index) => index !== -1)
      .reverse();

    for (const index of indexesToRemove) {
      categories.splice(index, 1);
    }
  });

  // Delete all expenses associated with the categories
  await db.update(({ expenses }) => {
    return expenses.filter((expense) => !ids.includes(expense.category_id));
  });
};

// ----------------------------------------------------------------------------
// Expenses
// ----------------------------------------------------------------------------

export const create_expense = ({
  name,
  amount,
  category_id,
}: CreateExpenseInput) => {
  return db.update(({ expenses }) =>
    expenses.push({ id: uuidv4(), name, amount, category_id })
  );
};

export const get_all_expenses = () => {
  return db.data.expenses;
};

export const get_expense_by_id = (id: string) => {
  return db.data.expenses.find((expense) => expense.id === id);
};

export const get_expense_category = (id: string) => {
  return db.data.categories.find((category) => category.id === id);
};

export const update_expense = ({
  id,
  name,
  amount,
  category_id,
}: Partial<Expense>) => {
  return db.update(({ expenses }) =>
    expenses.map((expense) => {
      if (expense.id === id) {
        expense.name = name ?? expense.name;
        expense.amount = amount ?? expense.amount;
        expense.category_id = category_id ?? expense.category_id;
      }
      return expense;
    })
  );
};

export const delete_expenses = (ids: string[]) => {
  return db.update(({ expenses }) => {
    const indexesToRemove = expenses
      .map((expense, index) => (ids.includes(expense.id) ? index : -1))
      .filter((index) => index !== -1)
      .reverse();

    for (const index of indexesToRemove) {
      expenses.splice(index, 1);
    }
  });
};

export const sum_all_expenses = () => {
  return db.data.expenses.reduce((acc, expense) => acc + expense.amount, 0);
};

export const sum_all_expenses_by_category = () => {
  return db.data.expenses.reduce((acc, expense) => {
    const category = db.data.categories.find(
      (category) => category.id === expense.category_id
    );
    if (category) {
      acc[category.name] = {
        amount: (acc[category.name]?.amount || 0) + expense.amount,
        budget: category.budget,
      };
    }
    return acc;
  }, {} as Record<Category["name"], { amount: number; budget: number }>);
};
