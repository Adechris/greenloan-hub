export const naira = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);

export const formatDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" });
