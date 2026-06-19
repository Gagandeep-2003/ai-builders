# Mentor Email Reminders

The portal exposes a secure reminder endpoint:

`GET /api/mentor-reminders`

It checks for regular and approved make-up classes starting in 45–75 minutes,
sends one EmailJS message, and records the event so the same class is not sent twice.

## 1. Run the database migration

Run `supabase/mentor-reminders-migration.sql` in Supabase SQL Editor.

## 2. Configure the EmailJS template

Service ID: `service_620d95s`

Template ID: `template_yqqin4y`

Set the template **To Email** field to:

`{{mentor_email}}`

Suggested subject:

`Class in 1 hour: {{student_name}} · {{session_name}}`

Suggested body:

```text
Hi Gagandeep,

Your {{class_type}} with {{student_name}} starts in about one hour.

Time: {{class_time_ist}}
Module: {{module_number}}
Session: {{session_number}}
Topic: {{session_name}}
Meet: {{meet_link}}

AI Builders Portal
```

## 3. Add Vercel environment variables

- `EMAILJS_SERVICE_ID=service_620d95s`
- `EMAILJS_TEMPLATE_ID=template_yqqin4y`
- `EMAILJS_PUBLIC_KEY=<EmailJS public key>`
- `EMAILJS_PRIVATE_KEY=<EmailJS private key>` (recommended)
- `MENTOR_REMINDER_EMAIL=gagandeepsingh220903@gmail.com`
- `CRON_SECRET=<a long random secret>`

Redeploy after adding the variables.

## 4. Test EmailJS once

Call:

`https://ai-builders-six.vercel.app/api/mentor-reminders?test=1`

Send the same authorization header:

`Authorization: Bearer <your CRON_SECRET>`

It should send a sample reminder immediately.

## 5. Schedule it

Vercel Hobby cron is not precise enough for one-hour reminders. Use a free
external scheduler such as cron-job.org:

- URL: `https://ai-builders-six.vercel.app/api/mentor-reminders`
- Method: `GET`
- Frequency: every 15 minutes
- Header: `Authorization: Bearer <your CRON_SECRET>`

The endpoint returns JSON showing sent, skipped, or failed reminders.
