import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const fileTypeData = [
  { name: "Documents", value: 45, color: "#071739" },
  { name: "Images", value: 25, color: "#4B6382" },
  { name: "Videos", value: 15, color: "#A4B5C4" },
  { name: "Audio", value: 10, color: "#A68868" },
  { name: "Others", value: 5, color: "#E3C39D" },
];

function FileTypeChart() {
  return (
    <article className="dashboard-card file-type-card">
      <div className="dashboard-card__header">
        <div>
          <h3>File Types</h3>
          <p>Storage by category</p>
        </div>
      </div>

      <div className="file-type-card__content">
        <div className="file-type-chart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={fileTypeData}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={82}
                paddingAngle={2}
              >
                {fileTypeData.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  border: "none",
                  borderRadius: "14px",
                  boxShadow: "0 12px 30px rgba(7, 23, 57, 0.12)",
                }}
                formatter={(value) => [`${value}%`, "Usage"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="file-type-legend">
          {fileTypeData.map((item) => (
            <div key={item.name} className="file-type-legend__item">
              <span
                className="file-type-legend__dot"
                style={{ backgroundColor: item.color }}
              />

              <span>{item.name}</span>

              <strong>{item.value}%</strong>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export default FileTypeChart;