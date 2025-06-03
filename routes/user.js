const express = require('express');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();
const dbPath = path.join(__dirname, '../db/database.sqlite');
const db = new sqlite3.Database(dbPath);

// 회원가입 페이지
router.get('/register', (req, res) => {
    res.render('register');
});

// 회원가입 처리
router.post('/register', async (req, res) => {
    const { username, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

        // 회원가입 시 필수 필드 확인
    if (!username || !password || !name) {
        return res.status(400).send('모든 필드를 입력해주세요.');
    }

        // 회원가입 시 중복 확인
    db.get('SELECT id FROM users WHERE username = ?', [username], (err, row) => {
        if (row) {
        return res.send('이미 존재하는 사용자명입니다.');
        }
        // ...회원가입 처리 계속
    });

    // 회원가입 처리
    db.run(
        'INSERT INTO users (username, password, name) VALUES (?, ?, ?)',
        [username, hashedPassword, name],
        function(err) {
            if (err) {
                db.run('ROLLBACK');
                throw err;
            }
            
            db.run('COMMIT');
            req.session.userId = this.lastID;
            req.session.username = username;
            res.redirect('/');
        }
    );
});

// 로그인 페이지
router.get('/login', (req, res) => {
    res.render('login');
});

// 로그인 처리 (개선된 버전)
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.render('login', { error: '아이디와 비밀번호를 입력해주세요.' });
    }

    try {
        db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
            if (err) throw err;
            
            if (!user) {
                return res.render('login', {
                    error: '아이디 또는 비밀번호가 잘못되었습니다.'
                });
            }
            
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                req.session.userId = user.id;
                req.session.username = user.username;
                return res.redirect('/');
            } else {
                res.render('login', {
                    error: '아이디 또는 비밀번호가 잘못되었습니다.'
                });
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('login', {
            error: '로그인 처리 중 오류가 발생했습니다.'
        });
    }
});

// 로그아웃
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
