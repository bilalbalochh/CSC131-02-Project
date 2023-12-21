# CSC131-02-Project
Dynamic PDF Generation of E-Commerce Documents Project
This file is dedicated to explain how to deploy the two cloud functions as well as to push the docker image to artifact registry.

To use the main cloud function, open folder main_cloud_function:
1. create a new gen 1 firestore trigger upon create google cloud function.
2. use a service account that is not the default one, so you may have to make a new one.
3. give that service account the cloud invoker permission and cloud functions admin if needed.
4. install package dependencies from the code into the cloud shell with the command npm install -i depen_name_here
5. write the version given by command cat package.json into the package.json file of the cloud function package.json file.
6. Add to the source file the file function-new-9.js in the folder main_cloud_function.
7. Create a google cloud storage bucket titled 'texbuckets'.
8. Add the .tex file in the main_cloud_function folder named blank_invoice_template to the bucket.
9. Give permissions to the service account for cloud storage admin.
10. Run the cloud function!

To use the sendgrid cloud function, use file sendgridpart.js:
1. create a new gen 1 http request triggered google cloud function.
2. Copy the contents of the file sendgridpart.js in folder send_grid_cloud_function
3. Use previous step 2. from above.
4. Use previous step 3. from above.
5. Use previous step 4. above.
6. Use previous step 5. above
7. Run!


To use the docker file in Cloud Run:
1. Download docker desktop. 
2. Create a container in Artifact Registry that has the name miktex-image and select the option to use Docker. Then create a cloud run service that selects this container in Artifact Registry as its url. Give both Artifact Registry and Cloud Run unauthenticated invocation access.
3. Have your current working directory contain the Dockerfile, index.js, and package.json files.
2. Use ADC (application default credentials) in your terminal environment which may require you to install google cloud platform onto your envrionment.
3. Enter the following command to push the docker files to your docker desktop and to artifact registry.
4. docker build -t miktex_image .
docker tag miktex_image us-west1-docker.pkg.dev/mondaycsc131/docker-latex/miktex_image
docker push us-west1-docker.pkg.dev/mondaycsc131/docker-latex/miktex_image
5. Open your container and edit/redeploy a new version of it.
6. Click select on the container image url and select your latest version that you've just pushed.
7. Redeploy the Cloud Run Service
