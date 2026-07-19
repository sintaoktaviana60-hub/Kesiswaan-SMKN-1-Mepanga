const cloudinary = require("cloudinary").v2;
const { IncomingForm } = require("formidable");
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = async (req, res) => {

  if (req.method !== "POST") {
    return res.status(405).json({
      success:false,
      message:"Method Not Allowed"
    });
  }

const form = new IncomingForm({
    multiples: false
});

  form.parse(req, async (err, fields, files) => {

    if(err){
      return res.status(500).json(err);
    }

let file = files.file;

if (Array.isArray(file)) {
    file = file[0];
}

    if(!file){
      return res.status(400).json({
        success:false,
        message:"Tidak ada file."
      });
    }

    try{

      if (!file.filepath) {
    return res.status(400).json({
        success:false,
        message:"File tidak valid."
    });
}

console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);
      const hasil = await cloudinary.uploader.upload(file.filepath,{
        folder:"smkn1mepanga",
        resource_type:"image"
      });

      fs.unlinkSync(file.filepath);

      res.json({
        success:true,
        url:hasil.secure_url
      });

    }catch(e){

      console.log(e);

      res.status(500).json({
        success:false,
        message:e.message
      });

    }

  });

};

module.exports.config = {
  api:{
    bodyParser:false
  }
};