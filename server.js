const express = require("express");
const app = express();
var http = require('http');
var https = require('https');
var fs = require("fs");
const port = 3000;
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const nodemailer = require("nodemailer");
var path = require("path");
app.use("/public", express.static(path.join(__dirname, "public")));

app.locals.siteName = "BFS - Bid For Sale";

//database
const mongoose = require("mongoose");
// const dbURI = "mongodb+srv://snigdhoU1:MdzrUIxkbf0CGPhW@cluster0.vwhnn.mongodb.net/ukfitness";
const dbURI = "mongodb+srv://snigdhoU1:MdzrUIxkbf0CGPhW@cluster0.vwhnn.mongodb.net/bfsjalan";

app.use(express.json());

mongoose.set("strictQuery", true);
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
mongoose.Promise = global.Promise;

db.on("error", (err) => {
  console.error(err);
});
db.once("open", () => {
  // console.log(db);
  console.log("DB started successfully");
});

// set the view engine to ejs
// app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");

// adding Helmet to enhance your API's security
// app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", "https: data:"],
      fontSrc: ["'self'", "https: data:"],
      imgSrc: ["'self'", "https: data:"],
      scriptSrc: ["'self'", "https: data:"],
      styleSrc: ["'self'", "https: data:"],
      frameSrc: ["'self'", "https: data:"],
      // upgradeInsecureRequests: null
    },
    reportOnly: true, // Set to 'true' to enable report-only mode
  })
);
// using bodyParser to parse JSON bodies into JS objects
// app.use(bodyParser.json());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
// enabling CORS for all requests

// var corsOptions = {
//   origin: "http://dev.solutionsfinder.co.uk/"
// };
// app.use(cors(corsOptions));

// app.options('*', cors());
app.use(cors());
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
//   );
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PUT, DELETE, PATCH, OPTIONS"
//   );
//   res.setHeader("Cross-origin-Embedder-Policy", "require-corp");
//   res.setHeader("Cross-origin-Opener-Policy", "same-origin");

//   if (req.method === "OPTIONS") {
//     res.sendStatus(200);
//   } else {
//     next();
//   }
// });

// adding morgan to log HTTP requests
app.use(morgan("combined"));

//routes

var routes = require("./src/routes/routes.js");
var web = require("./src/routes/web.js");
var api = require("./src/routes/api.js");

app.use("/", web);
app.use("/api", api);
app.use("/routes", routes); //test

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   var err = new Error("Not Found");
//   err.status = 404;
//   next(err);
// });

const checkFileType = function (file, cb) {
  //Allowed file extensions
  const fileTypes = /jpeg|jpg|png|gif|svg/;

  //check extension names
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

  const mimeType = fileTypes.test(file.mimetype);

  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb("Error: You can Only Upload Images!!");
  }
};


// file location of private key
var privateKey = fs.readFileSync( 'ssl/private3.key' );

// file location of SSL cert 
var certificate = fs.readFileSync( 'ssl/certificate2.crt' );

// set up a config object
var server_config = {
    key : privateKey,
    cert: certificate,
     location : {
            proxy_pass : 'http://127.0.0.1:${port}/',
    }
};

// create the HTTPS server on port 443
var https_server = https.createServer(server_config, app).listen(port, function(err){
    console.log(`App listening on port ${port}!`);
});

// create an HTTP server on port 80 and redirect to HTTPS 
// var http_server = http.createServer(function(req,res){    
//     // 301 redirect (reclassifies google listings)
//     res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
//     res.end();
// }).listen(80, function(err){
//     console.log("Node.js Express HTTPS Server Listening on Port 80");    
// });



// app.listen(port, () => console.log(`App listening on port ${port}!`));
 
//Snigdho Upadhyay
