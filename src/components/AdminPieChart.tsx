import React from "react";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

interface AdminPieChartProps {
  data: number[];
  labels: string[];
  title: string;
  colors?: string[];
}

const AdminPieChart: React.FC<AdminPieChartProps> = ({ data, labels, title, colors }) => {
  const options: ApexOptions = {
    chart: {
      type: "pie",
      toolbar: { show: false },
      background: "transparent",
    },
    labels: labels,
    legend: {
      position: "bottom",
      labels: { colors: "#64748b" },
    },
    fill: { colors: colors || ["#fbbf24", "#22c55e", "#ef4444"] },
    colors: colors,
    title: { text: title, style: { color: "#334155", fontWeight: 700 } },
  };
  return (
    <div className="rounded-2xl bg-white/10 p-6">
      <ReactApexChart options={options} series={data} type="pie" height={260} />
    </div>
  );
};

export default AdminPieChart;
