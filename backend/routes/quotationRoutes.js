const router = require('express').Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { createQuotation, getQuotations, getQuotationById, deleteQuotation } = require('../controllers/quotationController');

router.post('/', verifyToken, createQuotation);
router.get('/', verifyToken, getQuotations);
router.get('/:id', verifyToken, getQuotationById);
router.delete('/:id', verifyToken, deleteQuotation);

module.exports = router;
