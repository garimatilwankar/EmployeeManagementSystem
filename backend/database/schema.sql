-- Create Extension for UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'employee' CHECK (role IN ('admin', 'hr', 'manager', 'employee')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Employee Profiles Table
CREATE TABLE IF NOT EXISTS employee_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    department_id INT NOT NULL REFERENCES departments(id),
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    designation VARCHAR(100) NOT NULL,
    salary NUMERIC(12, 2) NOT NULL CHECK (salary > 0),
    hire_date DATE NOT NULL,
    manager_id INT REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Skills Master Table
CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    skill_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Employee Skills (Many-to-Many) Table
CREATE TABLE IF NOT EXISTS employee_skills (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
    skill_id INT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(50) DEFAULT 'intermediate' CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, skill_id)
);

-- 6. Employee Images Table
CREATE TABLE IF NOT EXISTS employee_images (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type VARCHAR(50) DEFAULT 'profile' CHECK (image_type IN ('profile', 'aadhar', 'resume', 'certificate', 'other')),
    uploaded_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Leave Types Table
CREATE TABLE IF NOT EXISTS leave_types (
    id SERIAL PRIMARY KEY,
    leave_name VARCHAR(100) NOT NULL UNIQUE,
    total_days INT NOT NULL CHECK (total_days > 0),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Leave Balance Table
CREATE TABLE IF NOT EXISTS leave_balance (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
    leave_type_id INT NOT NULL REFERENCES leave_types(id),
    available_days INT NOT NULL CHECK (available_days >= 0),
    used_days INT DEFAULT 0,
    year INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, leave_type_id, year)
);

-- 9. Leave Applications Table
CREATE TABLE IF NOT EXISTS leave_applications (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
    leave_type_id INT NOT NULL REFERENCES leave_types(id),
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    total_days INT NOT NULL CHECK (total_days > 0),
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT date_check CHECK (from_date <= to_date)
);

-- 10. Approval History Table
CREATE TABLE IF NOT EXISTS approval_history (
    id SERIAL PRIMARY KEY,
    leave_id INT NOT NULL REFERENCES leave_applications(id) ON DELETE CASCADE,
    approved_by INT NOT NULL REFERENCES users(id),
    action VARCHAR(50) NOT NULL CHECK (action IN ('pending', 'approved', 'rejected')),
    approval_level VARCHAR(50) NOT NULL CHECK (approval_level IN ('manager', 'hr', 'admin')),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Assets Table
CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    asset_code VARCHAR(50) NOT NULL UNIQUE,
    asset_name VARCHAR(200) NOT NULL,
    asset_type VARCHAR(100) NOT NULL,
    purchase_date DATE NOT NULL,
    purchase_cost NUMERIC(12, 2) NOT NULL CHECK (purchase_cost > 0),
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'allocated', 'damaged', 'lost', 'disposed')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Asset Allocations Table
CREATE TABLE IF NOT EXISTS asset_allocations (
    id SERIAL PRIMARY KEY,
    asset_id INT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    employee_id INT NOT NULL REFERENCES employee_profiles(id),
    allocated_by INT NOT NULL REFERENCES users(id),
    allocated_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(50) DEFAULT 'allocated' CHECK (status IN ('allocated', 'returned', 'damaged', 'lost')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Asset History Table
CREATE TABLE IF NOT EXISTS asset_history (
    id SERIAL PRIMARY KEY,
    asset_id INT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    remarks TEXT,
    created_by INT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general' CHECK (type IN ('leave', 'asset', 'approval', 'system', 'general')),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('insert', 'update', 'delete')),
    record_id INT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    performed_by INT NOT NULL REFERENCES users(id),
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_employee_profiles_user_id ON employee_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_employee_profiles_department_id ON employee_profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_employee_skills_employee_id ON employee_skills(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_skills_skill_id ON employee_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_employee_images_employee_id ON employee_images(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_balance_employee_id ON leave_balance(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_applications_employee_id ON leave_applications(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_applications_status ON leave_applications(status);
CREATE INDEX IF NOT EXISTS idx_approval_history_leave_id ON approval_history(leave_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_asset_allocations_asset_id ON asset_allocations(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_allocations_employee_id ON asset_allocations(employee_id);
CREATE INDEX IF NOT EXISTS idx_asset_history_asset_id ON asset_history(asset_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_by ON audit_logs(performed_by);

-- Create Views
CREATE OR REPLACE VIEW employee_summary AS
SELECT
    u.id,
    u.name,
    u.email,
    u.role,
    d.department_name,
    ep.designation,
    ep.salary,
    ep.hire_date,
    ep.phone
FROM users u
INNER JOIN employee_profiles ep ON u.id = ep.user_id
INNER JOIN departments d ON ep.department_id = d.id
WHERE u.role != 'admin';

CREATE OR REPLACE VIEW leave_summary_view AS
SELECT
    u.name AS employee_name,
    lt.leave_name,
    lb.available_days,
    lb.used_days,
    (lb.available_days - lb.used_days) AS remaining_days,
    lb.year
FROM leave_balance lb
INNER JOIN employee_profiles ep ON lb.employee_id = ep.id
INNER JOIN users u ON ep.user_id = u.id
INNER JOIN leave_types lt ON lb.leave_type_id = lt.id;

CREATE OR REPLACE VIEW asset_summary_view AS
SELECT
    a.asset_code,
    a.asset_name,
    a.asset_type,
    a.status,
    u.name AS assigned_to,
    aa.allocated_date
FROM assets a
LEFT JOIN asset_allocations aa ON a.id = aa.asset_id AND aa.status = 'allocated'
LEFT JOIN employee_profiles ep ON aa.employee_id = ep.id
LEFT JOIN users u ON ep.user_id = u.id;