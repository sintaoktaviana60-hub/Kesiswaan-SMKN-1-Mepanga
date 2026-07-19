const cloudinary = require("cloudinary").v2;
const { IncomingForm } = require("formidable");
const fs = require("fs");
const path = require("path");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method Not Allowed"
    });
  }

  // Set lokasi upload ke folder /tmp yang diizinkan oleh Vercel Serverless
  const form = new IncomingForm({
    multiples: false,
    uploadDir: "/tmp",
    keepExtensions: true
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    // Mengatasi perbedaan struktur data formidable di serverless
    let file = files.file;
    if (Array.isArray(file)) {
      file = file[0];
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada file yang diterima."
      });
    }

    // Formidable versi baru menggunakan filepath, versi lama menggunakan path
    const pathFile = file.filepath || file.path;

    if (!pathFile) {
      return res.status(400).json({
        success: false,
        message: "Jalur file (filepath) tidak valid."
      });
    }

    try {
      // Proses upload ke Cloudinary
      const hasil = await cloudinary.uploader.upload(pathFile, {
        folder: "smkn1mepanga",
        resource_type: "image"
      });

      // Hapus berkas sementara setelah sukses diunggah
      if (fs.existsSync(pathFile)) {
        fs.unlinkSync(pathFile);
      }

      return res.json({
        success: true,
        url: hasil.secure_url
      });

    } catch (e) {
      console.error("Cloudinary Error:", e);
      return res.status(500).json({
        success: false,
        message: e.message
      });
    }
  });
};

module.exports.config = {
  api: {
    bodyParser: false
  }
};