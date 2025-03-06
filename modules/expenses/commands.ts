import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import {
  create_expense_prompt,
  delete_expenses_prompt,
  get_all_expenses_prompt,
  get_expense_prompt,
  get_expenses_by_category_prompt,
  update_expense_prompt,
} from "./prompts";

yargs(hideBin(process.argv))
  .command("g", "Creates a new Expense", create_expense_prompt)
  .help()
  .parse();

yargs(hideBin(process.argv))
  .command("l", "Lists all Expenses", get_all_expenses_prompt)
  .help()
  .parse();

yargs(hideBin(process.argv))
  .command("f", "Gets a Expense by Id", get_expense_prompt)
  .help()
  .parse();

yargs(hideBin(process.argv))
  .command("u", "Updates a Expense", update_expense_prompt)
  .help()
  .parse();

yargs(hideBin(process.argv))
  .command("d", "Deletes one or more Expenses", delete_expenses_prompt)
  .help()
  .parse();

yargs(hideBin(process.argv))
  .command("c", "Gets Expenses by Category", get_expenses_by_category_prompt)
  .help()
  .parse();
