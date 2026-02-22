$(function() {
  $('.hamburger').click(function() {
    // メニューの開閉
    $('.globalnav').toggleClass('open');
    $('.button').toggleClass('active');

    // ハンバーガーボタンのアクティブクラスを切り替えて三本線をバツにする
    $(this).toggleClass('active');
  });
});