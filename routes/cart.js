// cart router (code is implemented in the chat)
const express = require('express');
const router = express.Router();

// 장바구니 페이지
router.get('/', (req, res) => {
  res.render('cart', {
    items: [
      { id: 1, name: '상추 1kg', price: 3500, quantity: 2 },
      { id: 2, name: '깻잎 500g', price: 2800, quantity: 1 }
    ],
    total: 9800
  });
});

module.exports = router;