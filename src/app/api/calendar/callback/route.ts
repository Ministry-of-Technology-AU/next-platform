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
          </head>
          <body>
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
              window.close();
            </script>
            <p>Authentication failed. This window will close automatically.</p>
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
          </head>
          <body>
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
              window.close();
            </script>
            <p>Authentication failed. This window will close automatically.</p>
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
          </head>
          <body>
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
              window.close();
            </script>
            <p>Authentication failed. This window will close automatically.</p>
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
        </head>
        <body>
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
            window.close();
          </script>
          <p>Authentication successful! This window will close automatically.</p>
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
        </head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage(
                { type: 'GOOGLE_AUTH_ERROR', error: 'auth_failed' },
                window.location.origin
              );
            }
            window.close();
          </script>
          <p>Authentication failed. This window will close automatically.</p>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  }
}