const Product = require('../models/Product');
const { saveImage, deleteImage } = require('../middleware/imageStorage');

function normalizeCode(value) {
  return String(value || '').trim().toUpperCase();
}

async function getProducts(req, res) {
  try {
    const { q } = req.query;
    const filter = {};

    if (q) {
      const regex = new RegExp(String(q).trim(), 'i');
      filter.$or = [
        { code: regex },
        { groupCode: regex },
        { name: regex },
        { description: regex }
      ];
    }

    const products = await Product.find(filter).sort({ groupCode: 1, code: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function addProduct(req, res) {
  try {
    const code = normalizeCode(req.body.code);
    const groupCode = normalizeCode(req.body.groupCode || code.split('-')[0]);
    const name = String(req.body.name || '').trim();
    const description = String(req.body.description || '').trim();
    const mrp = Number(req.body.mrp || req.body.price || 0);
    const price = Number(req.body.price || req.body.mrp || 0);

    if (!code || !groupCode || !name || !description || !mrp) {
      return res.status(400).json({
        message: 'Product code, group code, name, description and MRP are required'
      });
    }

    const existing = await Product.findOne({ code });

    if (existing) {
      return res.status(409).json({ message: 'Product code already exists' });
    }

    const imageData = await saveImage(req.file);

    const product = await Product.create({
      code,
      groupCode,
      name,
      description,
      mrp,
      price,
      ...imageData
    });

    res.status(201).json({ message: 'Product added successfully', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function updateProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const fields = ['name', 'description'];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) product[field] = String(req.body[field]).trim();
    });

    if (req.body.code !== undefined) product.code = normalizeCode(req.body.code);
    if (req.body.groupCode !== undefined) product.groupCode = normalizeCode(req.body.groupCode);
    if (req.body.mrp !== undefined) product.mrp = Number(req.body.mrp);
    if (req.body.price !== undefined) product.price = Number(req.body.price);

    if (req.file) {
      await deleteImage(product);
      const imageData = await saveImage(req.file);
      product.image = imageData.image;
      product.imagePublicId = imageData.imagePublicId;
      product.imageProvider = imageData.imageProvider;
    }

    await product.save();

    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function deleteProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await deleteImage(product);
    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { getProducts, addProduct, updateProduct, deleteProduct };
