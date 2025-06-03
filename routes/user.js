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
    
    // 입력값 검증
    if (!username || !password || !name) {
        return res.status(400).render('register', { 
            message: '모든 필드를 입력해주세요.',
            messageType: 'error',
            formData: req.body
        });
    }

    try {
        // 중복 확인
        db.get('SELECT id FROM users WHERE username = ?', [username], async (err, row) => {
            if (err) {
                console.error(err);
                return res.status(500).render('register', {
                    message: '서버 오류가 발생했습니다.',
                    messageType: 'error',
                    formData: req.body
                });
            }
            
            if (row) {
                return res.render('register', {
                    message: '이미 사용 중인 아이디입니다.',
                    messageType: 'error',
                    formData: req.body
                });
            }
            
            const hashedPassword = await bcrypt.hash(password, 10);
            
            db.run(
                'INSERT INTO users (username, password, name) VALUES (?, ?, ?)',
                [username, hashedPassword, name],
                function(err) {
                    if (err) {
                        console.error(err);
                        return res.status(500).render('register', {
                            message: '회원가입 처리 중 오류가 발생했습니다.',
                            messageType: 'error',
                            formData: req.body
                        });
                    }
                    
                    // 회원가입 성공 시 로그인 처리
                    req.session.userId = this.lastID;
                    req.session.username = username;
                    return res.render('register', {
                        message: '회원가입이 완료되었습니다! 자동으로 로그인되었습니다.',
                        messageType: 'success'
                    });
                }
            );
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('register', {
            message: '회원가입 처리 중 오류가 발생했습니다.',
            messageType: 'error',
            formData: req.body
        });
    }
});

// 로그인 페이지
router.get('/login', (req, res) => {
    res.render('login');
});

// 로그인 처리 (개선된 버전)
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).render('login', {
            message: '아이디와 비밀번호를 입력해주세요.',
            messageType: 'error'
        });
    }

    try {
        db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
            if (err) {
                console.error(err);
                return res.status(500).render('login', {
                    message: '로그인 처리 중 오류가 발생했습니다.',
                    messageType: 'error'
                });
            }
            
            if (!user) {
                return res.render('login', {
                    message: '아이디 또는 비밀번호가 잘못되었습니다.',
                    messageType: 'error',
                    formData: { username }
                });
            }
            
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                req.session.userId = user.id;
                req.session.username = user.username;
                return res.render('login', {
                    message: '로그인 성공! 잠시 후 홈으로 이동합니다.',
                    messageType: 'success'
                });
            } else {
                return res.render('login', {
                    message: '아이디 또는 비밀번호가 잘못되었습니다.',
                    messageType: 'error',
                    formData: { username }
                });
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('login', {
            message: '로그인 처리 중 오류가 발생했습니다.',
            messageType: 'error'
        });
    }
});

// 로그아웃
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
