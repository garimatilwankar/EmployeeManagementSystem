import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import apiClient from '../../services/apiClient';
import '../../styles/employee.css';

const EmployeeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    departmentId: '',
    phone: '',
    address: '',
    designation: '',
    salary: '',
    hireDate: '',
    managerId: '',
  });

  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    fetchDepartments();
    fetchManagers();

    if (isEditMode) {
      fetchEmployee();
    } else {
      setIsLoading(false);
    }
  }, [id, isEditMode]);

  const fetchDepartments = async () => {
    try {
      const response = await apiClient.get('/departments?limit=100');
      setDepartments(response.data.data);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await apiClient.get('/employees?limit=100');
      // Filter for manager role
      const managersList = response.data.data.filter(emp => emp.role === 'manager');
      setManagers(managersList);
    } catch (err) {
      console.error('Failed to fetch managers:', err);
    }
  };

  const fetchEmployee = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/employees/${id}`);
      const employee = response.data.data;

      setFormData({
        departmentId: employee.department_id || '',
        phone: employee.phone || '',
        address: employee.address || '',
        designation: employee.designation || '',
        salary: employee.salary || '',
        hireDate: employee.hire_date ? employee.hire_date.split('T')[0] : '',
        managerId: employee.manager_id || '',
      });
    } catch (err) {
      setError('Failed to load employee details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.departmentId) {
      errors.departmentId = 'Department is required';
    }

    if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
      errors.phone = 'Valid 10-digit phone is required';
    }

    if (!formData.address) {
      errors.address = 'Address is required';
    }

    if (!formData.designation) {
      errors.designation = 'Designation is required';
    }

    if (!formData.salary || parseFloat(formData.salary) <= 0) {
      errors.salary = 'Valid salary is required';
    }

    if (!formData.hireDate) {
      errors.hireDate = 'Hire date is required';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setIsSaving(true);

      if (isEditMode) {
        await apiClient.put(`/employees/${id}`, {
          departmentId: parseInt(formData.departmentId),
          phone: formData.phone,
          address: formData.address,
          designation: formData.designation,
          salary: parseFloat(formData.salary),
          managerId: formData.managerId ? parseInt(formData.managerId) : null,
        });
      } else {
        // For create, you would need userId
        await apiClient.post('/employees', {
          userId: 0, // This should come from user selection
          departmentId: parseInt(formData.departmentId),
          phone: formData.phone,
          address: formData.address,
          designation: formData.designation,
          salary: parseFloat(formData.salary),
          hireDate: formData.hireDate,
          managerId: formData.managerId ? parseInt(formData.managerId) : null,
        });
      }

      navigate('/employees');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save employee');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="employee-form-container">
        <div className="form-header">
          <h1>{isEditMode ? 'Edit Employee' : 'Add New Employee'}</h1>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="employee-form">
          <div className="form-section">
            <h2>Employee Details</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="departmentId">Department *</label>
                <select
                  id="departmentId"
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  disabled={isSaving}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.department_name}
                    </option>
                  ))}
                </select>
                {fieldErrors.departmentId && (
                  <span className="error">{fieldErrors.departmentId}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="designation">Designation *</label>
                <input
                  type="text"
                  id="designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="e.g., React Developer"
                  disabled={isSaving}
                />
                {fieldErrors.designation && (
                  <span className="error">{fieldErrors.designation}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit phone number"
                  maxLength="10"
                  disabled={isSaving}
                />
                {fieldErrors.phone && (
                  <span className="error">{fieldErrors.phone}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="salary">Salary *</label>
                <input
                  type="number"
                  id="salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="Annual salary"
                  min="0"
                  step="1000"
                  disabled={isSaving}
                />
                {fieldErrors.salary && (
                  <span className="error">{fieldErrors.salary}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Address *</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter full address"
                rows="3"
                disabled={isSaving}
              />
              {fieldErrors.address && (
                <span className="error">{fieldErrors.address}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="hireDate">Hire Date *</label>
                <input
                  type="date"
                  id="hireDate"
                  name="hireDate"
                  value={formData.hireDate}
                  onChange={handleChange}
                  disabled={isSaving || isEditMode}
                />
                {fieldErrors.hireDate && (
                  <span className="error">{fieldErrors.hireDate}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="managerId">Reporting Manager</label>
                <select
                  id="managerId"
                  name="managerId"
                  value={formData.managerId}
                  onChange={handleChange}
                  disabled={isSaving}
                >
                  <option value="">No Manager</option>
                  {managers.map(manager => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="button-primary"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : isEditMode ? 'Update Employee' : 'Create Employee'}
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={() => navigate('/employees')}
              disabled={isSaving}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default EmployeeForm;