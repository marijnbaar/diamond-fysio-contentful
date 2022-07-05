const mail = require('@sendgrid/mail');

mail.setApiKey(process.env.SENDGRID_API_KEY);

export default function handler(req, res) {
  const body = JSON.parse(req.body);
  const message = `
    First Name: ${body.firstname}rn
    Last Name: ${body.lastname}rn
    Email: ${body.email}rn
    Phone: ${body.phone}rn
    Subject: ${body.subject}rn
    Message: ${body.message}
    `;

  const data = {
    to: 'diamondfysio@gmail.com',
    from: 'diamondfysio@gmail.com',
    subject: 'New Message!',
    text: message,
    html: message.replace(/\r\n/g, '<br>')
  };

  mail
    .send(data)
    // .then(() => {
    //     console.log('Email sent')
    // })
    .catch((error) => {
      console.error(error);
    });
  res.status(200).json({ status: 'Ok' });
}
