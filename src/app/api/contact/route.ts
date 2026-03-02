import { NextResponse } from 'next/server'
import prisma from '../../../../backend/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, company, message } = body || {}
    if (!email || !message) {
      return NextResponse.json({ error: 'missing required fields' }, { status: 400 })
    }

    // persist to DB
    try {
      await prisma.contactRequest.create({ data: { name: name ?? null, email, company: company ?? null, message } })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[contact] db save failed', e)
    }

    // optional: send email to sales via SendGrid if configured
    const sendgridKey = process.env.SENDGRID_API_KEY
    if (sendgridKey) {
      try {
        await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sendgridKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: process.env.SALES_EMAIL ?? 'sales@example.com' }] }],
            from: { email: process.env.FROM_EMAIL ?? 'no-reply@example.com' },
            subject: `New contact request from ${email}`,
            content: [{ type: 'text/plain', value: `Name: ${name}\nEmail: ${email}\nCompany: ${company}\n\n${message}` }],
          }),
        })
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[contact] sendgrid send failed', e)
      }
    }

    return NextResponse.json({ status: 'ok' })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[contact] error', err)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
