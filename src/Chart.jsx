// Chart.jsx
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
  Filler,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useMemo } from "react";
import "./css/Chart.css";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
  Filler,
  ChartDataLabels
);

export default function Chart({ data = {}, meta = {} }) {
  const parsed = useMemo(() => {
    if (!data || typeof data !== "object") return [];

    const firstKey = Object.keys(data)[0];
    const values = Array.isArray(data[firstKey]) ? data[firstKey] : [];
    return values.map((entry) => ({
      time: entry.timeSpan?.startTime || "",
      enter: parseInt(entry.enterCount || 0),
      exit: parseInt(entry.exitCount || 0),
    }));
  }, [data]);

  const labels = [...Array(24).keys()].map(
    (h) => h.toString().padStart(2, "0") + ":00"
  );

  const hourlyData = Array(24)
    .fill(0)
    .map((_, i) => {
      const found = parsed.find((d) => new Date(d.time).getHours() === i);
      return found ? found : { enter: 0, exit: 0 };
    });

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return isNaN(d) ? "??" : d.toLocaleDateString("de-CH");
  }

  let title = "Chart";
  if (meta?.store && meta?.type === "today") {
    title = `${meta.store} – Today Chart`;
  } else if (meta?.store && meta?.type === "single") {
    title = `${meta.store} – ${formatDate(meta.date)}`;
  } else if (meta?.store && meta?.type === "period") {
    title = `${meta.store} – ${formatDate(meta.startDate)} → ${formatDate(
      meta.endDate
    )}`;
  } else if (meta?.store && meta?.type === "days_time") {
    title = `${meta.store} – Multiple Days`;
  }

  // 🔥 Add dynamic Y-axis height padding
  const maxValue = Math.max(...hourlyData.map((d) => d.enter), 10);
  const paddedMax = Math.ceil(maxValue * 1.2); // 20% padding

  const chartData = {
    labels,
    datasets: [
      {
        label: "Entry Count",
        data: hourlyData.map((d) => d.enter),
        borderColor: "#2196f3",
        backgroundColor: "rgba(33,150,243,0.3)",
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        datalabels: {
          display: true,
          align: "top",
          anchor: "end",
          color: "#1976d2",
          font: {
            weight: "bold",
            size: 10,
          },
          formatter: (value) => (value > 0 ? value : ""),
        },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        clip: false, // 💡 allow label to render outside canvas
      },
      legend: { display: false },
      title: {
        display: true,
        text: title,
        font: { size: 18 },
        padding: { bottom: 20 },
      },
      tooltip: {
        callbacks: {
          title: (ctx) => ctx[0]?.label || "",
          label: (ctx) => `Count: ${ctx.raw}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { autoSkip: false },
      },
      y: {
        beginAtZero: true,
        grid: { display: false },
        ticks: { display: false },
        min: 0,
        max: paddedMax, // ✅ dynamic max based on data
      },
    },
  };

  return (
    <div className="chart-wrapper">
      <Line data={chartData} options={options} plugins={[ChartDataLabels]} />
    </div>
  );
}
