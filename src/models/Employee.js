import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  empId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  empName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  empDesignation: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  empDepartment: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  empWorkLoc: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  empDateOfJoining: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  empDob: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  empCtc: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  empAadhar: {
    type: DataTypes.STRING(12),
    allowNull: false,
    validate: {
      len: [12, 12],
      isNumeric: true
    }
  },
  empPan: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      len: [10, 10],
      is: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
    }
  },
  empEmail: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  empPhone: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      len: [10, 10],
      isNumeric: true
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'employees',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'empId']
    },
    {
      unique: true,
      fields: ['userId', 'empEmail']
    },
    {
      unique: true,
      fields: ['userId', 'empPhone']
    },
    {
      unique: true,
      fields: ['userId', 'empAadhar']
    },
    {
      unique: true,
      fields: ['userId', 'empPan']
    },
    {
      fields: ['userId', 'isActive']
    },
    {
      fields: ['empDepartment']
    },
    {
      fields: ['empDesignation']
    }
  ],
  hooks: {
    beforeCreate: async (employee) => {
      if (!employee.empId) {
        const count = await Employee.count({ where: { userId: employee.userId } });
        employee.empId = `EMP${String(count + 1).padStart(4, '0')}`;
      }
      // Convert PAN to uppercase
      if (employee.empPan) {
        employee.empPan = employee.empPan.toUpperCase();
      }
      // Convert email to lowercase
      if (employee.empEmail) {
        employee.empEmail = employee.empEmail.toLowerCase();
      }
    },
    beforeUpdate: async (employee) => {
      // Convert PAN to uppercase
      if (employee.empPan) {
        employee.empPan = employee.empPan.toUpperCase();
      }
      // Convert email to lowercase
      if (employee.empEmail) {
        employee.empEmail = employee.empEmail.toLowerCase();
      }
    }
  }
});

// Instance methods for virtual fields
Employee.prototype.getAge = function() {
  if (!this.empDob) return null;
  const today = new Date();
  const birthDate = new Date(this.empDob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

Employee.prototype.getExperience = function() {
  if (!this.empDateOfJoining) return null;
  const today = new Date();
  const joinDate = new Date(this.empDateOfJoining);
  let years = today.getFullYear() - joinDate.getFullYear();
  const monthDiff = today.getMonth() - joinDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < joinDate.getDate())) {
    years--;
  }
  return years;
};

export default Employee;
