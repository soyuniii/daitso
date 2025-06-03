// routes/products.js
const express = require('express');
const router = express.Router();

// 상품 목록
router.get('/', (req, res) => {
  res.render('products'); // products.ejs로 렌더링
});

// 상품 상세 페이지
router.get('/:id', (req, res) => {
  const productId = req.params.id;
  // 실제로는 DB에서 productId로 상품 정보 가져오기
  res.render('detail', { id: productId });
});

module.exports = router;