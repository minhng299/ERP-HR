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

  const [showPayslip, setShowPayslip] = useState(false);
  const [downloading, setDownloading] = useState(false);

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

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const res = await hrapi.getPayslipPdf(selectedMonth);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip_${selectedMonth}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

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
      <div
        className="bg-white rounded-lg shadow p-6 max-w-md cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setShowPayslip(true)}
      >
        <div className="mb-2 text-lg font-semibold text-gray-700">Net Salary:</div>
        <div className="text-3xl font-bold text-green-600">{salary.net_salary} VND</div>
        <div className="mt-4 text-gray-500">Base: {salary.base_salary} VND</div>
        <div className="text-gray-500">Bonus: {salary.bonus} VND</div>
        <div className="text-gray-500">Deductions: {salary.deductions} VND</div>
        <div className="text-gray-500">Month: {salary.month}</div>
        <div className="mt-4 text-xs text-gray-400 italic">
          Click to view detailed payslip
        </div>
      </div>

      {showPayslip && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-gray bg-opacity-30"
          style={{ backdropFilter: 'blur(10px)' }}
          onClick={() => setShowPayslip(false)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl ring-1 ring-black/10 drop-shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-xl font-semibold">Payslip</h3>
              <button
                onClick={() => setShowPayslip(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-4 text-sm leading-relaxed">
              <div className="mb-4 text-center">
                <div className="text-lg font-bold">PAYSLIP</div>
                <div className="text-gray-600">Month: {salary.payslip?.month}</div>
              </div>

              <div className="mb-4 border-b pb-3">
                <div><span className="font-semibold">Employee:</span> {salary.payslip?.employee_name}</div>
                <div><span className="font-semibold">Employee ID:</span> {salary.payslip?.employee_id}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <div className="font-semibold mb-2">Earnings</div>
                  <div className="flex justify-between"><span>Base Salary</span><span>{salary.payslip?.base_salary} VND</span></div>
                  <div className="flex justify-between"><span>Overtime Bonus</span><span>{salary.payslip?.overtime_bonus} VND</span></div>
                  <div className="flex justify-between"><span>Other Bonus</span><span>{salary.payslip?.other_bonus} VND</span></div>
                  <div className="flex justify-between font-semibold border-t mt-2 pt-2">
                    <span>Gross Salary</span>
                    <span>{salary.payslip?.gross_salary} VND</span>
                  </div>
                </div>

                <div>
                  <div className="font-semibold mb-2">Deductions</div>
                  <div className="flex justify-between"><span>Late ({salary.payslip?.late_days} days)</span><span>{salary.payslip?.late_penalty} VND</span></div>
                  <div className="flex justify-between"><span>Absent ({salary.payslip?.absent_days} days)</span><span>{salary.payslip?.absent_penalty} VND</span></div>
                  <div className="flex justify-between"><span>Incomplete ({salary.payslip?.incomplete_days} days)</span><span>{salary.payslip?.incomplete_penalty} VND</span></div>
                  <div className="flex justify-between"><span>Leave Penalty</span><span>{salary.payslip?.leave_penalty} VND</span></div>
                  <div className="flex justify-between font-semibold border-t mt-2 pt-2">
                    <span>Total Deductions</span>
                    <span>{salary.payslip?.total_deductions} VND</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-3 mt-2 flex justify-between items-center">
                <div className="font-semibold text-lg">
                  Net Salary: <span className="text-green-600">{salary.payslip?.net_salary} VND</span>
                </div>
                <button
                  onClick={handleDownloadPdf}
                  disabled={downloading}
                  className="px-3 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {downloading ? 'Downloading...' : 'Download PDF'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Salary;
