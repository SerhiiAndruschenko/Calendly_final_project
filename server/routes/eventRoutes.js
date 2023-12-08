const express = require("express");
const controllers = require("../controllers/controllers");

const router = express.Router();
const eventsFilePath = "data/events.json";

router.get("/", async (req, res) => {
  await controllers.getItems(eventsFilePath, res, "events");
});

router.post("/", async (req, res) => {
  await controllers.addItem(eventsFilePath, req.body, res, "events");
});

router.get("/:id", async (req, res) => {
  await controllers.getItem(eventsFilePath, req.params.id, res, "events");
});

router.put("/:id", async (req, res) => {
  await controllers.updateItem(
    eventsFilePath,
    req.params.id,
    req.body,
    res,
    "events"
  );
});

module.exports = router;
