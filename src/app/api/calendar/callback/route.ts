import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Authentication Failed</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                color: white;
              }
              .container {
                text-align: center;
                padding: 2rem;
              }
              .icon {
                font-size: 64px;
                margin-bottom: 1rem;
              }
              button {
                margin-top: 2rem;
                padding: 12px 24px;
                font-size: 16px;
                background: white;
                color: #ef4444;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
              }
              button:hover {
                background: #f0f0f0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">✕</div>
              <h1>Authentication Failed</h1>
              <p>Please close this window and try again.</p>
              <button onclick="window.close()">Close Window</button>
            </div>
            <script>
              if (window.opener) {
                window.opener.postMessage(
                  {
                    type: 'GOOGLE_AUTH_ERROR',
                    error: ${JSON.stringify(error)}
                  },
                  window.location.origin
                );
              }
            </script>
          </body>
        </html>
      `;

      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    if (!code) {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Authentication Failed</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                color: white;
              }
              .container {
                text-align: center;
                padding: 2rem;
              }
              .icon {
                font-size: 64px;
                margin-bottom: 1rem;
              }
              button {
                margin-top: 2rem;
                padding: 12px 24px;
                font-size: 16px;
                background: white;
                color: #ef4444;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
              }
              button:hover {
                background: #f0f0f0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">✕</div>
              <h1>Authentication Failed</h1>
              <p>No authorization code received.</p>
              <button onclick="window.close()">Close Window</button>
            </div>
            <script>
              if (window.opener) {
                window.opener.postMessage(
                  {
                    type: 'GOOGLE_AUTH_ERROR',
                    error: 'no_code'
                  },
                  window.location.origin
                );
              }
            </script>
          </body>
        </html>
      `;

      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Exchange code for tokens on the server side
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.AUTH_GOOGLE_ID!,
        client_secret: process.env.AUTH_GOOGLE_SECRET!,
        redirect_uri: process.env.CALENDAR_CALLBACK_URL!,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Token exchange error:', errorData);

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Authentication Failed</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                color: white;
              }
              .container {
                text-align: center;
                padding: 2rem;
              }
              .icon {
                font-size: 64px;
                margin-bottom: 1rem;
              }
              button {
                margin-top: 2rem;
                padding: 12px 24px;
                font-size: 16px;
                background: white;
                color: #ef4444;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
              }
              button:hover {
                background: #f0f0f0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">✕</div>
              <h1>Authentication Failed</h1>
              <p>Token exchange failed. Please try again.</p>
              <button onclick="window.close()">Close Window</button>
            </div>
            <script>
              if (window.opener) {
                window.opener.postMessage(
                  {
                    type: 'GOOGLE_AUTH_ERROR',
                    error: 'token_exchange_failed'
                  },
                  window.location.origin
                );
              }
            </script>
          </body>
        </html>
      `;

      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    const tokens = await tokenResponse.json();

    // Send access token back to opener
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Successful</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
            }
            .container {
              text-align: center;
              padding: 2rem;
            }
            .checkmark {
              font-size: 64px;
              margin-bottom: 1rem;
              animation: scale 0.5s ease-in-out;
            }
            button {
              margin-top: 2rem;
              padding: 12px 24px;
              font-size: 16px;
              background: white;
              color: #10b981;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
            }
            button:hover {
              background: #f0f0f0;
            }
            @keyframes scale {
              0% { transform: scale(0); }
              50% { transform: scale(1.2); }
              100% { transform: scale(1); }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="checkmark">✓</div>
            <h1>Authentication Successful!</h1>
            <p>You can now close this window.</p>
            <button onclick="window.close()">Close Window</button>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage(
                {
                  type: 'GOOGLE_AUTH_SUCCESS',
                  accessToken: ${JSON.stringify(tokens.access_token)}
                },
                window.location.origin
              );
            }
          </script>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Failed</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
              color: white;
            }
            .container {
              text-align: center;
              padding: 2rem;
            }
            .icon {
              font-size: 64px;
              margin-bottom: 1rem;
            }
            button {
              margin-top: 2rem;
              padding: 12px 24px;
              font-size: 16px;
              background: white;
              color: #ef4444;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
            }
            button:hover {
              background: #f0f0f0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">✕</div>
            <h1>Authentication Failed</h1>
            <p>An unexpected error occurred. Please try again.</p>
            <button onclick="window.close()">Close Window</button>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage(
                { type: 'GOOGLE_AUTH_ERROR', error: 'auth_failed' },
                window.location.origin
              );
            }
          </script>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  }
}