// src/lib/CalculateCollectionTotal.ts

export function calculateCollectionTotal(
  userId: string,
  allProgress: any[]
): number {
  let total = 0;

  // Find all progress rows for this user,
  // but TEMPORARILY exclude Moon 3 (set_id = "3")
  const userRows = allProgress.filter(
    (row: any) =>
      row.user_id === userId &&
      row.set_id !== "3"
  );

  // Count cards exactly the same way the leaderboard does:
  // - Boolean true
  // - Objects like { owned: true }
  // - Ignore false and invalid values
  userRows.forEach((row: any) => {
    const progress = row.progress || {};

    Object.values(progress).forEach((value: any) => {
      const isOwned =
        value === true ||
        (typeof value === "object" && value?.owned === true);

      if (isOwned) {
        total++;
      }
    });
  });

  return total;
}