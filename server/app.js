const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const eventRoutes = require("./routes/eventRoutes");

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

app.use("/users", userRoutes);
app.use("/events", eventRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
