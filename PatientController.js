const PatientModel = require("../models/PatientModel");

exports.registerPatient = async (req, res) => {
  try {
    const { name, adhaarno, password, email } = req.body;
    if (!name || !adhaarno || !password) {
      return res.status(400).send({
        message: "Please fill all fileds",
        success: false,
      });
    }
    const existingpatient = await PatientModel.findOne({ adhaarno });
    if (existingpatient) {
      return res.status(401).send({
        message: "User already exists",
        success: false,
      });
    }
    const patient = new PatientModel({ name, adhaarno, password, email });
    await patient.save();
    return res.status(201).send({
      message: "Patient created succesfully",
      success: true,
      patient,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Error creating patient",
      success: false,
      error,
    });
  }
};

exports.loginPatient = async (req, res) => {
  try {
    const { adhaarno, password } = req.body;
    if (!adhaarno || !password) {
      return res.status(500).send({
        message: "Please fill all fields",
        success: false,
      });
    }
    const patient = await PatientModel.findOne({ adhaarno });
    if (!patient) {
      return res.status(500).send({
        message: "User dosent exists",
        success: false,
      });
    }

    if (password != patient.password) {
      return res.status(500).send({
        message: "Password do not match",
        success: false,
      });
    }
    return res.status(200).send({
      message: "User login succesfull",
      success: true,
      patient,
    });
  } catch (error) {
    console.log(error);
    return res.status(501).send({
      message: "User login failed",
      success: false,
      error,
    });
  }
};

exports.getAllPatients = async (req, res) => {
  try {
    const patients = await PatientModel.find({});
    res.status(200).send({
      totalPatients: patients.length,
      message: "All patients",
      success: true,
      patients,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error getting patients",
      success: false,
      error,
    });
  }
};

exports.getSinglePatient = async (req, res) => {
  try {
    const { patientID } = req.body;
    const patient = await PatientModel.findById(patientID);
    if (!patient) {
      return res.status(400).send({
        message: "Error getting pateint",
        success: false,
      });
    }
    return res.status(200).send({
      message: "Patient fetched sucessfully",
      success: true,
      patient,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Error getting patient",
      success: false,
      error,
    });
  }
};

exports.createPresecreption = async (req, res) => {
  try {
    const { patientID, docname, note, medicine } = req.body;
    const patient = await PatientModel.findByIdAndUpdate(
      patientID,
      {
        $push: {
          prescription: {
            docname: docname,
            note: note,
            medicine: medicine,
          },
        },
      },
      { new: true }
    );
    await patient.save();
    return res.status(200).send({
      message: "Precription created sucessfully",
      success: true,
      patient,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Error creating presecription",
      success: false,
      error,
    });
  }
};

exports.createReport = async (req, res) => {
  try {
    const {
      patientID,
      BP,
      weight,
      height,
      sugar,
      surgeries,
      heartrate,
      pulserate,
      image,
    } = req.body;
    let patient = await PatientModel.findByIdAndUpdate(
      patientID,
      {
        $push: {
          reports: {
            BP: BP,
            weight: weight,
            height: height,
            sugar: sugar,
            surgeries: surgeries,
            heartrate: heartrate,
            pulserate: pulserate,
            image: image,
          },
        },
      },
      { new: true }
    );

    if (!patient) {
      return res.status(404).send({
        message: "Patient not found",
        success: false,
      });
    }

    await patient.save();
    return res.status(200).send({
      message: "Report created successfully",
      success: true,
      patient,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Error creating report",
      success: false,
      error,
    });
  }
};
