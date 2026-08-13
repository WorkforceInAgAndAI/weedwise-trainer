import { weedsForGrade } from "@/data/gradeWeeds";
import { lookAlikeGroupsForPool } from "@/data/lookAlikeGroups";
for (const g of ["elementary","middle","high","collegiate"] as const) {
  const pool = weedsForGrade(g as any);
  const groups = lookAlikeGroupsForPool(pool as any);
  console.log(g, pool.length, "groups:", groups.length);
  groups.forEach(x=>console.log("   ", x.ids.join(" | ")));
}
