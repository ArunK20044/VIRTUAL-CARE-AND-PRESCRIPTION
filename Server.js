const express = require("express");
const connectDB = require("./backend/config/db");
const bodyParser = require("body-parser");
const cors = require("cors");

const DoctorRoutes = require("./backend/routes/DoctorRoute.js");
const PatientRoutes = require("./backend/routes/PatientRoutes.js");

connectDB();
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/api/v1/doctors", DoctorRoutes);
app.use("/api/v1/patients", PatientRoutes);

app.listen(8000, () => {
  console.log("Server Working");
});
