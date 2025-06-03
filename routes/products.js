// routes/products.js
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/database.sqlite');

// 더미 상품 데이터
const products = [
    { id: 1, name: '나는야 감자빵', desc: '국내산 감자, 앙금, 찹쌀', price: '₩3,000' },
    { id: 2, name: '내고향 고구마빵', desc: '국내산 고구마, 앙금, 찹쌀', price: '₩3,500' },
    { id: 3, name: '내고향 밤빵', desc: '국내산 밤, 앙금, 찹쌀', price: '₩3,500' },
    { id: 4, name: '내고향 옥수수빵', desc: '강원도 미백 찰옥수수', price: '₩4,000' },
    { id: 5, name: '내고향 마늘빵', desc: '국내산 마늘, 치즈, 찹쌀', price: '₩5,000' },
    { id: 6, name: '내고향 대파빵', desc: '국내산 대파, 치즈, 찹쌀', price: '₩5,000' },
  ];

// 전체 상품 페이지
    router.get('/', (req, res) => {
    res.render('products', { products });
  });
  
  // 상품 상세보기
  router.get('/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);
  
    if (!product) {
      return res.status(404).send('상품을 찾을 수 없습니다.');
    }
  
    res.render('products_detail', { product });
  });

  // 위시리스트 추가
router.post('/wishlist/add', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: '로그인이 필요합니다.' });
    }

    const { productId } = req.body;
    
    db.run(
        'INSERT OR IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)',
        [req.session.userId, productId],
        function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: '위시리스트 추가 실패' });
            }
            res.json({ success: true, message: '위시리스트에 추가되었습니다.' });
        }
    );
});

// 장바구니 추가
router.post('/cart/add', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: '로그인이 필요합니다.' });
    }

    const { productId, quantity } = req.body;
    
    // 기존에 같은 상품이 있는지 확인
    db.get(
        'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?',
        [req.session.userId, productId],
        (err, row) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: '장바구니 추가 실패' });
            }

            if (row) {
                // 이미 있는 상품이면 수량 업데이트
                const newQuantity = row.quantity + parseInt(quantity);
                db.run(
                    'UPDATE cart SET quantity = ? WHERE id = ?',
                    [newQuantity, row.id],
                    function(updateErr) {
                        if (updateErr) {
                            console.error(updateErr);
                            return res.status(500).json({ success: false, message: '장바구니 업데이트 실패' });
                        }
                        res.json({ success: true, message: '장바구니가 업데이트되었습니다.' });
                    }
                );
            } else {
                // 새 상품 추가
                db.run(
                    'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
                    [req.session.userId, productId, quantity],
                    function(insertErr) {
                        if (insertErr) {
                            console.error(insertErr);
                            return res.status(500).json({ success: false, message: '장바구니 추가 실패' });
                        }
                        res.json({ success: true, message: '장바구니에 추가되었습니다.' });
                    }
                );
            }
        }
    );
});
  

module.exports = router;