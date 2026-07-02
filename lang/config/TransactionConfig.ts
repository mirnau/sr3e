export const TRANSACTION_KEYS = [
  "transaction", "amount", "type", "recurrent", "creditstick",
  "interestpermonth", "creditor", "deletedChat",
] as const;

export const TRANSACTION_TYPE_KEYS = [
  "income", "asset", "debt", "expense",
] as const;
