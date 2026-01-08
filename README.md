# Integration App Demo

This is a demonstration application showcasing integration capabilities using [Integration.app](https://integration.app). The app is built with Next.js and demonstrates how to implement user authentication, integration token generation, and data synchronization with external systems.

## Prerequisites

- Node.js 18+ installed
- Integration.app workspace credentials (Workspace Key and Secret)
- MongoDB database (for storing records and schemas)

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:

```bash
# Copy the sample environment file
cp .env-sample .env
```

4. Edit `.env` and add your Integration.app credentials:

```env
INTEGRATION_APP_WORKSPACE_KEY=your_workspace_key_here
INTEGRATION_APP_WORKSPACE_SECRET=your_workspace_secret_here
MONGODB_URI=your_mongodb_connection_string
```

You can find these credentials in your Integration.app workspace settings.

## Configuration

### Record Types

Default record types are defined in `src/lib/constants.ts`. You can modify this file to add or remove record types:

```typescript
export const RECORD_ACTIONS = [
	{ key: "get-orders", label: "Orders", type: "default" },
	// Add more record types as needed
];
```

## Running the Application

1. Start the development server:

```bash
npm run dev
# or
yarn dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Key Features

### Authentication

The application uses a simple authentication mechanism with a customer ID. In a production environment, you would replace this with your own authentication system.

### Integrations

The Integrations page allows users to connect to external applications using Integration.app. Once connected, you can import data from these applications.

### Forms

The Forms page allows you to create and manage custom forms with dynamic fields. You can:

- Create new form types
- Add custom fields to forms
- Delete fields from forms

### Records

The Records page displays data imported from external applications. You can:

- View records by type
- Edit records
- Delete records
- Import new records

## Project Structure

- `/src/app` - Next.js app router pages and API routes
  - `/api` - Backend API routes for records, schemas, and integration tokens
  - `/records` - Record management pages and components
  - `/forms` - Form management pages and components
  - `/integrations` - Integration connection pages
- `/src/components` - Reusable React components
- `/src/hooks` - Custom React hooks
- `/src/lib` - Utility functions and helpers
- `/src/types` - TypeScript type definitions

## API Endpoints

- `/api/records` - CRUD operations for records
- `/api/schema/[formId]/[userId]` - Form schema management
- `/api/forms` - Form definition management
- `/api/integration-token` - Integration token generation
- `/api/self` - User information
- `/api/webhooks` - Webhook endpoint for receiving record updates from external sources

## Webhook Endpoint

The `/api/webhooks` endpoint is responsible for receiving and processing record events from Integration.app. This endpoint handles incoming webhook payloads and updates the local database accordingly.

The endpoint supports three HTTP methods:

- **POST**: Create new records
- **PATCH**: Update existing records
- **DELETE**: Delete records

### POST - Create New Records

Creates a new record in the database. Returns 409 if the record already exists.

**Expected Payload Structure:**

```json
{
	"customerId": "string",
	"recordType": "string",
	"data": {
		"id": "string|number",
		"name": "string (optional)",
		"fields": {
			"field1": "value1",
			"field2": "value2"
		},
		"createdTime": "string (optional)",
		"updatedTime": "string (optional)",
		"uri": "string (optional)"
	}
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer123",
    "recordType": "get-orders",
    "data": {
      "id": "order456",
      "name": "Order #12345",
      "fields": {
        "purchaseOrder": {
          "manufacturer": "FurnitureCo",
          "po_number": "12121212"
        }
      },
      "createdTime": "2024-01-01T00:00:00Z"
    }
  }'
```

### PATCH - Update Existing Records

Updates an existing record in the database. Returns 404 if the record doesn't exist.

**Expected Payload Structure:**

```json
{
	"customerId": "string",
	"recordType": "string",
	"data": {
		"id": "string|number",
		"name": "string (optional)",
		"fields": {
			"field1": "value1",
			"field2": "value2"
		},
		"updatedTime": "string (optional)",
		"uri": "string (optional)"
	}
}
```

**Example:**

```bash
curl -X PATCH http://localhost:3000/api/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer123",
    "recordType": "get-orders",
    "data": {
      "id": "order456",
      "fields": {
        "purchaseOrder": {
          "quantity": "10"
        }
      },
      "updatedTime": "2024-01-02T00:00:00Z"
    }
  }'
```

### DELETE - Delete Records

Deletes a record from the database. Returns 404 if the record doesn't exist.

**Expected Payload Structure:**

```json
{
	"customerId": "string",
	"recordType": "string",
	"recordId": "string|number"
}
```

**Example:**

```bash
curl -X DELETE http://localhost:3000/api/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer123",
    "recordType": "get-orders",
    "recordId": "order456"
  }'
```

### Response Format

All endpoints return a JSON response with the following structure:

```json
{
	"success": true,
	"recordId": "string",
	"_id": "mongodb_object_id",
	"customerId": "string",
	"recordType": "string",
	"status": "created|updated|deleted"
}
```

### Payload Fields

- **customerId** (required): The unique identifier for the customer/tenant
- **recordType** (required): The type of record (e.g., "get-orders")
- **data** (required for POST/PATCH): The record data object
  - **id** (required): Unique identifier for the record
  - **name** (optional): Display name for the record
  - **fields** (optional): Object containing field values
  - **createdTime** (optional): ISO timestamp when the record was created
  - **updatedTime** (optional): ISO timestamp when the record was last updated
  - **uri** (optional): URI reference to the record
- **recordId** (required for DELETE): The ID of the record to delete

### Error Handling

- Returns 400 for missing required fields
- Returns 404 for records not found (PATCH/DELETE)
- Returns 409 for duplicate records (POST)
- Returns 500 for internal server errors

## Troubleshooting

- **MongoDB Connection Issues**: Ensure your MongoDB connection string is correct and the database is accessible.
- **Integration Token Errors**: Verify your Integration.app workspace credentials in the `.env` file.

## License

MIT
