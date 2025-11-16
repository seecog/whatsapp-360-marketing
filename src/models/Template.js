import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

const Template = sequelize.define('Template', {
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
  waName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  language: {
    type: DataTypes.STRING,
    defaultValue: 'en_US'
  },
  category: {
    type: DataTypes.ENUM('marketing', 'utility', 'authentication'),
    allowNull: false
  },
  components: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  htmlContent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Rich HTML content for the template'
  }
}, {
  tableName: 'templates',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'waName']
    }
  ]
});

export { Template };