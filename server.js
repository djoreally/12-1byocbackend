const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary");
const UserHandler = require("./Routes/UserHandler");
const StoreHandler = require("./Routes/StoreHandler");
const BookingHandler = require("./Routes/BookingHandler");
const SubscribeHandler = require("./Routes/subscription");

const OuterApi = require("./Routes/OuterApis");

// initialization
const app = express();
dotenv.config();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

const corsOptions = {
  origin: "*",
};
app.use(cors(corsOptions));
app.use(
  fileUpload({
    useTempFiles: true,
  })
);
cloudinary.config({
  cloud_name: "dif5pfkci",
  api_key: "796545256327366",
  api_secret: "C2ys5VmAJ5QYcB9QeZ00oGElvwg",
  secure: true,
});

// database connection
mongoose
  .connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connection successful"))
  .catch((err) => console.log(err));

// test route
app.get("/", (req, res) => {
  res.send("Hello World! server is alive ");
});

// routes
app.use("/auth", UserHandler);
app.use("/store", StoreHandler);
app.use("/OuterApi", OuterApi);
app.use("/Book", BookingHandler);
app.use("/subscribe", SubscribeHandler);

//  custom error handler
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: err });
};
app.use(errorHandler);

// server listener
app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});
