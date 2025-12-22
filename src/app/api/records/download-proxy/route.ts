import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
	try {
		const auth = getAuthFromRequest(request);
		if (!auth.customerId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const searchParams = request.nextUrl.searchParams;
		const downloadUri = searchParams.get("uri");

		if (!downloadUri) {
			return NextResponse.json(
				{ error: "Download URI is required" },
				{ status: 400 }
			);
		}

		// Fetch the file from S3 (server-side, no CORS issues)
		const response = await fetch(downloadUri, {
			method: "GET",
		});

		if (!response.ok) {
			return NextResponse.json(
				{ error: `Failed to fetch file: ${response.statusText}` },
				{ status: response.status }
			);
		}

		// Get the file as a blob
		const blob = await response.blob();

		// Get the content type from the response
		const contentType = response.headers.get("content-type") || "application/octet-stream";

		// Get filename from Content-Disposition header if available
		const contentDisposition = response.headers.get("content-disposition");
		let filename = "download";
		if (contentDisposition) {
			const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
			if (fileNameMatch && fileNameMatch[1]) {
				filename = fileNameMatch[1].replace(/['"]/g, "");
			}
		}

		// Convert blob to array buffer for streaming
		const arrayBuffer = await blob.arrayBuffer();

		// Return the file with proper headers
		return new NextResponse(arrayBuffer, {
			headers: {
				"Content-Type": contentType,
				"Content-Disposition": `attachment; filename="${filename}"`,
				"Content-Length": arrayBuffer.byteLength.toString(),
			},
		});
	} catch (error) {
		console.error("Error proxying download:", error);
		return NextResponse.json(
			{
				error: "Failed to download file",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

