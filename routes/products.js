// routes/products.js
const express = require('express');
const router = express.Router();

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
  

module.exports = router;