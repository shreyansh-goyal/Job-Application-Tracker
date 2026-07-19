const swaggerJsDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Job application tracker",
      version: "1.0.0",
      description: "API documentation for job application tracker",
    },
    servers: [
      {
        url: "http://localhost:3000",
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
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "60d21b4667d0d8992e610c85" },
            name: { type: "string", example: "john" },
            email: { type: "string", format: "email", example: "john@gmail.com" },
            password: { type: "string", example: "$2a$10$..." },
            refreshToken: { type: "string", nullable: true, example: null },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Job: {
          type: "object",
          properties: {
            _id: { type: "string", example: "60d21b4667d0d8992e610c86" },
            role: { type: "string", example: "Software Engineer" },
            companyName: { type: "string", example: "Tech Corp" },
            status: {
              type: "string",
              enum: ["applied", "interview", "offer", "rejected"],
              example: "applied",
            },
            notes: { type: "string", example: "Applied via LinkedIn" },
            userId: { type: "string", example: "60d21b4667d0d8992e610c85" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string", example: "Error message" },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            totalJobs: { type: "integer", example: 50 },
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 10 },
            totalPages: { type: "integer", example: 5 },
            hasNextPage: { type: "boolean", example: true },
            hasPreviousPage: { type: "boolean", example: false },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

module.exports = swaggerJsDoc(options);
