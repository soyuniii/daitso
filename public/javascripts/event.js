document.addEventListener('DOMContentLoaded', () => {
    // 기타 메뉴 버튼 클릭 시 알림 처리
    document.querySelectorAll('.other-menu').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        alert('이 기능은 현재 준비 중입니다.');
      });
    });
  });