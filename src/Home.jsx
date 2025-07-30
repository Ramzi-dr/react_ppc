// Home.jsx
import { useState } from "react";
import FloatingMenu from "./FloatingMenu";
import StoreDropdown from "./components/StoreDropdown";
import Popup from "./Popup";
import Chart from "./Chart";
import ChartByPeriod from "./ChartByPeriod";
import Footer from "./components/Footer";
import "./css/Home.css";

export default function Home() {
  const [popup, setPopup] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [chartMeta, setChartMeta] = useState({
    store: null,
    type: "today",
    date: null,
  });

  const renderChart = () => {
    if (!chartData || Object.keys(chartData).length === 0) return null;

    if (chartMeta.type === "period") {
      return <ChartByPeriod data={chartData} meta={chartMeta} />;
    }

    return <Chart data={chartData} meta={chartMeta} />;
  };

  return (
    <div className="page-wrapper">
      <div className="menu-footer-wrapper">
        <FloatingMenu />
      </div>

      <div className="header-area">
        <StoreDropdown
          setPopup={setPopup}
          setChartData={setChartData}
          setChartMeta={setChartMeta}
        />
      </div>

      <div className="chart-area">{renderChart()}</div>

      <div className="footer-container">
        <Footer />
      </div>

      {popup && (
        <Popup
          message={popup.message}
          type={popup.type}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}
