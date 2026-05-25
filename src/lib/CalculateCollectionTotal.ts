export function calculateCollectionTotal(
  userId: string,
  allProgress: any[]
): number {
  let total = 0;

  const userRows = allProgress.filter(
    (row: any) => row.user_id === userId
  );

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