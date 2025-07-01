const DoctorModel = require("../models/DoctorModel.js");

exports.registerDoctor = async (req, res) => {
  try {
    const { name, email, password, speciality, image } = req.body;
    if (!name || !email || !password || !speciality || !image) {
      return res.status(400).send({
        message: "Please fill all fileds",
        success: false,
      });
    }
    const existingdoctor = await DoctorModel.findOne({ email });
    if (existingdoctor) {
      return res.status(401).send({
        message: "Doctor already exists",
        success: false,
      });
    }
    const doctor = new DoctorModel({
      name,
      email,
      password,
      speciality,
      image,
    });
    await doctor.save();
    return res.status(201).send({
      message: "Doctor created succesfully",
      success: true,
      doctor,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Error creating doctor",
      success: false,
      error,
    });
  }
};

exports.loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(500).send({
        message: "Please fill all fields",
        success: false,
      });
    }
    const doctor = await DoctorModel.findOne({ email });
    if (!doctor) {
      return res.status(500).send({
        message: "Doctor dosent exists",
        success: false,
      });
    }

    if (password != doctor.password) {
      return res.status(500).send({
        message: "Password do not match",
        success: false,
      });
    }
    return res.status(200).send({
      message: "Doctor login succesfull",
      success: true,
      doctor,
    });
  } catch (error) {
    console.log(error);
    return res.status(501).send({
      message: "Doctor login failed",
      success: false,
      error,
    });
  }
};

exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await DoctorModel.find({});
    return res.status(200).send({
      totalDoctors: doctors.length,
      message: "All Doctors",
      success: true,
      doctors,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Error getting doctors",
      success: false,
      error,
    });
  }
};

exports.getSingleDoc = async (req, res) => {
  try {
    const { doctorID } = req.body;
    const doctor = await DoctorModel.findById(doctorID).populate(
      "appointments"
    );
    if (!doctor) {
      return res.status(400).send({
        message: "Doctor not present",
        success: false,
      });
    }
    return res.status(200).send({
      message: "Doctor fetched sucessfully",
      success: true,
      doctor,
    });
  } catch (error) {
    return res.status(400).send({
      message: "Error getting the doc",
      success: false,
      error,
    });
  }
};

exports.getDocForAppointment = async (req, res) => {
  try {
    const { doctorID, patientID } = req.body;
    if (!doctorID || !patientID) {
      return res.status(400).send({
        message: "Please provide ID's",
        success: false,
      });
    }
    const doctor = await DoctorModel.findById(doctorID);
    doctor.appointments.push(patientID);
    await doctor.save();
    res.status(200).send({
      message: "Appointment sucess",
      success: "True",
      doctor,
    });
  } catch (error) {
    res.status(500).send({
      message: "Error getting appointment",
      success: false,
      error,
    });
  }
};

exports.createReport = async (req, res) => {
  try {
    const {
      doctorID,
      BP,
      weight,
      height,
      sugar,
      surgeries,
      heartrate,
      pulserate,
      image,
      name,
      patientID,
    } = req.body;
    let doctor = await DoctorModel.findByIdAndUpdate(
      doctorID,
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
            name: name,
            patientID: patientID,
          },
        },
      },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).send({
        message: "Dcotor not found",
        success: false,
      });
    }

    await doctor.save();
    return res.status(200).send({
      message: "Report created successfully",
      success: true,
      doctor,
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
