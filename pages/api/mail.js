const mail = require('@sendgrid/mail');

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

if (SENDGRID_API_KEY) {
  mail.setApiKey(SENDGRID_API_KEY);
}

// async function validateHuman(token) {
//   const secret = process.env.RECAPTCHA_SECRET_KEY;

//   const response = await fetch(
//     `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`,
//     {
//       method: 'POST'
//     }
//   );
//   const data = await response.json();
//   return data.success;
// }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!SENDGRID_API_KEY) {
      console.error('Mail sending error: SENDGRID_API_KEY is not configured');
      return res.status(500).json({ error: 'Mail service is currently unavailable' });
    }

    // In Next.js API routes, req.body is already parsed when content-type is application/json
    const body = req.body;

    // const human = await validateHuman(req.token);
    // if (!human) {
    //   res.status(400);
    //   res.json({ errors: 'You must be human to fill in this form' });
    //   return;
    // }
    const message = `
      First Name: ${body.firstname}\n
      Last Name: ${body.lastname}\n
      Email: ${body.email}\n
      Phone: ${body.phone || 'Not provided'}\n
      Subject: ${body.subject}\n
      Message: ${body.message}
      `;

    const { subject } = body;

    const data = {
      to: 'info@fysiodiamondfactory.nl',
      from: 'info@fysiodiamondfactory.nl',
      subject: `${subject}`,
      text: message,
      html: message.replace(/\n/g, '<br>')
    };

    try {
      await mail.send(data);
      res.status(200).json({ status: 'Ok' });
    } catch (error) {
      console.error('Mail sending error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
}
