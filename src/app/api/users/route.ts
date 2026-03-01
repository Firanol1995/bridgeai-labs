import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import logger from '@/lib/logger'

export async function GET() {
  try {
    const users = await prisma.user.findMany({ orderBy: { id: 'asc' } })
    return NextResponse.json(users)
  } catch (err) {
    logger.error('[GET /api/users] error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body || typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json({ error: 'Invalid payload: name is required' }, { status: 400 })
    }

    const newUser = await prisma.user.create({
      data: {
        name: body.name.trim(),
        email: typeof body.email === 'string' && body.email.length > 0 ? body.email : null,
      },
    })

    return NextResponse.json(newUser, { status: 201 })
  } catch (err) {
    logger.error('[POST /api/users] error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}