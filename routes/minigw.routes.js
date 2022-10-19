const express = require("express");
const router = express.Router();
const minigwService = require("../services/redis.services");

// SEND message
router.post("/send", async function (req, res, next) {
  // Get input params from body
  const data = {
    app_id: req.body.app_id,
    SOS: req.body.SOS,
    message: req.body.message,
  };

  // Forward message to sattelite gateway
  const result = await minigwService.saveMessage(data);
  res.json(result);
});

// Get message
router.get("/get/:timestamp", async function (req, res, next) {
  const timestamps = await minigwService.getMessage(req.params.timestamp);
  res.json(timestamps);
});

module.exports = router;
