const express = require("express");
const controllers = require("../controllers/controllers");

const router = express.Router();
const usersFilePath = "data/users.json";

router.get("/", async (req, res) => {
  await controllers.getItems(usersFilePath, res, "users");
});

router.post("/", async (req, res) => {
  await controllers.addItem(usersFilePath, req.body, res, "users");
});

router.put("/:id", async (req, res) => {
  await controllers.updateItem(
    usersFilePath,
    req.params.id,
    req.body,
    res,
    "users"
  );
});

module.exports = router;
