// cart router (code is implemented in the chat)
const express = require('express');
const router = express.Router();

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../db/database.sqlite');
const db = new sqlite3.Database(dbPath);

// routes/cart.js - 장바구니 관련 라우트 추가
router.get('/', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/user/login');
    }
    console.log('현재 세션 userId:', req.session.userId);

    db.all(`
        SELECT c.id, c.quantity, p.* 
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
    `, [req.session.userId], (err, cartItems) => {
        if (err) {
            console.error(err);
            return res.status(500).send('서버 오류');
        }
        console.log('가져온 장바구니:', cartItems);

        const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingFee = totalPrice > 30000 ? 0 : 2500; // 3만원 이상 구매 시 무료 배송 예시

        res.render('cart', { cartItems, totalPrice, shippingFee });
    });
});

router.put('/update/:id', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: '로그인이 필요합니다.' });
    }

    const { quantity } = req.body;
    
    db.run(
        'UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
        [quantity, req.params.id, req.session.userId],
        function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: '업데이트 실패' });
            }
            res.json({ success: true, message: '수량이 변경되었습니다.' });
        }
    );
});

router.delete('/remove/:id', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: '로그인이 필요합니다.' });
    }

    db.run(
        'DELETE FROM cart WHERE id = ? AND user_id = ?',
        [req.params.id, req.session.userId],
        function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: '삭제 실패' });
            }
            res.json({ success: true, message: '삭제되었습니다.' });
        }
    );
});

module.exports = router;