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
	{ key: "get-accounts", label: "Accounts", type: "default" },
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

### Submit Form

The Submit Form page allows users to submit data through custom forms. The submitted data is sent to the appropriate webhook URL based on the form type.

## Project Structure

- `/src/app` - Next.js app router pages and API routes
  - `/api` - Backend API routes for records, schemas, and integration tokens
  - `/records` - Record management pages and components
  - `/forms` - Form management pages and components
  - `/integrations` - Integration connection pages
  - `/submit-form` - Form submission page
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

The `/api/webhooks` endpoint is responsible for receiving and processing record updates from Integration.app. This endpoint handles incoming webhook payloads and updates the local database accordingly.

### Expected Payload Structure

External sources should send POST requests to `/api/webhooks` with the following payload structure:

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
		"additional_fields": "any"
	}
}
```

### Payload Fields

- **customerId** (required): The unique identifier for the customer/tenant
- **recordType** (required): The type of record (e.g., "files", "folders", "companies")
- **data** (required): The record data object
  - **id** (required): Unique identifier for the record
  - **name** (optional): Display name for the record
  - **fields** (optional): Object containing field values
  - **createdTime** (optional): ISO timestamp when the record was created
  - **updatedTime** (optional): ISO timestamp when the record was last updated
  - Additional fields can be included as needed

### Response Format

The endpoint returns a JSON response with the following structure:

```json
{
	"success": true,
	"recordId": "string",
	"_id": "mongodb_object_id",
	"customerId": "string",
	"recordType": "string",
	"status": "created|updated|unchanged"
}
```

### Behavior

- **New Records**: If a record with the given `id` and `customerId` doesn't exist, it will be created
- **Existing Records**: If a record exists, it will be updated only if the data has changed
- **Duplicate Prevention**: The endpoint compares existing data with new data to avoid unnecessary updates
- **Error Handling**: Returns appropriate HTTP status codes and error messages for invalid payloads

### Example Usage

```bash
curl -X POST http://localhost:3000/api/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer123",
    "recordType": "files",
    "data": {
      "id": "contact456",
      "name": "John Doe",
      "fields": {
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "createdTime": "2024-01-01T00:00:00Z"
    }
  }'
```

## Troubleshooting

- **MongoDB Connection Issues**: Ensure your MongoDB connection string is correct and the database is accessible.
- **Integration Token Errors**: Verify your Integration.app workspace credentials in the `.env` file.

## License

MIT
