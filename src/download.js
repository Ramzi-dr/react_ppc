// download.js
import * as XLSX from "xlsx";
import {
  fetchDataByDayOrDays,
  fetchDataByPeriod,
  fetchDataByDaysWithTime,
} from "./api/stores";

export async function downloadChartData(store, meta) {
  try {
    if (!store || !meta || !meta.type) throw new Error("Missing store or meta");

    let rawData = {};

    switch (meta.type) {
      case "today":
      case "single":
        rawData = await fetchDataByDayOrDays({
          store,
          day: meta.date,
          transformed: false,
        });
        break;

      case "period":
        rawData = await fetchDataByPeriod({
          store,
          start: meta.startDate,
          end: meta.endDate,
          transformed: false,
        });
        break;

      case "days_time":
        rawData = await fetchDataByDaysWithTime({
          store,
          days: meta.days,
          startTime: meta.startTime || "00:00",
          endTime: meta.endTime || "23:59",
        });
        break;

      default:
        throw new Error("Unsupported chart type for export");
    }

    console.log("[downloadChartData] Raw backend data:", rawData);

    // Transform to flat CSV format with only Date, Hour, Enter
    const rows = [];
    Object.entries(rawData).forEach(([date, hourly]) => {
      hourly.forEach((item) => {
        const fullTime = item.timeSpan?.startTime || "";
        const onlyTime = fullTime.split("T")[1] || fullTime;
        rows.push({
          Date: date,
          Hour: onlyTime,
          Enter: item.enterCount || 0,
        });
      });
    });

    // Generate filename
    const sanitize = (s) => s.replace(/[^a-zA-Z0-9_\-\.]/g, "_");
    let filename = sanitize(store);

    if (meta.type === "single" || meta.type === "today") {
      filename += `_${formatDate(meta.date)}`;
    } else if (meta.type === "period") {
      filename += `_period_${formatDate(meta.startDate)}-${formatDate(meta.endDate)}`;
    } else if (meta.type === "days_time") {
      const validDays = Object.keys(rawData);
      const parts = validDays.map(formatDate).join("-");
      filename += `_selectedDays_[${parts}]`;
    }

    // Convert to CSV
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    console.error("[downloadChartData] Error:", e.message || e);
    alert("❌ Failed to fetch data for export. " + (e.message || ""));
  }
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return null;
  return `${d}.${m}.${y}`;
}
