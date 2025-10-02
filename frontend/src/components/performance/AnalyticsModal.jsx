import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { hrapi } from "../../services/api.jwt";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const AnalyticsModal = ({ isOpen, onClose }) => {
  const [period, setPeriod] = useState("month");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [quarter, setQuarter] = useState(1);
  const [data, setData] = useState([]);

  const fetchData = async (p = period, y = year, m = month, q = quarter) => {
    try {
      const res = await hrapi.getPerformanceAnalyticsByPeriod(p, y, m, q);
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch period analytics:", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-5xl p-6 relative">
        {/* Close */}
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Phân tích hiệu suất theo kỳ
        </h2>

        {/* Bộ lọc */}
        <div className="mb-4 flex flex-wrap items-center space-x-4">
          <div>
            <label className="text-gray-700 font-medium mr-2">Kỳ:</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="month">Tháng</option>
              <option value="quarter">Quý</option>
              <option value="year">Năm</option>
            </select>
          </div>

          <div>
            <label className="text-gray-700 font-medium mr-2">Năm:</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-24"
            />
          </div>

          {period === "month" && (
            <div>
              <label className="text-gray-700 font-medium mr-2">Tháng:</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2"
              >
                {[...Array(12).keys()].map((m) => (
                  <option key={m + 1} value={m + 1}>
                    {m + 1}
                  </option>
                ))}
              </select>
            </div>
          )}

          {period === "quarter" && (
            <div>
              <label className="text-gray-700 font-medium mr-2">Quý:</label>
              <select
                value={quarter}
                onChange={(e) => setQuarter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value={1}>Q1</option>
                <option value={2}>Q2</option>
                <option value={3}>Q3</option>
                <option value={4}>Q4</option>
              </select>
            </div>
          )}

          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            onClick={() => fetchData(period, year, month, quarter)}
          >
            Xem
          </button>
        </div>

        {/* Chart */}
        <div className="mb-6">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dept" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avg_rating" fill="#8884d8" name="Điểm TB" />
              <Bar dataKey="total_reviews" fill="#82ca9d" name="Tổng Review" />
              <Bar dataKey="finalized_reviews" fill="#ffc658" name="Finalized" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bảng dữ liệu */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Kỳ
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Phòng ban
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Điểm TB
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Tổng Review
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Finalized
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {data.map((row, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {row.period}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">{row.dept}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {Number(row.avg_rating || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {row.total_reviews}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {row.finalized_reviews}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsModal;
