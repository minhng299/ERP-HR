import React, { useEffect, useState } from 'react';
import { hrapi } from '../services/api.jwt';
import { useAuth } from '../contexts/AuthContext';

const Salary = () => {
  const { user } = useAuth();
  const isManager = user?.role === 'manager';
  const [activeTab, setActiveTab] = useState('your-salary');
  
  const [salary, setSalary] = useState(null);
  const [teamSalaries, setTeamSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamLoading, setTeamLoading] = useState(false);
  const [error, setError] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`; // format for <input type="month">
  });

  const [showPayslip, setShowPayslip] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [payslipData, setPayslipData] = useState(null);
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

  const fetchTeamSalary = (monthValue) => {
    setTeamLoading(true);
    hrapi.getTeamSalary && hrapi.getTeamSalary(monthValue)
      .then(res => {
        setTeamSalaries(res.data.team_salaries || []);
        setTeamLoading(false);
      })
      .catch(() => {
        setTeamLoading(false);
      });
  };

  useEffect(() => {
    fetchSalary(selectedMonth);
    if (isManager) {
      fetchTeamSalary(selectedMonth);
    }
  }, [selectedMonth, isManager]);

  const handleViewEmployeePayslip = async (employeeId) => {
    try {
      setLoading(true);
      const res = await hrapi.getEmployeeSalary(employeeId, selectedMonth);
      setPayslipData(res.data);
      setSelectedEmployeeId(employeeId);
      setShowPayslip(true);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (employeeId = null) => {
    try {
      setDownloading(true);
      const res = await hrapi.getPayslipPdf(selectedMonth, employeeId);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = employeeId 
        ? `payslip_employee_${employeeId}_${selectedMonth}.pdf`
        : `payslip_${selectedMonth}.pdf`;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  const currentPayslipData = payslipData || salary;

  if (loading && !payslipData) return <div className="p-6">Loading salary...</div>;
  if (error) return <div className="p-6 text-red-500">Failed to load salary data.</div>;
  if (!salary && !payslipData) return <div className="p-6">No salary data available.</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <h2 className="text-2xl font-bold">Salary</h2>
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

      {/* Tabs for Manager */}
      {isManager && (
        <div className="mb-4 border-b border-gray-200">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('your-salary')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'your-salary'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Your Salary
            </button>
            <button
              onClick={() => setActiveTab('team-salary')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'team-salary'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Team Salary
            </button>
          </div>
        </div>
      )}

      {/* Your Salary Tab */}
      {(activeTab === 'your-salary' || !isManager) && (
        <div>
          <div
            className="bg-white rounded-lg shadow p-6 max-w-md cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              setPayslipData(null);
              setSelectedEmployeeId(null);
              setShowPayslip(true);
            }}
          >
            <div className="mb-2 text-lg font-semibold text-gray-700">Net Salary:</div>
            <div className="text-3xl font-bold text-green-600">{salary?.net_salary?.toLocaleString()} VND</div>
            <div className="mt-4 text-gray-500">Base: {salary?.base_salary?.toLocaleString()} VND</div>
            <div className="text-gray-500">Bonus: {salary?.bonus?.toLocaleString()} VND</div>
            <div className="text-gray-500">Deductions: {salary?.deductions?.toLocaleString()} VND</div>
            <div className="text-gray-500">Month: {salary?.month}</div>
            <div className="mt-4 text-xs text-gray-400 italic">
              Click to view detailed payslip
            </div>
          </div>
        </div>
      )}

      {/* Team Salary Tab */}
      {isManager && activeTab === 'team-salary' && (
        <div>
          {teamLoading ? (
            <div className="p-6">Loading team salaries...</div>
          ) : teamSalaries.length === 0 ? (
            <div className="p-6 text-gray-500">No team members found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamSalaries.map((empSalary) => (
                <div
                  key={empSalary.employee_id}
                  className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleViewEmployeePayslip(empSalary.employee_id)}
                >
                  <div className="mb-2 text-sm font-semibold text-gray-700">{empSalary.employee_name}</div>
                  <div className="text-xs text-gray-500 mb-2">{empSalary.position} - {empSalary.employee_code}</div>
                  <div className="mb-2 text-lg font-semibold text-gray-700">Net Salary:</div>
                  <div className="text-2xl font-bold text-green-600">{empSalary.net_salary?.toLocaleString()} VND</div>
                  <div className="mt-3 text-xs text-gray-500">
                    <div>Base: {empSalary.base_salary?.toLocaleString()} VND</div>
                    <div>Bonus: {empSalary.bonus?.toLocaleString()} VND</div>
                    <div>Deductions: {empSalary.deductions?.toLocaleString()} VND</div>
                  </div>
                  <div className="mt-3 text-xs text-gray-400 italic">
                    Click to view payslip
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payslip Modal */}
      {showPayslip && currentPayslipData && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-gray bg-opacity-30"
          style={{ backdropFilter: 'blur(10px)' }}
          onClick={() => {
            setShowPayslip(false);
            setPayslipData(null);
            setSelectedEmployeeId(null);
          }}
        >
          <div
            className="bg-white rounded-lg shadow-2xl ring-1 ring-black/10 drop-shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-xl font-semibold">Payslip</h3>
              <button
                onClick={() => {
                  setShowPayslip(false);
                  setPayslipData(null);
                  setSelectedEmployeeId(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-4 text-sm leading-relaxed">
              <div className="mb-4 text-center">
                <div className="text-lg font-bold">PAYSLIP</div>
                <div className="text-gray-600">Month: {currentPayslipData.payslip?.month || currentPayslipData.month}</div>
              </div>

              <div className="mb-4 border-b pb-3">
                <div><span className="font-semibold">Employee:</span> {currentPayslipData.payslip?.employee_name || user?.user?.first_name + ' ' + user?.user?.last_name}</div>
                <div><span className="font-semibold">Employee ID:</span> {currentPayslipData.payslip?.employee_id || user?.id}</div>
              </div>

              {/* Leave Information Section */}
              {(currentPayslipData.payslip?.approved_leave_days > 0 || currentPayslipData.payslip?.rejected_leave_days > 0) && (
                <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <div className="font-semibold mb-2 text-blue-800">Leave Information</div>
                  <div className="text-sm space-y-1">
                    {currentPayslipData.payslip?.approved_leave_days > 0 && (
                      <div className="flex justify-between">
                        <span className="text-green-700">Approved Leave Days:</span>
                        <span className="font-semibold text-green-700">{currentPayslipData.payslip.approved_leave_days} days</span>
                      </div>
                    )}
                    {currentPayslipData.payslip?.rejected_leave_days > 0 && (
                      <div className="flex justify-between">
                        <span className="text-red-700">Rejected Leave Days:</span>
                        <span className="font-semibold text-red-700">{currentPayslipData.payslip.rejected_leave_days} days</span>
                      </div>
                    )}
                    {currentPayslipData.payslip?.total_leave_days > currentPayslipData.payslip?.leave_penalty_threshold && (
                      <div className="mt-2 pt-2 border-t border-blue-300 text-xs text-gray-600">
                        <div>Total approved: {currentPayslipData.payslip.total_leave_days} days</div>
                        <div>Free days: {currentPayslipData.payslip.leave_penalty_threshold} days</div>
                        <div className="font-semibold text-red-600">
                          Penalty applied for: {currentPayslipData.payslip.total_leave_days - currentPayslipData.payslip.leave_penalty_threshold} days
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <div className="font-semibold mb-2">Earnings</div>
                  <div className="flex justify-between"><span>Base Salary</span><span>{currentPayslipData.payslip?.base_salary?.toLocaleString()} VND</span></div>
                  <div className="flex justify-between"><span>Overtime Bonus</span><span>{currentPayslipData.payslip?.overtime_bonus?.toLocaleString()} VND</span></div>
                  <div className="flex justify-between"><span>Other Bonus</span><span>{currentPayslipData.payslip?.other_bonus?.toLocaleString()} VND</span></div>
                  <div className="flex justify-between font-semibold border-t mt-2 pt-2">
                    <span>Gross Salary</span>
                    <span>{currentPayslipData.payslip?.gross_salary?.toLocaleString()} VND</span>
                  </div>
                </div>

                <div>
                  <div className="font-semibold mb-2">Deductions</div>
                  
                  {/* Late Penalty */}
                  {currentPayslipData.payslip?.late_days > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Late Arrival ({currentPayslipData.payslip?.late_days} days × 100,000)</span>
                      <span className="text-red-600">-{currentPayslipData.payslip?.late_penalty?.toLocaleString()} VND</span>
                    </div>
                  )}
                  
                  {/* Absent Penalty */}
                  {currentPayslipData.payslip?.absent_days > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Absent ({currentPayslipData.payslip?.absent_days} days × 100,000)</span>
                      <span className="text-red-600">-{currentPayslipData.payslip?.absent_penalty?.toLocaleString()} VND</span>
                    </div>
                  )}
                  
                  {/* Incomplete Penalty */}
                  {currentPayslipData.payslip?.incomplete_days > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Incomplete Attendance ({currentPayslipData.payslip?.incomplete_days} days × 50,000)</span>
                      <span className="text-red-600">-{currentPayslipData.payslip?.incomplete_penalty?.toLocaleString()} VND</span>
                    </div>
                  )}
                  
                  {/* Leave Penalty - detailed breakdown */}
                  {currentPayslipData.payslip?.leave_penalty > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="flex justify-between text-gray-700 mb-1">
                        <span className="font-semibold">Leave Penalty (over {currentPayslipData.payslip?.leave_penalty_threshold} days)</span>
                        <span className="text-red-600 font-semibold">-{currentPayslipData.payslip?.leave_penalty?.toLocaleString()} VND</span>
                      </div>
                      {currentPayslipData.payslip?.leave_penalty_breakdown && currentPayslipData.payslip.leave_penalty_breakdown.length > 0 && (
                        <div className="ml-4 text-xs text-gray-600 space-y-1">
                          {currentPayslipData.payslip.leave_penalty_breakdown.map((item, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>{item.leave_type} ({item.days} days, {item.penalty_percent}%)</span>
                              <span>-{item.penalty_amount?.toLocaleString()} VND</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex justify-between font-semibold border-t mt-2 pt-2">
                    <span>Total Deductions</span>
                    <span className="text-red-600">{currentPayslipData.payslip?.total_deductions?.toLocaleString()} VND</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-3 mt-2 flex justify-between items-center">
                <div className="font-semibold text-lg">
                  Net Salary: <span className="text-green-600">{currentPayslipData.payslip?.net_salary?.toLocaleString()} VND</span>
                </div>
                <button
                  onClick={() => handleDownloadPdf(selectedEmployeeId)}
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
