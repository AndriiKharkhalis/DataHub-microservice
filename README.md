# DataHub Microservice

## Overview

The DataHub Microservice is a Node.js application built with TypeScript. It provides APIs for managing orders, handling external integrations, and processing business logic. The architecture follows a modular design with clear separation of concerns.

## Architecture

### Key Layers

1. API Layer (routes):

- Handles HTTP requests and responses.
- Key File: OrderRoutes.ts.

2. Controller Layer (controllers):

- Processes input and delegates business logic to services.
- Key File: OrderController.ts.

3. Service Layer (services):

- Implements business logic and interacts with repositories.
- Key Files: OrderService.ts, ExternalOrderHandler.ts.

4. Repository Layer (repositories):

- Manages data persistence and retrieval.
- Key Files: OrderRepository.ts, FailedOrderRepository.ts.

5. Domain Layer (domain):

- Defines core business entities and types.

6. Schema Layer (schemas):

- Validates incoming data structures.

7. Utility Layer (utils):

- Provides reusable utilities like logging.

8. Database

- PostgreSQL with Prisma ORM

## Endpoints

1. POST /orders

- Description: Queues a new order for processing.
- Request Body:

```json
{
  "orderId": "123456",
  "customer": { "id": "cust_001", "email": "customer@example.com" },
  "items": [
    { "sku": "sku_001", "quantity": 2, "price": 49.99 },
    { "sku": "sku_002", "quantity": 1, "price": 19.99 }
  ],
  "createdAt": "2025-03-26T10:30:00Z"
}
```

- Response:

```json
{ "message": "Order received and queued" }
```

- Status Codes:
  200: Order successfully queued.
  500: Internal server error.

2. GET /orders

- Description: Retrieves orders for a specific customer.
- Query Parameters:
  customerId (string, required): The ID of the customer.
- Response:

```json
{
  "data": [
    {
      "id": "1",
      "orderId": "123456",
      "customerId": "cust_001",
      "email": "customer@example.com",
      "totalItems": 3,
      "totalAmount": 119.97,
      "createdAt": "2025-03-26T10:30:00Z"
    }
  ]
}
```

- Status Codes:
  200: Orders retrieved successfully.
  400: Invalid customerId.
  500: Internal server error.

## ExternalOrderHandler Methods

1. handleOrder(req: HandleOrderRequest): Promise<void>
   - Description: Sends an order to the RabbitMQ queue for processing.
   - Parameters:
     req: Contains the order to be queued.
   - Behavior:
     Serializes the order and sends it to the RabbitMQ queue.
   - Logs errors if the operation fails.
2. consumeEvent(): Promise<void>
   - Description: Consumes messages from the RabbitMQ queue.
   - Behavior:
   - Parses the message and transforms the order.
   - Saves the order to the database via OrderRepository.
   - Logs and stores failed orders with error in FailedOrderRepository.

# How to Run

1. Clone the repository to your local machine:

```bash
   git clone https://github.com/AndriiKharkhalis/DataHub-microservice.git
   cd datahub-microservice
```

2. Set Up the .env File
   Create a .env file in the root of the project and configure the following environment variables:

```bash
PORT= (by default is setted to 3000)
DATABASE_URL=postgresql://...
RABBITMQ_URL=amqps://...
RABBITMQ_QUEUE=
```

DATABASE_URL: Replace localhost with host.docker.internal if running the database on the host machine and the app inside Docker.
RABBITMQ_URL: Use your CloudAMQP URL or the URL of your RabbitMQ instance.
RABBITMQ_QUEUE: Set the name of the RabbitMQ queue.

3. Build and Run the Application
   Run the following commands to build and start the application using Docker Compose:

```bash
docker-compose build
docker-compose up
```

4.  Access the Application
    The application will be available at:

```bash
http://localhost:3000
```

Endpoints:

```bash
POST /orders: Queue a new order for processing.
GET /orders: Retrieve orders for a specific customer.
```
