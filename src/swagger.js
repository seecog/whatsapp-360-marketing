import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "Bulk WhatsApp Manager API",
    version: "1.0.0",
    description:
      "API documentation for Bulk WhatsApp Manager Backend. Includes auth, business, customers, templates, campaigns and webhook endpoints.",
  },
  servers: [
    {
      url: "http://localhost:" + (process.env.PORT || 3000),
      description: "Local server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ApiResponse: {
        type: "object",
        properties: {
          statusCode: { type: "number" },
          success: { type: "boolean" },
          message: { type: "string" },
          data: {},
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", example: "user@example.com" },
          password: { type: "string", example: "secret123" },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["firstName", "lastName", "phoneNo", "email", "password"],
        properties: {
          firstName: { type: "string" },
          lastName: { type: "string" },
          phoneNo: { type: "string", example: "+919999999999" },
          email: { type: "string" },
          password: { type: "string" },
        },
      },
      Customer: {
        type: "object",
        properties: {
          name: { type: "string" },
          phoneE164: { type: "string", example: "+919999999999" },
          tags: { type: "array", items: { type: "string" } },
          consentAt: { type: "string", format: "date-time" },
        },
      },
      TemplateSaveRequest: {
        type: "object",
        required: ["waName", "language", "category"],
        properties: {
          waName: { type: "string" },
          language: { type: "string", example: "en_US" },
          category: { type: "string", example: "marketing" },
          displayName: { type: "string" },
        },
      },
      CampaignCreateRequest: {
        type: "object",
        required: ["templateId", "scheduledAt"],
        properties: {
          templateId: { type: "string" },
          scheduledAt: { type: "string", format: "date-time" },
          filters: {
            type: "object",
            properties: { tags: { type: "array", items: { type: "string" } } },
          },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/api/v1/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: { 200: { description: "OK" } },
      },
    },
    "/api/v1/users/register": {
      post: {
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterRequest" } } },
        },
        responses: { 200: { description: "Registered" }, 400: { description: "Bad request" } },
      },
    },
    "/api/v1/users/login": {
      post: {
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } },
        },
        responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } },
      },
    },
    "/api/v1/users/refresh": {
      post: {
        tags: ["Auth"],
        requestBody: {
          required: false,
          content: { "application/json": { schema: { type: "object", properties: { refreshToken: { type: "string" } } } } },
        },
        responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } },
      },
    },
    "/api/v1/users/logout": {
      post: {
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } },
      },
    },
    "/api/v1/customers": {
      get: {
        tags: ["Customers"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "tag", schema: { type: "string" }, required: false },
        ],
        responses: { 200: { description: "List customers" } },
      },
      post: {
        tags: ["Customers"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/Customer" } } },
        },
        responses: { 201: { description: "Created/Upserted" } },
      },
    },
    "/api/v1/templates": {
      get: {
        tags: ["Templates"],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "List local templates" } },
      },
      post: {
        tags: ["Templates"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/TemplateSaveRequest" } } },
        },
        responses: { 201: { description: "Saved" } },
      },
    },
    "/api/v1/templates/meta": {
      get: {
        tags: ["Templates"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "name", schema: { type: "string" }, required: false },
        ],
        responses: { 200: { description: "Meta templates" } },
      },
      post: {
        tags: ["Templates"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: { 201: { description: "Created at Meta" } },
      },
    },
    "/api/v1/templates/meta/all": {
      get: {
        tags: ["Templates"],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "All Meta templates" } },
      },
    },
    "/api/v1/campaigns": {
      get: {
        tags: ["Campaigns"],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "List campaigns" } },
      },
      post: {
        tags: ["Campaigns"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CampaignCreateRequest" } } },
        },
        responses: { 201: { description: "Scheduled" } },
      },
    },
    "/api/v1/webhook": {
      get: {
        tags: ["Webhook"],
        summary: "Verify webhook (Meta)",
        parameters: [
          { in: "query", name: "hub.mode", schema: { type: "string" } },
          { in: "query", name: "hub.verify_token", schema: { type: "string" } },
          { in: "query", name: "hub.challenge", schema: { type: "string" } },
        ],
        responses: { 200: { description: "Verified" }, 403: { description: "Forbidden" } },
      },
      post: {
        tags: ["Webhook"],
        summary: "Receive webhook events (Meta)",
        requestBody: { required: true },
        responses: { 200: { description: "OK" } },
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: [],
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}


