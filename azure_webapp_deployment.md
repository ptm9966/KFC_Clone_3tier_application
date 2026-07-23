1) Create Mongodb in portal azure documentdb for mongodb
1) create app service plan in azure portal . select linux 
2)create kfc-backend web app with linux 
3) create  kfc-frontend web app with linux

---------- MongoDB setup in azure portal documentdb for mongodb-----
1) Create a new MongoDB database in Azure Cosmos DB (DocumentDB API for MongoDB).
2) Note down the connection string provided by Azure Cosmos DB for your MongoDB database. It will be used in the backend configuration.
3) connect to Mongodb database using MongoDB Compass or any other MongoDB client to verify that the database is accessible.
5) update producst list in the database using MongoDB Compass or any other MongoDB client.

--------------- kfc-backend web app setup in azure portal -------------------
1) In the Azure portal, navigate to the "App Services" section and select your kfc-backend web app.
2) In the left-hand menu, select "Configuration" under the "Settings" section.
3) Add the following application settings (environment variables) in the Configuration section:
   - PORT: 8080
   - DB_URL: <Your MongoDB connection string from Azure Cosmos DB>
   - FRONTEND_URL: <Your kfc-frontend web app URL>  
4) Save the configuration changes.
5) In the left-hand menu, development tools section you can select advanced tools (Kudu) to access the Kudu console for your web app.
6) In the Kudu console, navigate to deployment . you can upload the backend code using zip deploy or any other deployment method supported by Azure App Service.
7) APP SERVICE will automatically install the dependencies and start the application using the specified PORT and DB_URL environment variables.
7) for node.js application there is no build step required. The application will run directly from the uploaded code. 
8) zip the backend code and upload it to the kfc-backend web app using the Kudu console or any other deployment method supported by Azure App Service.

----------------- kfc-frontend web app setup in azure portal -------------------.
 we have two options to deploy the frontend code to the kfc-frontend web app:
   - Option 1: Use Azure App Service advanced tools (Kudu) to upload the frontend code directly to the web app.
   - build the frontend code using npm run build and then upload the build folder to the kfc-frontend web app using Kudu or any other deployment method supported by Azure App Service.

######## option1 #####
   
1) In the left-hand menu, select "Configuration" under the "Settings" section.
2) Add the following application settings (environment variables) in the Configuration section:
   - BACKEND_URL: <Your kfc-backend web app URL>
3) upload the frontend code to kudu console or any other deployment method supported by Azure App Service. it will build the frontend code and serve it from the kfc-frontend web app.(npm install and then npm run build will be executed automatically by the App Service)

##### option2 #####
1) we need to build the frontend code locally before deploying it to the kfc-frontend web app.
2) Open the frontend folder in your local development environment.
3) .env file and add the following environment variable:
   - REACT_APP_BACKEND_URL=<Your kfc-backend web app URL>
4) Run the following command  npm install --legacy-peer-deps to install the dependencies.
5) Run the following command npm run build to create a production-ready build of the frontend code.
6) we can't pass backend_url as environment variable in the azure portal for frontend code. so we need to update the REACT_APP_BACKEND_URL in the build folder before deploying it to the kfc-frontend web app.
7) zip the build folder and upload it to the kfc-frontend web app using Kudu or any other deployment method supported by Azure App Service. The frontend code will be served from the kfc-frontend web app.
8) in genral setting update the startup command to serve the frontend code using a static file server like serve or any other static file server of your choice. For example, you can use the following command:
   - pm2 serve /home/site/wwwroot --no-daemon --spa 

--------------------------------  Private Connection steup (private Endpoint)-------------------

#############################  Mongodb private endpoint #################

add privatend point to monodb . it will private link and nic card . block the other access.


################### kfc-backend vnet integration################
under networking add vnet integration to seprate subnet . it will able to connect to database
added privatendpoint so that we can block the inbound access and disable public access

if you like to access from another vm like jump host from another vnet
1) make vnet peering and add vnet link in private dns zone  then it will be access .


################### kfc-frontend private endpoint and vnet integration ################

1) adding vnet integration from networking . when disable the privatendpoint .
important : frontend unable to access backend website .it won't load /menu becuase fronten runs on web browser it unable to reach to backend . public IP unable to access.

2) After adding privte endpint . we are able to access backend /menu .

When you run Inside network it resloves privte IP adress , able access backend

when you run outside network it resolves public IP address . unable to access .
S
This whole act as Internal application.

#############################################################################