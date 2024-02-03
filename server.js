import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
const port = process.env.PORT || 5000;

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import colors from "colors";

// routes
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

// security packages
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import xss from "xss-clean";
import { rateLimit } from "express-rate-limit";
import hpp from "hpp";
import cors from "cors";

// connect to the database
connectDB();

// create an instance of the express app
const app = express();

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cookie parser
app.use(cookieParser());

// sanitize data
app.use(mongoSanitize());

// set security headers
app.use(helmet());

// prevent XSS (cross-site scripting) attacks
app.use(xss());

// set rate limit options
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
});

// apply the limit to control number of requests a client (ip address)
// can make within a specified time frame
app.use(limiter);

// prevent http parameter pollution (hpp)
app.use(hpp());

// enable CORS for all routes
app.use(cors());

// mount routers
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/messages", messageRoutes);

// add middleware functions
app.use(notFound);
app.use(errorHandler);

// start the server
app.listen(port, () => console.log(`Server listening on ${port}`.yellow.bold));
