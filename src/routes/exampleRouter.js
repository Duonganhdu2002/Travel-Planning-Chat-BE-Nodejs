const express = require("express");
const Product = require("../models/productModel");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Get method");
});

router.post("/", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
