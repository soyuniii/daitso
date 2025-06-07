const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../db/database.sqlite');
const db = new sqlite3.Database(dbPath);

router.post('/confirm', (req, res) => {
    const userId = req.session.userId;
    const userName = req.session.name;
    if (!userId) return res.redirect('/login');

    const query = `SELECT COUNT(*) AS count FROM cart WHERE user_id = ?`;

    db.get(query, [userId], (err, row) => {
        if (err) return res.status(500).send('DB 오류: 장바구니 확인 실패');

        if (row.count === 0) {
            return res.render('order_confirm', {
                userName,
                error: '장바구니가 비어 있어 주문할 수 없습니다.',
            });
        }

        res.render('order_confirm', { userName });
    });
});



module.exports = router;