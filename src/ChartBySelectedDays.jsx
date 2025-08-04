// ChartBySelectedDays.jsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
  Cell,
} from "recharts";
import "./css/Chart.css";

export default function ChartBySelectedDays({ data, meta }) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div className="chart-error">No data available</div>;
  }

  const daysList = Array.isArray(meta?.days) ? meta.days.join(", ") : "";
  const title = meta?.store ? (
    <span className="tooltip-title">
      {meta.store} – Multiple Days
      {daysList && <span className="tooltip-popup">{daysList}</span>}
    </span>
  ) : (
    "Store Data"
  );

  const max = Math.max(...data.map((d) => d.total || 0));
  const coloredData = data.map((item) => {
    const ratio = max > 0 ? item.total / max : 0;
    const color = `rgba(66, 135, 245, ${0.3 + 0.7 * ratio})`;
    return { ...item, fill: color };
  });

  return (
    <div className="chart-wrapper">
      <h3 className="chart-title centered-title">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={coloredData}
          margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="total">
            {coloredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
            <LabelList dataKey="total" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
