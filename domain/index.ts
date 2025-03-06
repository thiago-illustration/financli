// ----------------------------------------------------------------------------
// DB
// ----------------------------------------------------------------------------

export type DB = {
  categories: Category[];
  expenses: Expense[];
};

// ----------------------------------------------------------------------------
// Categories
// ----------------------------------------------------------------------------

export type Category = {
  id: string;
  name: string;
  budget: number;
};

// ----------------------------------------------------------------------------
// Expenses
// ----------------------------------------------------------------------------

export type Expense = {
  id: string;
  name: string;
  amount: number;
  category_id: string;
};

export type CreateExpenseInput = {
  name: string;
  amount: number;
  category_id: string;
};
