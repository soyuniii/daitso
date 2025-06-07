// scripts/seedProducts.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../db/database.sqlite');
const db = new sqlite3.Database(dbPath);

// 상품 초기 데이터 삽입
db.serialize(() => {
  db.get('SELECT COUNT(*) AS count FROM products', (err, row) => {
    if (err) {
      console.error('❌ products 테이블 조회 오류:', err.message);
      return db.close();
    }

    if (row.count === 0) {
      const stmt = db.prepare(`
        INSERT INTO products (name, price, image_path, description)
        VALUES (?, ?, ?, ?)
      `);

      const products = [
        ['나는야 감자빵',  3000, '/images/product1.png' ,'국내산 감자, 앙금, 찹쌀',],
        ['내고향 고구마빵',3500, '/images/product2.png', '국내산 고구마, 앙금, 찹쌀'],
        ['내고향 밤빵', 3500, '/images/product3.png', '국내산 밤, 앙금, 찹쌀'],
        ['내고향 옥수수빵',4000, '/images/product4.png', '강원도 미백 찰옥수수'],
        ['내고향 마늘빵',5000 , '/images/product5.png', '국내산 마늘, 치즈, 찹쌀'],
        ['내고향 대파빵',5000 , '/images/product6.png', '국내산 대파, 치즈, 찹쌀'],
      ];

      for (const product of products) {
        stmt.run(product);
      }

      stmt.finalize(() => {
        console.log('🍞 빵 상품 6개 데이터 삽입 완료!');
        db.close();
      });
    } else {
      console.log(`ℹ️ 이미 ${row.count}개의 상품이 존재합니다. 삽입 생략`);
      db.close();
    }
  });
});