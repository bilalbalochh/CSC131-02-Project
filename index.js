const express = require('express');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.post('/', async (req, res) => {
  // Pull from the function making the request its parameters, which are the pdf's file name and the filled
  // template as string.
  const {fileName, texContent} = req.body;

  // Install all dependencies.
  const util = require('util');
  const fs = require('fs');
  const exec = util.promisify(require('child_process').exec);
  const tmp = require('tmp');
  const os = require('os');
  const path = require('path');
  const { Storage } = require('@google-cloud/storage');
  // Create a temp directory that starts at the current working directory.
  const tmpDir = '.';

  // Create a file to write the .tex template on.
  const texFilePath = path.join(tmpDir, 'output.tex');
  // Additionally, create .pdf file to save the compiled pdf to.
  const pdfFilePath = path.join(tmpDir, 'output.pdf');
  // Try to write the filled tex template to the created file.
  try {
    fs.writeFile(texFilePath, texContent, function (err) {
      if (err) throw err;
      console.log('File is created successfully.');
    });      
  }
  catch (error) {
    console.error('Error creating file: ', error);
    throw error;
  }
  // Execute pdflatex command.
  try {
      const storage = new Storage();
      const bucket = storage.bucket('texbuckets');
      //Run the command twice to properly compile the headers of the tabular data section.
      await exec(`pdflatex --interaction=nonstopmode ${texFilePath}`);
      await exec(`pdflatex --interaction=nonstopmode ${texFilePath}`);


      // Read the content of the file
      const pdfFileContent = fs.readFileSync(pdfFilePath);
      // Save the .pdf file to GCS.
      const file2 = await bucket.file(`${fileName}`).save(pdfFileContent);
      console.log('pdf uploaded to GCS');
      res.send('Recieved a post request');
  }
  catch (error) {
      console.error('Problem in pdflatex: ', error);
      res.send('Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
