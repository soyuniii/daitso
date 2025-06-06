const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();
const dbPath = path.join(__dirname, '../db/database.sqlite');
const db = new sqlite3.Database(dbPath);

const fs = require('fs');
const multer = require('multer');

// 파일 업로드 설정 (한글 파일명 지원)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../public/uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const safeFileName = Date.now() + '-' + originalName.replace(/[^a-zA-Z0-9가-힣._-]/g, '_');
        cb(null, safeFileName);
    }
});

const upload = multer({ storage: storage });


// 게시글 목록
router.get('/', (req, res) => {
    db.all(`
        SELECT id, title, author, content, file_path, created_at
        FROM notices
        ORDER BY created_at DESC
    `, [], (err, posts) => {
        const username = req.session.username;
        if (err) return res.send('목록 불러오기 실패');
        if (!username) return res.redirect('/login');
        res.render('notice', { title: '공지사항', posts, username });
    });
});

// 글쓰기 폼 수정
router.get('/new', (req, res) => {
    res.render('post_notice', { post: null, session: req.session, username: req.session.username || null });
});


//글쓰기 처리 + 파일 업로드
router.post('/new', upload.single('attachment'), (req, res) => {
    const { title, content } = req.body;
    const filePath = req.file ? `/uploads/${req.file.filename}` : null;
    const author = req.session.username || '익명';

    db.run(
        'INSERT INTO notices (author, title, content, file_path, created_at) VALUES (?, ?, ?, ?, datetime("now"))',
        [author, title, content, filePath],
        function (err) {
            if (err) {
                if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            console.error(err);
            return res.send('작성 실패');
        }
            res.redirect('/notice');
        }
    );
});



// 상세 보기에서 파일 보여주기
router.get('/view/:id', (req, res) => {
    const postId = req.params.id;

    db.get('SELECT * FROM notices WHERE id = ?', [postId], (err, post) => {
        if (err || !post) return res.send('글 없음');

        db.all('SELECT * FROM files WHERE post_id = ?', [postId], (ferr, files) => {
            res.render('detail', { post, files, isNotice: true, username: req.session.username || null });
        });
    });
});


// 수정 폼
router.get('/edit/:id', (req, res) => {
    db.get('SELECT * FROM notices WHERE id = ?', [req.params.id], (err, post) => {
        if (err || !post) return res.send('글 없음');
        res.render('post_notice',{ post ,session: req.session, username: req.session.username || null})
    });
});

router.post('/edit/:id', upload.single('attachment'), (req, res) => {
    const { title, content } = req.body;
    const filePath = req.file ? `/uploads/${req.file.filename}` : null;
    console.log(req.file);
    console.log('filePath:', filePath);

    if (filePath) {
        // 파일도 수정한 경우
        db.run(
            'UPDATE notices SET title = ?, content = ?, file_path = ? WHERE id = ?',
            [title, content, filePath, req.params.id],
            (err) => {
                if (err) return res.send('수정 실패');
                res.redirect('/notice/view/' + req.params.id);
            }
        );
    } else {
        // 파일 수정 안 했을 경우
        db.run(
            'UPDATE notices SET title = ?, content = ? WHERE id = ?',
            [title, content, req.params.id],
            (err) => {
                if (err) return res.send('수정 실패');
                res.redirect('/notice/view/' + req.params.id);
            }
        );
    }
});
// 삭제
router.get('/delete/:id', (req, res) => {
    const postId = req.params.id;
    const currentUser = req.session.username;

    // 먼저 파일 경로 확인
    db.get('SELECT file_path, author FROM notices WHERE id = ?', [postId], (err, post) => {
        if (err) {
            console.error('파일 경로 조회 실패:', err);
            return res.send('삭제 실패');
        }

        const isAnon = post.author === '익명';
        const isAdmin = currentUser === 'admin';
        const isAuthor = currentUser && (currentUser.trim() === post.author.trim());

        if (isAnon) {
            if (!isAdmin) return res.send('익명 글은 admin만 삭제할 수 있습니다.');
        } else {
            if (!isAuthor) return res.send('본인이 작성한 글만 삭제할 수 있습니다.');
        }


        // 파일 경로가 있다면 실제 파일 삭제
        if (post?.file_path) {
            const fileToDelete = path.join(__dirname, '../public', post.file_path);
            if (fs.existsSync(fileToDelete)) {
                fs.unlinkSync(fileToDelete);
            }
        }
        

        // 그 다음 DB에서 삭제
        db.run('DELETE FROM notices WHERE id = ?', [postId], (err) => {
            if (err) {
                console.error('DB 삭제 실패:', err);
                return res.send('삭제 실패');
            }
            res.redirect('/notice');
        });
    });
});

module.exports = router;
