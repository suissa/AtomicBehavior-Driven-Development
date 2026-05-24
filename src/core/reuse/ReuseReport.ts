import type { ReuseReport as ReuseReportData } from "../../types/index.js";

export class ReuseReportFormatter {
  format(report: ReuseReportData): string {
    return [
      `Reused artifacts: ${report.reused.length}`,
      `Generated artifacts: ${report.generated.length}`,
      `Custom artifacts: ${report.custom.length}`,
      `Unresolved artifacts: ${report.unresolved.length}`,
      `Decisions: ${report.decisions.length}`
    ].join("\n");
  }
}
