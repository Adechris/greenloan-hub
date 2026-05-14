// Maps role -> table name. Each role has its own table.
export const ROLE_TABLE = {
  admin: "admins",
  officer: "loan_officers",
  borrower: "borrowers",
};

export const VALID_ROLES = Object.keys(ROLE_TABLE);
