import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import apiClient from '../../services/apiClient';
import '../../styles/employee.css';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, [currentPage, searchTerm, filterDept]);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      setError('');

      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        department: filterDept,
      };

      const response = await apiClient.get('/employees', { params });

      setEmployees(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load employees');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await apiClient.get('/departments?limit=100');
      setDepartments(response.data.data);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    setFilterDept(e.target.value);
    setCurrentPage(1);
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this employee?')) {
      try {
        await apiClient.delete(`/employees/${id}`);
        setEmployees(employees.filter(emp => emp.id !== id));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete employee');
      }
    }
  };

  return (
    <MainLayout>
      <div className="employee-list-container">
        <div className="employee-list-header">
          <h1>Employees</h1>
          <Link to="/employees/create" className="button-primary">
            ➕ Add Employee
          </Link>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <div className="employee-filters">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={handleSearch}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <select
              value={filterDept}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.department_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading employees...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="empty-state">
            <p>No employees found</p>
          </div>
        ) : (
          <>
            <div className="employee-table-wrapper">
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Salary</th>
                    <th>Hire Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td>
                        <div className="employee-cell">
                          <div className="employee-avatar">
                            {employee.name?.[0]}
                          </div>
                          <span>{employee.name}</span>
                        </div>
                      </td>
                      <td>{employee.email}</td>
                      <td>{employee.department_name || '-'}</td>
                      <td>{employee.designation || '-'}</td>
                      <td className="salary-cell">
                        ₹{parseFloat(employee.salary).toLocaleString('en-IN')}
                      </td>
                      <td>
                        {employee.hire_date
                          ? new Date(employee.hire_date).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="action-cell">
                        <Link
                          to={`/employees/${employee.id}`}
                          className="action-btn view"
                          title="View"
                        >
                          👁️
                        </Link>
                        <Link
                          to={`/employees/${employee.id}/edit`}
                          className="action-btn edit"
                          title="Edit"
                        >
                          ✏️
                        </Link>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteEmployee(employee.id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>

              <div className="pagination-info">
                Page {currentPage} of {totalPages}
              </div>

              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default EmployeeList;