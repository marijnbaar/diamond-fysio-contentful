const mail = require('@sendgrid/mail');

mail.setApiKey(process.env.SENDGRID_API_KEY);

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
  const body = JSON.parse(req.body);

  // const human = await validateHuman(req.token);
  // if (!human) {
  //   res.status(400);
  //   res.json({ errors: 'You must be human to fill in this form' });
  //   return;
  // }
  const message = `
    First Name: ${body.firstname}rn
    Last Name: ${body.lastname}rn
    Email: ${body.email}rn
    Phone: ${body.phone}rn
    Subject: ${body.subject}rn
    Message: ${body.message}
    `;

  const { subject } = body;

  const data = {
    to: 'diamondfysio@gmail.com',
    from: 'diamondfysio@gmail.com',
    subject: `${subject}!`,
    text: message,
    html: message.replace(/rn/g, '<br>')
  };

  await mail.send(data).catch((error) => {
    console.error(error);
  });
  res.status(200).json({ status: 'Ok' });
}
