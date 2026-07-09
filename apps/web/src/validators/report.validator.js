export function validateReport(report) {
  const errors = {};
  if (!report.reportType) {
    errors.reportType = "Report type is required.";
  }
  return Object.keys(errors).length > 0 ? errors : null;
}
