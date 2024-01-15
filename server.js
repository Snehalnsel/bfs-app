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
const cookieParser = require('cookie-parser');
const session = require('express-session');
app.use("/public", express.static(path.join(__dirname, "public")));
require('dotenv').config();

app.locals.siteName = "BFS - Bid For Sale";

//database
const mongoose = require("mongoose");
// const dbURI = "mongodb+srv://snigdhoU1:MdzrUIxkbf0CGPhW@cluster0.vwhnn.mongodb.net/ukfitness";
const dbURI = "mongodb+srv://snigdhoU1:MdzrUIxkbf0CGPhW@cluster0.vwhnn.mongodb.net/bfsjalan";

//Firebase DB Details
const getAllOfferHistory = require("./src/models/fireDbServices/getAllOfferHistory");
const getAllDataAsBuyer = require("./src/models/fireDbServices/getAllDataAsBuyer");
const getAllDataAsSeller = require("./src/models/fireDbServices/getAllDataAsSeller");
const checkBidExist = require("./src/models/fireDbServices/checkBidExist");
const insertBidData = require("./src/models/fireDbServices/insertBidData");
const insertBidOfferData = require("./src/models/fireDbServices/insertBidOfferData");
const updateBidData = require("./src/models/fireDbServices/updateBidData");
const updateBidOfferData = require("./src/models/fireDbServices/updateBidOfferData");
const getBidData = require("./src/models/fireDbServices/getBidData");

const UserModel = require("./src/models/api/userModel");

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

app.use(cookieParser());
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
var serv = https.createServer(server_config,app);
global.io = require('socket.io')(serv,{
  cors: {
    origin: "*",
  }
});
//Socket 
const { userJoin, getCurrentUser, userLeave, getRoomUsers} = require("./src/models/socket/socketUser");
const formatMessage = require("./src/utils/messages");
const botName = "Bid Chatbot";

io.on("connection", (socket) => {
  socket.on("joinRoom", async ({ username, currRoom }) => {
    let room = currRoom;
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    //console.log(getRoomUsers(user.room));
    // Welcome current user
    //socket.emit("message", formatMessage(botName, "Welcome to ChatCord!"));

    // Broadcast when a user connects
    /*socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );*/

    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });
  // Listen for chatMessage
  socket.on("chatMessage", async ({username,roomName,msg}) => {
    //const user = getCurrentUser(socket.id);
    //Save data in database
    let bidId = roomName;
    let queryData = {
      id:bidId,
      userId:username
    };
    let bidOldData = await getBidData(queryData);
    bidOldData = bidOldData[0];
    let currIndex = parseInt(bidOldData.currentOffer.offerIndex) + 1;
    const currDateTime = new Date();
    let timeMiliSeccond = currDateTime.valueOf();
    let currentOffer = {
      bidId: bidId,
      createdAt: timeMiliSeccond,
      id:(username == bidOldData.buyerId) ? "offer_buyer_"+currIndex+"_"+queryData.userId+"_"+timeMiliSeccond : "offer_seller_"+currIndex+"_"+queryData.userId+"_"+timeMiliSeccond,
      isFromBuyer:(username == bidOldData.buyerId) ? true: false,
      offerIndex:currIndex,
      price: (msg != "") ? msg : 0,
      status: 0,
      userId: queryData.userId,
    };
    let updateData = {
      //buyerId:queryData.userId,
      buyerId:(bidOldData.buyerId != "") ? bidOldData.buyerId : "",
      id:bidId,
      createdAt: timeMiliSeccond,
      productId: (bidOldData.productId != "") ? bidOldData.productId : "",
      withdrew: false,
      status:1,
      currentOffer: currentOffer,
      sellerId:(bidOldData.sellerId != "") ? bidOldData.sellerId : "",
    }; 
    await updateBidData(updateData,bidId);
    await insertBidOfferData(currentOffer,currentOffer.id);
    let currUserDetails = await UserModel.findOne({_id:username});
    io.to(roomName).emit("message",formatMessage(currUserDetails.name, msg,username, roomName));
  });
  //Get old messages form database
  socket.on("getOldMessages", async ({ roomName,username }) => {
    //const user = getCurrentUser(socket.id);
    const queryData = {
      bidId:roomName
    };
    let allData = await getAllOfferHistory(queryData);
    if(allData.length > 0 ) {
      for(let newElement of allData) {
        let currUserDetails = await UserModel.findOne({_id:newElement.userId});
        io.to(socket.id).emit("message", formatMessage(currUserDetails.name, newElement.price,newElement.userId, roomName));
      }
    }
  });
  // Runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `Other user has left the chat`, user.room)
      );

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});
const https_server = serv.listen(port, function(err){
    console.log(`App listening on port ${port}!`);
});
module.exports = serv;
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
