import React, { useEffect, useState } from 'react';
import { hrapi } from '../services/api.jwt';

const Salary = () => {
  const [salary, setSalary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`; // format for <input type="month">
  });

  const fetchSalary = (monthValue) => {
    setLoading(true);
    setError(false);
    hrapi.getMySalary && hrapi.getMySalary(monthValue)
      .then(res => {
        setSalary(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSalary(selectedMonth);
  }, [selectedMonth]);

  if (loading) return <div className="p-6">Loading salary...</div>;
  console.log(salary);
  if (error) return <div className="p-6 text-red-500">Failed to load salary data.</div>;
  if (!salary) return <div className="p-6">No salary data available.</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <h2 className="text-2xl font-bold">Your Salary</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600" htmlFor="salary-month">
            Month
          </label>
          <input
            id="salary-month"
            type="month"
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6 max-w-md">
        <div className="mb-2 text-lg font-semibold text-gray-700">Net Salary:</div>
        <div className="text-3xl font-bold text-green-600">{salary.net_salary} VND</div>
        <div className="mt-4 text-gray-500">Base: {salary.base_salary} VND</div>
        <div className="text-gray-500">Bonus: {salary.bonus} VND</div>
        <div className="text-gray-500">Deductions: {salary.deductions} VND</div>
        <div className="text-gray-500">Month: {salary.month}</div>
      </div>
    </div>
  );
};

export default Salary;
