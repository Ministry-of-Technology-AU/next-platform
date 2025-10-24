import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { strapiGet, strapiPut } from "@/lib/apis/strapi";
import { getUserIdByEmail } from "@/lib/userid";
import { Asset, BorrowRequest } from "@/app/platform/borrow-assets/types";

/**
 * GET handler for /api/platform/borrow-assets
 * Returns assets data with borrow request information
 */
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated session
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user ID to fetch bookmarked assets
    const userId = await getUserIdByEmail(session.user.email);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch assets and user bookmarks in parallel for optimal performance
    const [assetsResponse, userResponse] = await Promise.all([
      strapiGet(`/assets`, {
        populate: {
          borrow_requests: true,
          last_borrow_request: true,
          Image: true
        }
      }),
      strapiGet(`/users/${userId}`, {
        populate: {
          bookmarked_assets: true
        }
      })
    ]);

    if (!assetsResponse || !assetsResponse.data) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "No assets found"
      });
    }

    // Extract bookmarked asset IDs from user data
    const bookmarkedAssetIds = new Set(
      userResponse?.bookmarked_assets?.map((asset: any) => asset.id.toString()) || []
    );

    // Transform Strapi data to match frontend Asset interface
    const assets: Asset[] = assetsResponse.data.map((strapiAsset: any) => {
      const attributes = strapiAsset.attributes;
      
      // Determine status based on last_borrow_request
      let status: 'available' | 'unavailable' = 'available';
      if (attributes.last_borrow_request?.data) {
        // If there's a last borrow request, check if it's still active
        // You might want to add logic here based on your borrow request schema
        status = 'unavailable';
      }

      // Build the full image URL if it's a relative URL
      let imageUrl = attributes.Image?.data?.attributes?.url;
      if (imageUrl && imageUrl.startsWith('/uploads/')) {
        imageUrl = `${process.env.STRAPI_IMAGE_URL || 'http://localhost:1337'}${imageUrl}`;
      }

      const asset = {
        id: strapiAsset.id.toString(),
        name: attributes.name || 'Unknown Asset',
        model: attributes.model,
        description: attributes.description || '',
        type: attributes.type || 'adapter',
        tab: 'Techmin' as const, // Default to Techmin as specified
        status,
        Image: attributes.Image?.data ? {
          id: attributes.Image.data.id.toString(),
          url: imageUrl,
          alternativeText: attributes.Image.data.attributes.alternativeText || attributes.name || 'Asset image'
        } : undefined,
        borrow_requests: attributes.borrow_requests?.data?.map((req: any) => ({
          id: req.id.toString(),
          createdAt: req.attributes.createdAt,
          updatedAt: req.attributes.updatedAt
        })) || [],
        last_borrow_request: attributes.last_borrow_request?.data ? {
          id: attributes.last_borrow_request.data.id.toString(),
          createdAt: attributes.last_borrow_request.data.attributes.createdAt,
          updatedAt: attributes.last_borrow_request.data.attributes.updatedAt
        } : undefined,
        bookmarked: bookmarkedAssetIds.has(strapiAsset.id.toString()), // Check if asset is in user's bookmarks
        createdAt: attributes.createdAt,
        updatedAt: attributes.updatedAt
      };

      return asset;
    });

    return NextResponse.json({
      success: true,
      data: assets,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error fetching assets:", error);
    console.error("Error stack:", (error as Error).stack);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch assets",
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

/**
 * POST handler for /api/platform/borrow-assets
 * Handles asset-related operations (bookmarking, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, assetId } = body;

    switch (action) {
      case 'bookmark':
        try {
          // Get user ID
          const userId = await getUserIdByEmail(session.user.email);
          if (!userId) {
            return NextResponse.json(
              { success: false, error: "User not found" },
              { status: 404 }
            );
          }

          // Get the current user with bookmarked assets
          const userResponse = await strapiGet(`/users/${userId}`, {
            populate: {
              bookmarked_assets: true
            }
          });

          if (!userResponse) {
            return NextResponse.json(
              { success: false, error: "User data not found" },
              { status: 404 }
            );
          }

          // Check if asset exists
          const assetResponse = await strapiGet(`/assets/${assetId}`);
          if (!assetResponse || !assetResponse.data) {
            return NextResponse.json(
              { success: false, error: "Asset not found" },
              { status: 404 }
            );
          }

          const currentBookmarkedAssets = userResponse.bookmarked_assets || [];
          const currentBookmarkedIds = currentBookmarkedAssets.map((asset: any) => asset.id.toString());
          const isCurrentlyBookmarked = currentBookmarkedIds.includes(assetId);

          let newBookmarkedIds: string[];
          if (isCurrentlyBookmarked) {
            // Remove from bookmarks
            newBookmarkedIds = currentBookmarkedIds.filter((id: string) => id !== assetId);
          } else {
            // Add to bookmarks
            newBookmarkedIds = [...currentBookmarkedIds, assetId];
          }

          
          // Update user's bookmarked assets
          const updateResponse = await strapiPut(`/users/${userId}`, {
            bookmarked_assets: newBookmarkedIds
          });


          if (updateResponse) {
            return NextResponse.json({
              success: true,
              message: "Bookmark updated successfully",
              bookmarked: !isCurrentlyBookmarked
            });
          } else {
            return NextResponse.json(
              { success: false, error: "Failed to update bookmark" },
              { status: 500 }
            );
          }
        } catch (bookmarkError) {
          console.error("Error updating bookmark:", bookmarkError);
          return NextResponse.json(
            { success: false, error: "Failed to update bookmark" },
            { status: 500 }
          );
        }
      
      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error handling POST request:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to process request",
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}