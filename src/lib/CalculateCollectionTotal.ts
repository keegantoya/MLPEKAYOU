export function calculateCollectionTotal(
  userId: string,
  allProgress: any[]
): number {
  return allProgress
    .filter(row => row.user_id === userId)
    .reduce((total, row) => {
      return (
        total +
        Object.values(row.progress ?? {}).filter((value: any) =>
          value === true ||
          (value &&
            typeof value === "object" &&
            value.owned === true)
        ).length
      );
    }, 0);
}