import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Record } from '@/models/record';
import { RecordActionKey } from '@/lib/constants';

interface WebhookPayload {
  customerId: string;
  recordType: RecordActionKey;
  data: {
    id: string | number;
    name?: string;
    fields?: {
      [key: string]: any;
    };
    createdTime?: string;
    updatedTime?: string;
    // Any other fields that might come
    [key: string]: any;
  };
}

// POST: Receive new records
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json() as WebhookPayload;
    console.log('Received new record webhook:', {
      customerId: payload.customerId,
      recordId: payload.data.id,
      recordType: payload.recordType
    });

    await connectToDatabase();

    // Ensure we have the required fields
    if (!payload.customerId || !payload.data.id || !payload.recordType) {
      return NextResponse.json(
        { error: 'Missing required fields: customerId, data.id, and recordType are required' },
        { status: 400 }
      );
    }

    // Check if record already exists
    const existingRecord = await Record.findOne({
      id: payload.data.id.toString(),
      customerId: payload.customerId
    });

    if (existingRecord) {
      console.log('Record already exists, use PATCH for updates:', payload.data.id);
      return NextResponse.json(
        { error: 'Record already exists. Use PATCH endpoint for updates.' },
        { status: 409 }
      );
    }

    // Create new record
    const newRecord = new Record({
      id: payload.data.id.toString(),
      name: payload.data.name || payload.data.id.toString(),
      customerId: payload.customerId,
      recordType: payload.recordType,
      fields: payload.data.fields || {},
      createdTime: payload.data.createdTime || new Date().toISOString(),
      updatedTime: payload.data.updatedTime || new Date().toISOString(),
      ...(payload.data.uri && { uri: payload.data.uri }),
    });

    const result = await newRecord.save();

    console.log('New record created:', {
      id: payload.data.id,
      _id: result._id,
      customerId: payload.customerId,
      recordType: payload.recordType,
    });

    return NextResponse.json({ 
      success: true,
      recordId: payload.data.id,
      _id: result._id,
      customerId: payload.customerId,
      recordType: payload.recordType,
      status: 'created'
    });

  } catch (error) {
    console.error('Error processing new record webhook:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PATCH: Receive record updates
export async function PATCH(request: NextRequest) {
  try {
    const payload = await request.json() as WebhookPayload;
    console.log('Received record update webhook:', {
      customerId: payload.customerId,
      recordId: payload.data.id,
      recordType: payload.recordType
    });

    await connectToDatabase();

    // Ensure we have the required fields
    if (!payload.customerId || !payload.data.id || !payload.recordType) {
      return NextResponse.json(
        { error: 'Missing required fields: customerId, data.id, and recordType are required' },
        { status: 400 }
      );
    }

    // Find existing record
    const existingRecord = await Record.findOne({
      id: payload.data.id.toString(),
      customerId: payload.customerId
    });

    if (!existingRecord) {
      console.log('Record not found for update, use POST to create:', payload.data.id);
      return NextResponse.json(
        { error: 'Record not found. Use POST endpoint to create new records.' },
        { status: 404 }
      );
    }

    // Update the record
    const updateData: any = {
      updatedTime: new Date().toISOString(),
    };

    if (payload.data.name !== undefined) {
      updateData.name = payload.data.name;
    }

    if (payload.data.fields !== undefined) {
      updateData.fields = payload.data.fields;
    }

    if (payload.data.updatedTime !== undefined) {
      updateData.updatedTime = payload.data.updatedTime;
    }

    if (payload.data.uri !== undefined) {
      updateData.uri = payload.data.uri;
    }

    const result = await Record.findOneAndUpdate(
      { 
        id: payload.data.id.toString(),
        customerId: payload.customerId 
      },
      { $set: updateData },
      { new: true }
    );

    console.log('Record updated:', {
      id: payload.data.id,
      _id: result?._id,
      customerId: payload.customerId,
      recordType: payload.recordType,
    });

    return NextResponse.json({ 
      success: true,
      recordId: payload.data.id,
      _id: result?._id,
      customerId: payload.customerId,
      recordType: payload.recordType,
      status: 'updated'
    });

  } catch (error) {
    console.error('Error processing record update webhook:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE: Receive record deletion events
export async function DELETE(request: NextRequest) {
  try {
    const payload = await request.json() as { customerId: string; recordType: RecordActionKey; recordId: string | number };
    console.log('Received record deletion webhook:', {
      customerId: payload.customerId,
      recordId: payload.recordId,
      recordType: payload.recordType
    });

    await connectToDatabase();

    // Ensure we have the required fields
    if (!payload.customerId || !payload.recordId || !payload.recordType) {
      return NextResponse.json(
        { error: 'Missing required fields: customerId, recordId, and recordType are required' },
        { status: 400 }
      );
    }

    // Find and delete the record
    const result = await Record.findOneAndDelete({
      id: payload.recordId.toString(),
      customerId: payload.customerId
    });

    if (!result) {
      console.log('Record not found for deletion:', payload.recordId);
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }

    console.log('Record deleted:', {
      id: payload.recordId,
      _id: result._id,
      customerId: payload.customerId,
      recordType: payload.recordType,
    });

    return NextResponse.json({ 
      success: true,
      recordId: payload.recordId,
      _id: result._id,
      customerId: payload.customerId,
      recordType: payload.recordType,
      status: 'deleted'
    });

  } catch (error) {
    console.error('Error processing record deletion webhook:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
} 