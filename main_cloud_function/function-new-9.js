/**
 * Triggered by a change to a Firestore document.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 */
exports.helloFirestore = async (event, context) => {
  const axios = require('axios');
  const {Firestore} = require('@google-cloud/firestore');
  const firestore = new Firestore();
  const {Storage} = require('@google-cloud/storage');
  const storage = new Storage();
  const bucketName = 'texbuckets';
  const templateFileName = 'blank_invoice_template.tex'; 
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(templateFileName);
  // Copy the document info into a variable
  const docInfo = event.value.fields; // Assuming the data is stored in 'fields'
  // Copy the document id into a variable
  docId = context.params.docId;
  // Attempt to download a blank .tex template for the invoice from GCS
  try {
    const [content] = await file.download();
    console.log('Function downloadLaTeXTemplate() is successful. LaTeX template downloaded, and returned as string')
    texTemplate = content.toString();
  } catch (err) {
    console.error('Function downloadLaTeXTemplate error. Error downloading LaTeX template from Google Cloud Storage:', err);
  }
  // Copy the blank template into a variable to use.
  templateSource = texTemplate;
  // Start with a blank line to append the tabular data as it is processed
  tabularDataStringDisplay = '';
  // Set 0 to start the subTotal and subTax for each item purchased
  subTotal= 0;
  subTax = 0;
    // Iterate through the items purchased
    (docInfo.tabularData.arrayValue.values).forEach(item => {
      unitPrice = item.mapValue.fields.unitPrice.stringValue;
      quantity = item.mapValue.fields.quantity.stringValue;
      description = item.mapValue.fields.description.stringValue;
      tax = item.mapValue.fields.tax.stringValue;
      // Calculate amount cost of item
      amountUSD = parseFloat(unitPrice) * (1 + (parseFloat(tax))/100);
      amountUSD = amountUSD.toFixed(2);
      // Add all the information into one string seperated by LaTeX special characters that arrange the data
      // in tabular form.
      tabularDataStringDisplay += (description + ' & ' + quantity + ' & ' + unitPrice + ' & ' + tax + ' & ' + amountUSD + ' \\\\ \\hline \\\\ ');
      // Keep a running total of the subTotal and subTax as you iterate through each item.
      subTotal += parseFloat(unitPrice);
      subTax += parseFloat(unitPrice) * (parseFloat(tax)/100);
    });
    // Once iteration is complete, calculate the total of the purchase, subTotal and subTax.
    total_USD = subTotal + subTax;
    subTotal = subTotal.toFixed(2);
    subTax = subTax.toFixed(2);
    total_USD = total_USD.toFixed(2);
    // Sort through the key fields and replace them with the placeholders in the blank template
    for (const key in docInfo) {
      const regex = new RegExp(`{{${key}}}`, 'g'); // Match LaTeX command
      // When you arrive at the tabularData field, replace with the variable tabularDataStringDisplay
      // Which contains the single long string that will be inserted into columns and rows into the template
      // As it has its seperators already given in by the & signs.
      if (key == 'tabularData'){
        templateSource = templateSource.replace(regex, tabularDataStringDisplay);
      }
      else {
        templateSource = templateSource.replace(regex, docInfo[key].stringValue);
      }
    }
    // For placeholders that are not in the document info, we replace them with variables that contain the values
    // such as for subTotal, subTax, and totalUSD, which we have calculated in the running program.
    const regex1 = new RegExp(`{{${'subTotal'}}}`, 'g'); // Match LaTeX command
    const regex2 = new RegExp(`{{${'subTax'}}}`, 'g'); // Match LaTeX command        
    const regex3 = new RegExp(`{{${'totalUSD'}}}`, 'g'); // Match LaTeX command        
    templateSource = templateSource.replace(regex1, subTotal);
    templateSource = templateSource.replace(regex2, subTax);
    templateSource = templateSource.replace(regex3, total_USD);

    // Use axios dependency to send http rquests.
    // Try to send http requests to cloud run service and cloud function, utilizing the await keyword to pause 
    // until one http requests finishes, and then utilizing what it accomplishes in the next http request.
    try {
      const cloudRunServiceUrl = 'https://texlive-image-xeolidn2bq-uw.a.run.app';
      // Assign the filled template to a new variable to use in the next portion of the program.
      latexContent = templateSource;
      // Use the information from the document to create a unique file name for the pdf.
      file_name = `invoice_${docInfo.invoiceNumber.stringValue}.pdf`;
      // Make a request to the Cloud Run Service given parameters of the file name and filled latex template.
      result = await axios.post(cloudRunServiceUrl, 
        { fileName: file_name, texContent: latexContent })
          .then((response) => {
            // Handle the response data here
            console.log('Response:', response.data);
            // Update the document with the pdf url.
            firestore.collection('copyInvoice').doc(docId).update({
              pdfURL: `https://storage.cloud.google.com/texbuckets/${file_name}`,
            });          
          })
          .catch((error) => {
            // Handle errors
            console.error('Error:', error.message);
          });
        

      const sendGridUrl = 'https://us-west1-mondaycsc131.cloudfunctions.net/sendgrid_part-1';
      // Make a request to the Cloud Function that sends the email, given the customer's email from the
      // document, and the file_name created within the running function.
      sendGridPart = await axios.post(sendGridUrl, {email: docInfo.customerEmail.stringValue, fileName: file_name})
        .then((response) => {
          // Handle the response data here
          console.log('Response:', response.data);
          // Update the document with status of email being sent as true.
          firestore.collection('copyInvoice').doc(docId).update({
            emailSent: 'true',
          });
        })
        .catch((error) => {
          // Handle errors
          console.error('Error:', error.message);
        });
        
    } catch (error) {
        console.error('Axios post error making HTTP request:', error);
      }
  };
  
