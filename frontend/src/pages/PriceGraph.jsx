//PriceGraph.jsx
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const wasteTypes = ["Plastic", "Organic", "E-Waste", "Construction", "Hazardous"];

export default function PriceGraph() {
  const [selectedTypes, setSelectedTypes] = useState(["Plastic"]);
  const [data, setData] = useState({});
  const [month, setMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    selectedTypes.forEach((type) => {
      fetch(
        `http://127.0.0.1:5000/price_history?waste_type=${type}&start_date=${year}-${month}-01&end_date=${year}-${month}-31`
      )
        .then((res) => res.json())
        .then((d) =>
          setData((prev) => ({
            ...prev,
            [type]: d,
          }))
        );
    });
  }, [selectedTypes, month, year]);

  // Merge datasets by Date
  const mergedData = [];
  if (Object.keys(data).length > 0) {
    const allDates = new Set();
    Object.values(data).forEach((arr) => {
      arr.forEach((row) => allDates.add(row.Date));
    });

    allDates.forEach((date) => {
      const row = { Date: date };
      selectedTypes.forEach((type) => {
        const entry = data[type]?.find((d) => d.Date === date);
        row[type] = entry ? entry.Price_per_kg : null;
      });
      mergedData.push(row);
    });
  }

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto" }}>
      <h2>Scrap Price Trends</h2>
      <div>
        {wasteTypes.map((type) => (
          <label key={type} style={{ marginRight: 10 }}>
            <input
              type="checkbox"
              checked={selectedTypes.includes(type)}
              onChange={(e) => {
                setData({});
                setSelectedTypes(
                  e.target.checked
                    ? [...selectedTypes, type]
                    : selectedTypes.filter((t) => t !== type)
                );
              }}
            />
            {type}
          </label>
        ))}
      </div>

      {mergedData.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={mergedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {selectedTypes.map((type, idx) => (
              <Line
                key={type}
                type="monotone"
                dataKey={type}
                stroke={
                  ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE"][idx]
                }
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p style={{ marginTop: "1rem" }}>Loading chart...</p>
      )}
    </div>
  );
}
