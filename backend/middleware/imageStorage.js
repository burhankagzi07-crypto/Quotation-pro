const fs = require('fs');
const path = require('path');
const streamifier = require('streamifier');
const { cloudinary, hasCloudinaryConfig } = require('../config/cloudinary');

function uploadBufferToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
}

async function saveImage(file) {
  if (!file) {
    return { image: '', imagePublicId: '', imageProvider: '' };
  }

  if (hasCloudinaryConfig()) {
    const result = await uploadBufferToCloudinary(
      file.buffer,
      process.env.CLOUDINARY_FOLDER || 'plumber-products'
    );

    return {
      image: result.secure_url,
      imagePublicId: result.public_id,
      imageProvider: 'cloudinary'
    };
  }

  const uploadDir = path.join(__dirname, '..', 'uploads');
  fs.mkdirSync(uploadDir, { recursive: true });

  const extension = path.extname(file.originalname) || '.jpg';
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
  const filePath = path.join(uploadDir, filename);

  fs.writeFileSync(filePath, file.buffer);

  return {
    image: `/uploads/${filename}`,
    imagePublicId: filename,
    imageProvider: 'local'
  };
}

async function deleteImage(product) {
  if (!product || !product.imagePublicId) return;

  if (product.imageProvider === 'cloudinary' && hasCloudinaryConfig()) {
    await cloudinary.uploader.destroy(product.imagePublicId);
    return;
  }

  if (product.imageProvider === 'local') {
    const localPath = path.join(__dirname, '..', 'uploads', product.imagePublicId);
    if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
  }
}

module.exports = { saveImage, deleteImage };
