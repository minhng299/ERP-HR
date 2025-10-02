import React, { useEffect, useState } from 'react';
import { hrapi } from '../services/api.jwt';

const Salary = () => {
  const [salary, setSalary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    hrapi.getMySalary && hrapi.getMySalary()
      .then(res => {
        setSalary(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-6">Loading salary...</div>;
  console.log(salary);
  if (error) return <div className="p-6 text-red-500">Failed to load salary data.</div>;
  if (!salary) return <div className="p-6">No salary data available.</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Your Salary</h2>
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
