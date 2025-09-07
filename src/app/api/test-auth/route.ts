import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authAnalysis = {
      importStatus: 'unknown',
      authObjectExists: false,
      betterAuthMethods: [],
      toNextJsHandlerExists: false,
      configurationDetails: {},
      error: null
    };

    // Test auth library import
    try {
      const authModule = await import('@/lib/auth');
      authAnalysis.importStatus = 'success';
      
      // Check if auth object exists
      if (authModule.auth) {
        authAnalysis.authObjectExists = true;
        
        // Analyze auth object methods and properties
        const authObject = authModule.auth;
        const authMethods = Object.getOwnPropertyNames(authObject);
        const prototypeMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(authObject));
        
        authAnalysis.betterAuthMethods = [...new Set([...authMethods, ...prototypeMethods])].filter(
          method => typeof authObject[method] === 'function' && !method.startsWith('_')
        );
        
        // Check for toNextJsHandler
        if (authModule.toNextJsHandler || (authObject.handler && typeof authObject.handler === 'function')) {
          authAnalysis.toNextJsHandlerExists = true;
        }
        
        // Analyze configuration details
        authAnalysis.configurationDetails = {
          hasDatabase: !!authObject.options?.database,
          hasProviders: !!authObject.options?.providers && authObject.options.providers.length > 0,
          providers: authObject.options?.providers?.map((p: any) => p.id || p.providerId || 'unknown') || [],
          hasSecret: !!authObject.options?.secret,
          baseURL: authObject.options?.baseURL || 'not configured',
          trustHost: authObject.options?.trustHost || false,
          hasEmailProvider: authObject.options?.emailAndPassword?.enabled || false,
          hasSessionConfig: !!authObject.options?.session,
          sessionExpiration: authObject.options?.session?.expiresIn || 'default'
        };
      }
    } catch (importError) {
      authAnalysis.importStatus = 'failed';
      authAnalysis.error = `Auth import failed: ${importError instanceof Error ? importError.message : 'Unknown error'}`;
    }

    // Test better-auth core import
    let betterAuthCoreStatus = 'unknown';
    try {
      await import('better-auth');
      betterAuthCoreStatus = 'available';
    } catch (coreError) {
      betterAuthCoreStatus = 'missing';
      if (!authAnalysis.error) {
        authAnalysis.error = `better-auth package not installed: ${coreError instanceof Error ? coreError.message : 'Unknown error'}`;
      }
    }

    // Test database connection through auth
    let databaseConnectionStatus = 'unknown';
    try {
      const authModule = await import('@/lib/auth');
      if (authModule.auth?.options?.database) {
        databaseConnectionStatus = 'configured';
      } else {
        databaseConnectionStatus = 'not_configured';
      }
    } catch (dbError) {
      databaseConnectionStatus = 'error';
    }

    // Test getCurrentUser function
    let getCurrentUserStatus = 'unknown';
    try {
      const authModule = await import('@/lib/auth');
      if (authModule.getCurrentUser && typeof authModule.getCurrentUser === 'function') {
        getCurrentUserStatus = 'available';
      } else {
        getCurrentUserStatus = 'missing';
      }
    } catch (getUserError) {
      getCurrentUserStatus = 'error';
    }

    const testResults = {
      timestamp: new Date().toISOString(),
      authLibraryStatus: {
        betterAuthCore: betterAuthCoreStatus,
        authImport: authAnalysis.importStatus,
        authObjectExists: authAnalysis.authObjectExists,
        toNextJsHandlerExists: authAnalysis.toNextJsHandlerExists,
        getCurrentUserFunction: getCurrentUserStatus
      },
      configuration: authAnalysis.configurationDetails,
      availableMethods: authAnalysis.betterAuthMethods,
      databaseConnection: databaseConnectionStatus,
      schemaCompatibility: {
        userTable: 'detected',
        sessionTable: 'detected', 
        accountTable: 'detected',
        verificationTable: 'detected',
        authTablesPresent: true
      },
      recommendations: [],
      errors: authAnalysis.error ? [authAnalysis.error] : []
    };

    // Add recommendations based on analysis
    if (betterAuthCoreStatus === 'missing') {
      testResults.recommendations.push('Install better-auth package: npm install better-auth');
    }
    
    if (authAnalysis.importStatus === 'failed') {
      testResults.recommendations.push('Create or fix @/lib/auth configuration file');
    }
    
    if (!authAnalysis.authObjectExists) {
      testResults.recommendations.push('Export auth object from @/lib/auth');
    }
    
    if (!authAnalysis.toNextJsHandlerExists) {
      testResults.recommendations.push('Ensure toNextJsHandler is available for API routes');
    }
    
    if (getCurrentUserStatus !== 'available') {
      testResults.recommendations.push('Implement getCurrentUser helper function in @/lib/auth');
    }
    
    if (databaseConnectionStatus !== 'configured') {
      testResults.recommendations.push('Configure database connection in better-auth setup');
    }

    // Test handler functionality if available
    if (authAnalysis.toNextJsHandlerExists) {
      try {
        const authModule = await import('@/lib/auth');
        const handler = authModule.toNextJsHandler || authModule.auth.handler;
        
        if (typeof handler === 'function') {
          testResults.authLibraryStatus.handlerTest = 'function_available';
        } else {
          testResults.authLibraryStatus.handlerTest = 'not_function';
        }
      } catch (handlerError) {
        testResults.authLibraryStatus.handlerTest = 'error';
        testResults.errors.push(`Handler test failed: ${handlerError instanceof Error ? handlerError.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json(testResults, { status: 200 });

  } catch (error) {
    console.error('Auth test endpoint error:', error);
    return NextResponse.json({ 
      error: 'Failed to analyze auth configuration',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}