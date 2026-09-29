import { describe, expect, it } from "vitest";
import { addDaysToBrazilDateKey, brazilDateKey, brazilDateTimeToIso } from "./timezone";

describe("horário oficial do sistema", () => {
  it("usa o dia de Brasília mesmo quando o instante ainda está no dia anterior em UTC−3", () => {
    expect(brazilDateKey("2026-09-01T02:30:00.000Z")).toBe("2026-08-31");
  });

  it("soma dias como calendário sem depender do fuso do navegador", () => {
    expect(addDaysToBrazilDateKey(1, "2026-09-01T02:30:00.000Z")).toBe("2026-09-01");
  });

  it("converte uma data e hora de Brasília para o instante UTC correto", () => {
    expect(brazilDateTimeToIso("2026-08-31", "14:05")).toBe("2026-08-31T17:05:00.000Z");
  });
});
