// models/Campaign.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

export const Campaign = sequelize.define('Campaign', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  businessId: { type: DataTypes.INTEGER, allowNull: false },

  // Either local templateId OR metaTemplate fields will be used:
  templateId: { type: DataTypes.INTEGER, allowNull: true },

  // NEW: Meta template details saved per campaign
  metaTemplateName: { type: DataTypes.STRING, allowNull: true },
  metaTemplateLanguage: { type: DataTypes.STRING, allowNull: true, defaultValue: 'en_US' },
  metaTemplateCategory: { type: DataTypes.STRING, allowNull: true },

  customerIds: { type: DataTypes.TEXT, allowNull: false }, // JSON array string
  scheduledAt: { type: DataTypes.DATE, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.ENUM('draft', 'scheduled', 'running', 'completed', 'paused'), defaultValue: 'draft' },
  recipientCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  stats: { type: DataTypes.JSON, allowNull: true }
}, {
  tableName: 'campaigns',
  timestamps: true
});

// Associations are unchanged
