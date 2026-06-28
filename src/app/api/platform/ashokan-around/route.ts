import { NextRequest, NextResponse } from 'next/server'
import { strapiPost, strapiGet, strapiPut, strapiDelete } from '@/lib/apis/strapi'
import { getUserIdByEmail } from '@/lib/userid'
import { auth } from '@/auth'

function sanitizeInput(input: string): string {
  if (!input) return ''
  return input.trim().replace(/[<>]/g, '')
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const start = (page - 1) * limit

    const session = await auth()
    const userId = await getUserIdByEmail(session?.user?.email || '')

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    try {
      const accResponse = await strapiGet('/ashokan-arounds', {
        filters: { status: 'available' },
        populate: ['student'],
        pagination: { start, limit },
        sort: ['createdAt:desc']
      })

      const userAccResponse = await strapiGet('/ashokan-arounds', {
        filters: {
          student: { id: { $eq: userId } },
          status: 'available'
        },
        populate: ['student'],
        pagination: { limit: 1 }
      })

      return NextResponse.json({
        success: true,
        accommodations: accResponse.data || [],
        userAccommodation: userAccResponse.data?.[0] || null,
        pagination: accResponse.meta?.pagination || {}
      })

    } catch (strapiError) {
      const response = await strapiGet('/ashokan-arounds', { populate: ['student'] })
      const allAccs = response.data || []
      
      const availableAccs = allAccs.filter((acc: any) => acc.attributes?.status === 'available')
      const userAccs = allAccs.filter((acc: any) => 
        acc.attributes?.student?.data?.id === userId && acc.attributes?.status === 'available'
      )
      
      const paginatedAccs = availableAccs.slice(start, start + limit)
      
      return NextResponse.json({
        success: true,
        accommodations: paginatedAccs,
        userAccommodation: userAccs[0] || null,
        pagination: {
          page,
          pageSize: limit,
          pageCount: Math.ceil(availableAccs.length / limit),
          total: availableAccs.length
        }
      })
    }

  } catch (error) {
    console.error('Outer catch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userId = await getUserIdByEmail(session?.user?.email || '')
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      cityDestination,
      workplaceLocation,
      housingTypeWanted,
      budget,
      genderPreference,
      whatsappNumber,
      emailAddress,
    } = body

    const requiredFields = { cityDestination, housingTypeWanted, budget, genderPreference }
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value || value.toString().trim() === '') {
        return NextResponse.json({ success: false, error: `${field} is required` }, { status: 400 })
      }
    }

    const existingResponse = await strapiGet('/ashokan-arounds', {
      filters: {
        student: { id: { $eq: userId } },
        status: 'available'
      },
      pagination: { limit: 1 }
    })

    if (existingResponse.data && existingResponse.data.length > 0) {
      return NextResponse.json({ success: false, error: 'Active request exists' }, { status: 400 })
    }

    const data = {
      data: {
        cityDestination: sanitizeInput(cityDestination),
        workplaceLocation: sanitizeInput(workplaceLocation),
        housingTypeWanted: sanitizeInput(housingTypeWanted),
        budget: sanitizeInput(budget),
        genderPreference: sanitizeInput(genderPreference),
        whatsappNumber: sanitizeInput(whatsappNumber),
        emailAddress: sanitizeInput(emailAddress),
        status: 'available',
        student: userId
      }
    }

    const response = await strapiPost('/ashokan-arounds', data)
    return NextResponse.json({ success: true, data: response }, { status: 201 })

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    const userId = await getUserIdByEmail(session?.user?.email || '')
    if (!userId) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })

    const body = await request.json()
    const { id, status } = body

    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 })

    const existingResponse = await strapiGet(`/ashokan-arounds/${id}`, { populate: ['student'] })
    if (!existingResponse.data || existingResponse.data.attributes?.student?.data?.id !== userId) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 404 })
    }

    if (!['available', 'canceled', 'completed'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 })
    }

    const response = await strapiPut(`/ashokan-arounds/${id}`, { data: { status } })
    return NextResponse.json({ success: true, data: response })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    const userId = await getUserIdByEmail(session?.user?.email || '')
    if (!userId) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })

    const body = await request.json()
    const { id } = body

    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 })

    const existingResponse = await strapiGet(`/ashokan-arounds/${id}`, { populate: ['student'] })
    if (!existingResponse.data || existingResponse.data.attributes?.student?.data?.id !== userId) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 404 })
    }

    const response = await strapiDelete(`/ashokan-arounds/${id}`)
    return NextResponse.json({ success: true, message: 'Deleted' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 })
  }
}
