import React from "react";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

interface AdminLineChartProps {
  data: Array<{ x: string; y: number }>;
  title: string;
  color?: string;
}

const AdminLineChart: React.FC<AdminLineChartProps> = ({ data, title, color }) => {
  const options: ApexOptions = {
    chart: {
      type: "line",
      toolbar: { show: false },
      background: "transparent",
    },
    stroke: { curve: "smooth", width: 3 },
    xaxis: {
      categories: data.map((d) => d.x),
      labels: { style: { colors: "#64748b" } },
    },
    yaxis: {
      labels: { style: { colors: "#64748b" } },
    },
    fill: { colors: [color || "#6366f1"] },
    grid: { show: false },
    title: { text: title, style: { color: "#334155", fontWeight: 700 } },
  };
  const series = [
    {
      name: title,
      data: data.map((d) => d.y),
    },
  ];
  return (
    <div className="rounded-2xl bg-white/10 p-6">
      <ReactApexChart options={options} series={series} type="line" height={260} />
    </div>
  );
};

export default AdminLineChart;
