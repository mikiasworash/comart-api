import asyncHanlder from "express-async-handler";
import axios from "axios";
import { Chapa } from "chapa-nodejs";

const chapa = new Chapa({
  secretKey: process.env.chapaSecretKey,
});

const payment = asyncHanlder(async (req, res) => {
  req.body.tx_ref = await chapa.generateTransactionReference({
    prefix: "TX",
    size: 20,
  });
  try {
    const apiResponse = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      req.body,
      {
        headers: {
          Authorization: `Bearer ${process.env.chapaSecretKey}`,
        },
      }
    );

    return res.status(201).json(apiResponse.data);
  } catch (error) {
    res.status(500);
    throw new Error("Payment failed");
  }
});

export { payment };
