import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, session, account, verification } from '@/db/schema';
import { sql, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const connectionStatus = {
      connected: false,
      tablesExist: false,
      authTablesStatus: {
        user: { exists: false, count: 0 },
        session: { exists: false, count: 0 },
        account: { exists: false, count: 0 },
        verification: { exists: false, count: 0 }
      },
      error: null as string | null,
      timestamp: new Date().toISOString()
    };

    // Test basic database connection with a simple query
    try {
      await db.run(sql`SELECT 1`);
      connectionStatus.connected = true;
    } catch (error) {
      connectionStatus.error = `Database connection failed: ${error}`;
      return NextResponse.json(connectionStatus, { status: 500 });
    }

    // Test each auth table existence and get counts
    const tables = [
      { name: 'user', schema: user },
      { name: 'session', schema: session },
      { name: 'account', schema: account },
      { name: 'verification', schema: verification }
    ];

    let allTablesExist = true;

    for (const table of tables) {
      try {
        // Try to query the table to verify it exists and get count
        const result = await db.select({ count: count() }).from(table.schema);
        connectionStatus.authTablesStatus[table.name] = {
          exists: true,
          count: result[0]?.count || 0
        };
      } catch (error) {
        connectionStatus.authTablesStatus[table.name] = {
          exists: false,
          count: 0
        };
        allTablesExist = false;
        connectionStatus.error = `Table ${table.name} query failed: ${error}`;
      }
    }

    connectionStatus.tablesExist = allTablesExist;

    // Try to verify table schemas with a sample query from user table
    if (connectionStatus.authTablesStatus.user.exists) {
      try {
        await db.select({ id: user.id }).from(user).limit(1);
      } catch (error) {
        connectionStatus.error = `User table schema verification failed: ${error}`;
      }
    }

    const totalRecords = Object.values(connectionStatus.authTablesStatus)
      .reduce((sum, table) => sum + table.count, 0);

    return NextResponse.json({
      ...connectionStatus,
      message: connectionStatus.connected && connectionStatus.tablesExist 
        ? 'Database and auth tables verified successfully' 
        : 'Database issues detected',
      summary: {
        databaseConnected: connectionStatus.connected,
        allAuthTablesExist: connectionStatus.tablesExist,
        totalAuthRecords: totalRecords,
        readyForAuth: connectionStatus.connected && connectionStatus.tablesExist
      }
    }, { status: connectionStatus.connected && connectionStatus.tablesExist ? 200 : 500 });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      connected: false,
      tablesExist: false,
      error: `Database test failed: ${error}`,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}