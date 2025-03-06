import prompts from "prompts";

export function format_currency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
