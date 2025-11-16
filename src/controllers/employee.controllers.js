import Employee from '../models/Employee.js';
import { Op } from 'sequelize';

// Create Employee
export const createEmployee = async (req, res) => {
    try {
        const {
            empName,
            empDesignation,
            empDepartment,
            empWorkLoc,
            empDateOfJoining,
            empDob,
            empCtc,
            empAadhar,
            empPan,
            empEmail,
            empPhone
        } = req.body;

        // Validation
        if (!empName || !empDesignation || !empDepartment || !empWorkLoc || 
            !empDateOfJoining || !empDob || !empCtc || !empAadhar || 
            !empPan || !empEmail || !empPhone) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Check if employee with same email, phone, aadhar, or pan already exists for this user
        const existingEmployee = await Employee.findOne({
            where: {
                userId: req.user.id,
                [Op.or]: [
                    { empEmail: empEmail.toLowerCase() },
                    { empPhone },
                    { empAadhar },
                    { empPan: empPan.toUpperCase() }
                ]
            }
        });

        if (existingEmployee) {
            return res.status(400).json({
                success: false,
                message: "Employee with this email, phone, Aadhar, or PAN already exists"
            });
        }

        const employee = await Employee.create({
            userId: req.user.id,
            empName,
            empDesignation,
            empDepartment,
            empWorkLoc,
            empDateOfJoining,
            empDob,
            empCtc: parseFloat(empCtc),
            empAadhar,
            empPan: empPan.toUpperCase(),
            empEmail: empEmail.toLowerCase(),
            empPhone
        });

        res.status(201).json({
            success: true,
            data: employee,
            message: "Employee created successfully"
        });
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get All Employees
export const getAllEmployees = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, department, designation, isActive } = req.query;
        
        const whereClause = { userId: req.user.id };
        
        // Add search functionality
        if (search) {
            whereClause[Op.or] = [
                { empName: { [Op.like]: `%${search}%` } },
                { empId: { [Op.like]: `%${search}%` } },
                { empEmail: { [Op.like]: `%${search}%` } },
                { empPhone: { [Op.like]: `%${search}%` } }
            ];
        }
        
        // Add filters
        if (department) {
            whereClause.empDepartment = { [Op.like]: `%${department}%` };
        }
        
        if (designation) {
            whereClause.empDesignation = { [Op.like]: `%${designation}%` };
        }
        
        if (isActive !== undefined) {
            whereClause.isActive = isActive === 'true';
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: employees } = await Employee.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                employees,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / parseInt(limit)),
                    totalEmployees: count,
                    hasNext: parseInt(page) < Math.ceil(count / parseInt(limit)),
                    hasPrev: parseInt(page) > 1
                }
            },
            message: "Employees retrieved successfully"
        });
    } catch (error) {
        console.error('Error getting employees:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get Employee by ID
export const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await Employee.findOne({
            where: {
                id: id,
                userId: req.user.id
            }
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        res.json({
            success: true,
            data: employee,
            message: "Employee retrieved successfully"
        });
    } catch (error) {
        console.error('Error getting employee:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Update Employee
export const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            empName,
            empDesignation,
            empDepartment,
            empWorkLoc,
            empDateOfJoining,
            empDob,
            empCtc,
            empAadhar,
            empPan,
            empEmail,
            empPhone,
            isActive
        } = req.body;

        const employee = await Employee.findOne({
            where: {
                id: id,
                userId: req.user.id
            }
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        // Check for duplicate email, phone, aadhar, or pan (excluding current employee)
        if (empEmail || empPhone || empAadhar || empPan) {
            const duplicateWhere = {
                userId: req.user.id,
                id: { [Op.ne]: id },
                [Op.or]: []
            };

            if (empEmail) duplicateWhere[Op.or].push({ empEmail: empEmail.toLowerCase() });
            if (empPhone) duplicateWhere[Op.or].push({ empPhone });
            if (empAadhar) duplicateWhere[Op.or].push({ empAadhar });
            if (empPan) duplicateWhere[Op.or].push({ empPan: empPan.toUpperCase() });

            if (duplicateWhere[Op.or].length > 0) {
                const existingEmployee = await Employee.findOne({ where: duplicateWhere });
                if (existingEmployee) {
                    return res.status(400).json({
                        success: false,
                        message: "Employee with this email, phone, Aadhar, or PAN already exists"
                    });
                }
            }
        }

        // Update fields
        const updateData = {};
        if (empName) updateData.empName = empName;
        if (empDesignation) updateData.empDesignation = empDesignation;
        if (empDepartment) updateData.empDepartment = empDepartment;
        if (empWorkLoc) updateData.empWorkLoc = empWorkLoc;
        if (empDateOfJoining) updateData.empDateOfJoining = empDateOfJoining;
        if (empDob) updateData.empDob = empDob;
        if (empCtc) updateData.empCtc = parseFloat(empCtc);
        if (empAadhar) updateData.empAadhar = empAadhar;
        if (empPan) updateData.empPan = empPan.toUpperCase();
        if (empEmail) updateData.empEmail = empEmail.toLowerCase();
        if (empPhone) updateData.empPhone = empPhone;
        if (isActive !== undefined) updateData.isActive = isActive;

        const updatedEmployee = await employee.update(updateData);

        res.json({
            success: true,
            data: updatedEmployee,
            message: "Employee updated successfully"
        });
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Delete Employee
export const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await Employee.findOne({
            where: {
                id: id,
                userId: req.user.id
            }
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        await employee.destroy();

        res.json({
            success: true,
            message: "Employee deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get Employee Statistics
export const getEmployeeStats = async (req, res) => {
    try {
        const stats = await Employee.findAll({
            where: { userId: req.user.id },
            attributes: [
                [Employee.sequelize.fn('COUNT', Employee.sequelize.col('id')), 'totalEmployees'],
                [Employee.sequelize.fn('COUNT', Employee.sequelize.literal('CASE WHEN isActive = true THEN 1 END')), 'activeEmployees'],
                [Employee.sequelize.fn('COUNT', Employee.sequelize.literal('CASE WHEN isActive = false THEN 1 END')), 'inactiveEmployees'],
                [Employee.sequelize.fn('AVG', Employee.sequelize.col('empCtc')), 'avgCTC'],
                [Employee.sequelize.fn('SUM', Employee.sequelize.col('empCtc')), 'totalCTC']
            ],
            raw: true
        });

        const departmentStats = await Employee.findAll({
            where: { 
                userId: req.user.id,
                isActive: true 
            },
            attributes: [
                'empDepartment',
                [Employee.sequelize.fn('COUNT', Employee.sequelize.col('id')), 'count']
            ],
            group: ['empDepartment'],
            order: [[Employee.sequelize.literal('count'), 'DESC']],
            raw: true
        });

        const designationStats = await Employee.findAll({
            where: { 
                userId: req.user.id,
                isActive: true 
            },
            attributes: [
                'empDesignation',
                [Employee.sequelize.fn('COUNT', Employee.sequelize.col('id')), 'count']
            ],
            group: ['empDesignation'],
            order: [[Employee.sequelize.literal('count'), 'DESC']],
            raw: true
        });

        res.json({
            success: true,
            data: {
                overview: stats[0] || {
                    totalEmployees: 0,
                    activeEmployees: 0,
                    inactiveEmployees: 0,
                    avgCTC: 0,
                    totalCTC: 0
                },
                departmentStats,
                designationStats
            },
            message: "Employee statistics retrieved successfully"
        });
    } catch (error) {
        console.error('Error getting employee stats:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Bulk Import Employees
export const bulkImportEmployees = async (req, res) => {
    try {
        const { employees } = req.body;

        if (!employees || !Array.isArray(employees) || employees.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Employees array is required"
            });
        }

        const results = {
            success: [],
            errors: []
        };

        for (let i = 0; i < employees.length; i++) {
            const emp = employees[i];
            try {
                // Validate required fields
                if (!emp.empName || !emp.empDesignation || !emp.empDepartment || 
                    !emp.empWorkLoc || !emp.empDateOfJoining || !emp.empDob || 
                    !emp.empCtc || !emp.empAadhar || !emp.empPan || 
                    !emp.empEmail || !emp.empPhone) {
                    results.errors.push({
                        row: i + 1,
                        error: "Missing required fields"
                    });
                    continue;
                }

                // Check for duplicates
                const existingEmployee = await Employee.findOne({
                    where: {
                        userId: req.user.id,
                        [Op.or]: [
                            { empEmail: emp.empEmail.toLowerCase() },
                            { empPhone: emp.empPhone },
                            { empAadhar: emp.empAadhar },
                            { empPan: emp.empPan.toUpperCase() }
                        ]
                    }
                });

                if (existingEmployee) {
                    results.errors.push({
                        row: i + 1,
                        error: "Employee with this email, phone, Aadhar, or PAN already exists"
                    });
                    continue;
                }

                const employee = await Employee.create({
                    userId: req.user.id,
                    empName: emp.empName,
                    empDesignation: emp.empDesignation,
                    empDepartment: emp.empDepartment,
                    empWorkLoc: emp.empWorkLoc,
                    empDateOfJoining: emp.empDateOfJoining,
                    empDob: emp.empDob,
                    empCtc: parseFloat(emp.empCtc),
                    empAadhar: emp.empAadhar,
                    empPan: emp.empPan.toUpperCase(),
                    empEmail: emp.empEmail.toLowerCase(),
                    empPhone: emp.empPhone
                });

                results.success.push(employee);
            } catch (error) {
                results.errors.push({
                    row: i + 1,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            data: results,
            message: `Bulk import completed. ${results.success.length} successful, ${results.errors.length} errors`
        });
    } catch (error) {
        console.error('Error bulk importing employees:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};