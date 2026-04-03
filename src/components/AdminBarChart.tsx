import React from "react";
import ReactApexChart from "react-apexcharts";

interface AdminBarChartProps {
  data: Array<{ x: string; y: number }>;
  title: string;
  color?: string;
}

import type { ApexOptions } from 'apexcharts';

const AdminBarChart: React.FC<AdminBarChartProps> = ({ data, title, color }) => {
  const options: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      background: "transparent",
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        horizontal: false,
        columnWidth: "40%",
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: data.map((d) => d.x),
      labels: { style: { colors: "#64748b" } },
    },
    yaxis: {
      labels: { style: { colors: "#64748b" } },
    },
    fill: {
      colors: [color || "#2563eb"],
    },
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
      <ReactApexChart options={options} series={series} type="bar" height={260} />
    </div>
  );
};

export default AdminBarChart;
