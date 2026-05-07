stayora.ro
website for Stayora, a property management system for airbnbs and small hotels.

## Contact form email (Resend)

This project includes a server endpoint at `/api/contact` in `functions/api/contact.js`.

Required environment variables:

- `RESEND_APIKEY` (or `RESEND_API_KEY`)
- `RESEND_FROM_EMAIL` (must be a verified sender in Resend)
- `CONTACT_TO_EMAIL` (inbox that receives messages)

Copy `.env.example` to your environment configuration and set real values in your deployment platform.
