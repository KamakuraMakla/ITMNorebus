$(document).ready(function() {
    $('.js-view-more').on('click', function() {
        // 同じ階層にある .more-content を探す
        const $moreContent = $(this).prev('.more-content');
        
        // テキストの開閉をスライドで行う
        $moreContent.slideToggle(400);
        
        // ボタンに「開いている」状態のクラスをつけ外しする（矢印回転用）
        $(this).toggleClass('is-open');
        
        // ボタンのテキストを切り替える場合（任意）
        if ($(this).hasClass('is-open')) {
            $(this).html('<span class="arrow-icon">∧</span> CLOSE');
        } else {
            $(this).html('<span class="arrow-icon">∨</span> VIEW MORE');
        }
    });
});