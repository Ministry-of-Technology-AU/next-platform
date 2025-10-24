import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { strapiPost, strapiGet, strapiPut } from '@/lib/apis/strapi';
import { CreateBorrowRequestData } from '@/app/platform/borrow-assets/types';
import { getCurrentDateISTString, isBeforeTodayIST } from '@/lib/date-utils';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const assetId = params.id;
    
    // Parse the request body
    const body = await request.json();
    const { from, to, reason } = body;

    // Validate required fields
    if (!from || !to || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: from, to, reason' },
        { status: 400 }
      );
    }

    // Validate dates
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const todayIST = getCurrentDateISTString();

    // Allow from date to be today (not in the past)
    if (isBeforeTodayIST(from)) {
      return NextResponse.json(
        { error: `From date cannot be before today (${todayIST})` },
        { status: 400 }
      );
    }

    if (toDate <= fromDate) {
      return NextResponse.json(
        { error: 'To date must be after from date' },
        { status: 400 }
      );
    }

    // Check if asset exists and is available
    const assetResponse = await strapiGet(`/assets/${assetId}`, {
      populate: {
        last_borrow_request: {
          populate: '*'
        }
      }
    });

    if (!assetResponse.data) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    const asset = assetResponse.data;

    // Check if asset is currently borrowed or has pending requests
    if (asset.attributes.last_borrow_request?.data) {
      const lastRequest = asset.attributes.last_borrow_request.data.attributes;
      const currentDate = new Date();
      
      // Check if there's an active borrow (issued but not returned)
      if (lastRequest.issued === 1 && lastRequest.returned !== 1) {
        return NextResponse.json(
          { error: 'Asset is currently borrowed and unavailable' },
          { status: 400 }
        );
      }
    }

    // Also check for any pending borrow requests from the same user
    const existingUserRequests = await strapiGet('/borrow-requests', {
      filters: {
        $and: [
          {
            asset: {
              id: {
                $eq: assetId
              }
            }
          },
          {
            user: {
              email: {
                $eq: user.email
              }
            }
          },
          {
            issued: {
              $ne: 1
            }
          },
          {
            returned: {
              $ne: 1
            }
          }
        ]
      }
    });

    if (existingUserRequests.data && existingUserRequests.data.length > 0) {
      return NextResponse.json(
        { error: 'You already have a pending request for this asset' },
        { status: 400 }
      );
    }

    // Get user from Strapi by email
    const userResponse = await strapiGet('/users', {
      filters: {
        email: {
          $eq: user.email
        }
      }
    });

    if (!userResponse || userResponse.length === 0) {
      return NextResponse.json(
        { error: 'User not found in the system' },
        { status: 404 }
      );
    }

    const strapiUser = userResponse[0];

    // Create borrow request data with issued_on set to today's date
    const borrowRequestData: CreateBorrowRequestData = {
      from,
      to,
      user: strapiUser.id,
      asset: parseInt(assetId),
      reason,
      issued_on: getCurrentDateISTString(), // Set to today when request is created
    };

    // Create the borrow request in Strapi
    const borrowRequest = await strapiPost('/borrow-requests', {
      data: borrowRequestData
    });

    // Update the asset's last_borrow_request relation
    await strapiPut(`/assets/${assetId}`, {
      data: {
        last_borrow_request: borrowRequest.data.id
      }
    });

    return NextResponse.json({
      success: true,
      borrowRequest: borrowRequest.data
    });

  } catch (error) {
    console.error('Error creating borrow request:', error);
    
    // Handle Strapi specific errors
    if (error instanceof Error && 'response' in error) {
      const axiosError = error as any;
      if (axiosError.response?.data) {
        return NextResponse.json(
          { 
            error: 'Failed to create borrow request',
            details: axiosError.response.data
          },
          { status: axiosError.response.status || 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const assetId = params.id;

    // Get borrow requests for this asset
    const borrowRequests = await strapiGet('/borrow-requests', {
      filters: {
        asset: {
          id: {
            $eq: assetId
          }
        }
      },
      populate: {
        user: true,
        asset: true,
        issued_by: true,
        returned_to: true
      },
      sort: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      borrowRequests: borrowRequests.data || []
    });

  } catch (error) {
    console.error('Error fetching borrow requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
