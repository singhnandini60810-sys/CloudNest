import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const storageData = [
  { day: "Mon", uploads: 1.2 },
  { day: "Tue", uploads: 1.8 },
  { day: "Wed", uploads: 1.4 },
  { day: "Thu", uploads: 2.2 },
  { day: "Fri", uploads: 1.6 },
  { day: "Sat", uploads: 2.1 },
  { day: "Sun", uploads: 1.9 },
];

function StorageOverview() {
  return (
    <article className="dashboard-card chart-card">
      <div className="dashboard-card__header">
        <div>
          <h3>Storage Overview</h3>
          <p>Weekly upload activity</p>
        </div>

        <select aria-label="Storage overview period" defaultValue="week">
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div className="storage-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={storageData}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(75, 99, 130, 0.13)"
            />

            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              width={32}
            />

            <Tooltip
              cursor={{ fill: "rgba(164, 181, 196, 0.18)" }}
              contentStyle={{
                border: "none",
                borderRadius: "14px",
                boxShadow: "0 12px 30px rgba(7, 23, 57, 0.12)",
              }}
              formatter={(value) => [`${value} GB`, "Uploaded"]}
            />

            <Bar
              dataKey="uploads"
              fill="#4b6382"
              radius={[10, 10, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

export default StorageOverview;