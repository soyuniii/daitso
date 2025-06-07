// routes/products.js
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/database.sqlite');

// 전체 상품 페이지
    router.get('/', (req, res) => {
    db.all('SELECT * FROM products', (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).send('상품 목록을 불러오는 중 오류가 발생했습니다.');
        }
    res.render('products', { products: rows });
    });
  });
  
  // 상품 상세보기
  router.get('/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    db.get('SELECT * FROM products WHERE id = ?', [productId], (err, row) => {
        if (err) {
          console.error(err);
          return res.status(500).send('상품을 불러오는 중 오류가 발생했습니다.');
        }
        if (!row) {
          return res.status(404).send('상품을 찾을 수 없습니다.');
        }
    res.render('products_detail', { product: row });
    });
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