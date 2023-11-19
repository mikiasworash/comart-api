import asyncHanlder from "express-async-handler";

// @desc Add Order
// router POST /api/order
// @access Private
const addOrder = asyncHanlder(async (req, res) => {});

// @desc Update Order
// router PUT /api/order/:id
// @access Private
const updateOrder = asyncHanlder(async (req, res) => {});

export { addOrder, updateOrder };
