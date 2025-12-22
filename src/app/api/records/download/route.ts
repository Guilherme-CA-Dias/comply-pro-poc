import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/server-auth";
import { getIntegrationClient } from "@/lib/integration-app-client";

export async function POST(request: NextRequest) {
	try {
		const auth = getAuthFromRequest(request);
		if (!auth.customerId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { fileId } = body;

		if (!fileId) {
			return NextResponse.json(
				{ error: "File ID is required" },
				{ status: 400 }
			);
		}

		const client = await getIntegrationClient(auth);
		const connectionsResponse = await client.connections.find();
		const firstConnection = connectionsResponse.items?.[0];

		if (!firstConnection) {
			return NextResponse.json({
				success: false,
				error: "No connection found",
			});
		}

		// Run the download-file action with fileId as input
		const result = await client
			.connection(firstConnection.id)
			.action("download-file")
			.run({ fileId });

		// Extract downloadUri from the output
		const downloadUri = result.output?.downloadUri;

		if (!downloadUri) {
			return NextResponse.json(
				{ error: "No download URI found in response" },
				{ status: 500 }
			);
		}

		// Return the result with downloadUri
		return NextResponse.json({
			success: true,
			data: {
				downloadUri: downloadUri,
			},
		});
	} catch (error) {
		console.error("Error downloading file:", error);
		return NextResponse.json(
			{
				error: "Failed to download file",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
