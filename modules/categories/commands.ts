import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import {
  get_all_categories_prompt,
  get_category_prompt,
  update_category_prompt,
  delete_categories_prompt,
  create_category_prompt,
} from "./prompts";

yargs(hideBin(process.argv))
  .command("gc", "Creates a new Category", create_category_prompt)
  .help()
  .parse();

yargs(hideBin(process.argv))
  .command("lc", "Lists all Categories", get_all_categories_prompt)
  .help()
  .parse();

yargs(hideBin(process.argv))
  .command("fc", "Gets a Category by Id", get_category_prompt)
  .help()
  .parse();

yargs(hideBin(process.argv))
  .command("uc", "Updates a Category", update_category_prompt)
  .help()
  .parse();

yargs(hideBin(process.argv))
  .command("dc", "Deletes one or more Categories", delete_categories_prompt)
  .help()
  .parse();
