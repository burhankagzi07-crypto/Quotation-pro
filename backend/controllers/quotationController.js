const Counter = require('../models/Counter');
const Product = require('../models/Product');
const Quotation = require('../models/Quotation');

async function getNextQuotationId() {
  const counter = await Counter.findOneAndUpdate(
    { name: 'quotation' },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  return `QTN-${String(counter.value).padStart(4, '0')}`;
}

function calculateItem(item, product) {
  const quantity = Math.max(Number(item.quantity || 1), 1);
  const mrp = Number(item.mrp ?? product?.mrp ?? product?.price ?? 0);
  const discount = Math.min(Math.max(Number(item.discount || 0), 0), 100);
  const gross = quantity * mrp;
  const netPrice = gross * (1 - discount / 100);

  return {
    productId: item.productId,
    code: item.code || product?.code || '',
    image: item.image || product?.image || '',
    description: item.description || product?.description || '',
    quantity,
    mrp,
    discount,
    netPrice: Number(netPrice.toFixed(2))
  };
}

async function createQuotation(req, res) {
  try {
    const { customerName, products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Add at least one product' });
    }

    const quotationItems = [];
    let subtotal = 0;
    let discountAmount = 0;
    let totalAmount = 0;

    for (const item of products) {
      const product = item.productId ? await Product.findById(item.productId) : null;
      const calculated = calculateItem(item, product);
      const gross = calculated.quantity * calculated.mrp;
      const discount = gross * (calculated.discount / 100);

      subtotal += gross;
      discountAmount += discount;
      totalAmount += calculated.netPrice;
      quotationItems.push(calculated);
    }

    const quotation = await Quotation.create({
      quotationId: await getNextQuotationId(),
      userId: req.user.id,
      customerName: customerName || 'N/A',
      products: quotationItems,
      subtotal: Number(subtotal.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2))
    });

    res.status(201).json({ message: 'Quotation created successfully', quotation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getQuotations(req, res) {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user.id };

    const quotations = await Quotation.find(filter)
      .populate('userId', 'name email role')
      .populate('products.productId')
      .sort({ createdAt: -1 });

    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getQuotationById(req, res) {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('userId', 'name email role')
      .populate('products.productId');

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    if (req.user.role !== 'admin' && String(quotation.userId._id) !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function deleteQuotation(req, res) {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    if (req.user.role !== 'admin' && String(quotation.userId) !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Quotation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Quotation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { createQuotation, getQuotations, getQuotationById, deleteQuotation };
