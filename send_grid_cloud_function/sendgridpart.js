/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.helloWorld = (req, res) => {
    // Take the parameters from the function making the http request, which is the email and file name
    const {email, fileName} = req.body;
    // Add your dependencies
    const sgMail = require("@sendgrid/mail");
    const { Storage } = require('@google-cloud/storage');
    // Initialize the Google Cloud Storage client
    const storage = new Storage();
    // Define your Google Cloud Storage bucket and file URL
    const bucketName = 'texbuckets';
    // Set your SendGrid API key
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    // Change senderEmail to the company email.
    const senderEmail = "bilalabaloch@gmail.com";          
    // Download the file from GCS and convert to base64
    storage
      .bucket(bucketName)
      .file(fileName)
      .download()
      .then(data => {
        // Convert the buffer to a base64-encoded string
        const buffer = data[0].toString('base64');
  
        // Create the attachment
        const attachment  =   {
          content: buffer,
          filename: 'Invoice.pdf',
          type: 'application/pdf',
          disposition: 'attachment'
        };
  
        // Compose the email
        const msg = {
          to: email,
          from: senderEmail,
          subject: "PDF Attachment Example",
          text: "Attached is the PDF file you requested.",
          attachments: [attachment],
        };
  
        // Send the email
        sgMail.send(msg)
          .then(() => res.send('Email sent successfully.'))
          .catch(error => console.error(error));
      })
      .catch(error => console.error(error));
  };
  
