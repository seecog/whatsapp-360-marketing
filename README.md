# Bulk-whatsapp-Manager-Backend

A Node.js backend application for bulk WhatsApp messaging using MySQL database and WhatsApp Cloud API.

## Features

- **User Authentication**: JWT-based auth with refresh tokens
- **Business Management**: Create and manage business profiles
- **Customer Management**: Store and organize customer contacts
- **Template Management**: Create and manage WhatsApp message templates
- **Campaign Management**: Schedule and send bulk WhatsApp campaigns
- **Webhook Integration**: Handle WhatsApp delivery status updates
- **API Documentation**: Swagger UI for interactive API testing

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Job Queue**: Agenda.js for scheduled tasks
- **API Documentation**: Swagger UI
- **WhatsApp Integration**: Meta WhatsApp Cloud API

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- WhatsApp Business Account with Cloud API access

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Bulk-whatsapp-Manager-Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create MySQL database:
```sql
CREATE DATABASE BulkWhatsappMessenger;
```

4. Create `.env` file with the following variables:
```env
# Server Configuration
PORT=3000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development

# Database Configuration
DB_NAME=BulkWhatsappMessenger

# JWT Configuration
JWT_ACCESS_SECRET=your_access_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
ACCESS_TOKEN_TTL=60m
REFRESH_TOKEN_TTL=7d

# WhatsApp/Meta Configuration
META_GRAPH_VERSION=v20.0
WHATSAPP_TOKEN=your_whatsapp_token
WA_PHONE_NUMBER_ID=your_phone_number_id
WABA_ID=your_waba_id
WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token

# Optional: Encryption
TOKEN_ENC_SECRET=your_32_byte_base64_encryption_key
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:3000/api-docs`
- **Health Check**: `http://localhost:3000/api/v1/health`

### Authentication in Swagger

1. Click the "Authorize" button in Swagger UI
2. Enter your JWT token in the format: `Bearer <your_access_token>`
3. Click "Authorize" to authenticate requests

## API Endpoints

### Authentication
- `POST /api/v1/users/register` - Register new user
- `POST /api/v1/users/login` - User login
- `POST /api/v1/users/refresh` - Refresh access token
- `POST /api/v1/users/logout` - User logout

### Business Management
- `POST /api/v1/business/create-business` - Create business
- `GET /api/v1/business/get-my-business` - Get user's business
- `PATCH /api/v1/business/update-business/:id` - Update business
- `DELETE /api/v1/business/delete-business/:id` - Delete business

### Customer Management
- `POST /api/v1/customers` - Add/update customer
- `GET /api/v1/customers` - List customers

### Template Management
- `POST /api/v1/templates/meta` - Create template at Meta
- `GET /api/v1/templates/meta` - List Meta templates
- `POST /api/v1/templates` - Save verified template locally
- `GET /api/v1/templates` - List local templates

### Campaign Management
- `POST /api/v1/campaigns` - Create campaign
- `GET /api/v1/campaigns` - List campaigns

### Webhook
- `GET /api/v1/webhook` - Webhook verification
- `POST /api/v1/webhook` - Receive webhook events

## Database Schema

The application uses the following MySQL tables:
- `users` - User accounts and authentication
- `businesses` - Business profiles
- `customers` - Customer contacts
- `templates` - WhatsApp message templates
- `campaigns` - Messaging campaigns
- `message_logs` - Message delivery logs

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3000) |
| `CORS_ORIGIN` | CORS allowed origin | Yes |
| `DB_NAME` | MySQL database name | Yes |
| `JWT_ACCESS_SECRET` | JWT access token secret | Yes |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | Yes |
| `WHATSAPP_TOKEN` | WhatsApp Cloud API token | Yes |
| `WA_PHONE_NUMBER_ID` | WhatsApp phone number ID | Yes |
| `WABA_ID` | WhatsApp Business Account ID | Yes |
| `WEBHOOK_VERIFY_TOKEN` | Webhook verification token | Yes |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC License