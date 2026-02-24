import { z } from "zod";
import type { TleSatellite } from "./sampleTle";

export const TleSchema = z.object({
  name: z.string().min(1),
  line1: z.string().length(69),
  line2: z.string().length(69),
  noradId: z.string().min(1),
});

export type Tle = z.infer<typeof TleSchema>;

export function parseTleText(raw: string): TleSatellite[] {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const results: TleSatellite[] = [];

  for (let i = 0; i < lines.length - 2; i++) {
    const l0 = lines[i];
    const l1 = lines[i + 1];
    const l2 = lines[i + 2];

    if (l1.startsWith("1 ") && l2.startsWith("2 ")) {
      const noradId = l1.substring(2, 7).trim();
      results.push({
        name: l0.replace(/^0 /, "").trim(),
        line1: l1,
        line2: l2,
        noradId,
      });
      i += 2;
    }
  }
  return results;
}

export function validateTle(tle: unknown): Tle | null {
  const result = TleSchema.safeParse(tle);
  return result.success ? result.data : null;
}
