import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

const MessageLog = sequelize.define('MessageLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  campaignId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'campaigns',
      key: 'id'
    }
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  to: {
    type: DataTypes.STRING,
    allowNull: false
  },
  waMessageId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('queued', 'sent', 'delivered', 'read', 'failed'),
    allowNull: false
  },
  error: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'message_logs',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['campaignId', 'customerId']
    }
  ]
});

export { MessageLog };