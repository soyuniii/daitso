-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                     username TEXT UNIQUE NOT NULL,
                                     password TEXT NOT NULL,
                                     name TEXT NOT NULL
);

-- 게시글 테이블
CREATE TABLE IF NOT EXISTS posts (
                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                     title TEXT NOT NULL,
                                     content TEXT NOT NULL,
                                     parent_id INTEGER,
                                     author TEXT NOT NULL,
                                     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- 공지사항 테이블 (파일 업로드 기능 포함)
CREATE TABLE IF NOT EXISTS notices (
                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                    title TEXT NOT NULL,
                                    content TEXT NOT NULL,
                                    file_path TEXT,
                                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

-- 상품 테이블
CREATE TABLE IF NOT EXISTS products (
                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                    name TEXT NOT NULL,
                                    price INTEGER NOT NULL,
                                    image_path TEXT,
                                    description TEXT
  );

-- 위시리스트 테이블
CREATE TABLE IF NOT EXISTS wishlist (
                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                    user_id INTEGER NOT NULL,
                                    product_id INTEGER NOT NULL,
                                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                    FOREIGN KEY(user_id) REFERENCES users(id),
                                    FOREIGN KEY(product_id) REFERENCES products(id),
                                    UNIQUE(user_id, product_id)
);

-- 장바구니 테이블
CREATE TABLE IF NOT EXISTS cart (
                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                    user_id INTEGER NOT NULL,
                                    product_id INTEGER NOT NULL,
                                    quantity INTEGER DEFAULT 1,
                                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                    FOREIGN KEY(user_id) REFERENCES users(id),
                                    FOREIGN KEY(product_id) REFERENCES products(id),
                                    UNIQUE(user_id, product_id)
);