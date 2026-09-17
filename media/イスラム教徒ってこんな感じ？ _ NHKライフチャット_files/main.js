//一覧ページで1ページごとに表示する記事数
let postPerPage = 20;
let url = location.href ;
let resourceImgPath = (url.indexOf('preview') !== -1) ? "../../upload_img" : "assets/img";
let curPage = 1;
let showMoreCommentFunc;
let hideMoreCommentFunc;

$(function(){

    // 画面表示関連の初期設定
    init();

    $(window).on('load', function() {

    });

    $(window).resize(function(){
		setLayout();

	}).resize();

    // json読み込み ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    let now = new Date();
    $.ajaxSetup({async: false});
    $.getJSON("assets/js/data.json?date=" +now.getTime(), function(json) {data = json; });
    $.ajaxSetup({async: true});
	// メニューの開閉 ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	$("#nav-main-open").click(function () {
        $(this).hide();
        $('#nav-main').fadeIn();
        document.addEventListener('touchmove', noscroll, {passive: false});
        document.addEventListener('wheel', noscroll, {passive: false});
	});
    $("#nav-main-close").click(function () {
        $("#nav-main-open").show();
        $('#nav-main').fadeOut();
        document.removeEventListener('touchmove', noscroll);
        document.removeEventListener('wheel', noscroll);
	});

    // 個別記事ページコメント欄の「続きを見る」
    $('#feed-comments-2nd').on('click', '.comment-more', function(){
        $(this).parent().find('.comment-text-second').fadeIn();
        $(this).remove();
    });

    // コメント欄の「もっと見る」
    $("#show-more-comments").click(function () {
        $('.feed-comments').find('.block').removeClass('dnone');
        
        if($('body').hasClass('post')){
            $(this).remove();
        }
    });

    // カテゴリー欄の「もっと見る」
    $("#show-more-posts").click(function () {
        $('#feed-posts-tgt').find('.col').removeClass('dnone');
        $(this).remove();
    });

    //トップページでコメントの生成
    if($('body').hasClass('top')){
        let comments = data.comment;
        let count = 0;
        
        let postIdToIndexList = {};
        $.each(data.post, function (i, post) {
            postIdToIndexList[post.id] = i;
        });

        let $parentElem = $('#comment-wrapper');
        $.each(comments, function (i, comment) {
            if(comment.top == "1"){
                $parentElem.append(createCommentDom(comment, postIdToIndexList));
                count ++;
            }
        });

        if(count == 0){
            // コメントがない場合ブロックごと削除
            $('#section-recent').remove();
        } else if(count > 2) {
            // コメントが3つ以上ある場合、3番目以降のコメントに自動で切り替わっていくように縦のカルーセルを設定する
            let containerElem = document.getElementById('comment-container');
            let warpperElem = document.getElementById('comment-wrapper');
            let commentElems = warpperElem.children;
            let $firstComment = $parentElem.children(':first-child');
            let margin = ($firstComment.outerHeight(true) - $firstComment.outerHeight()) / 2;

            // 表示位置を初めの位置にリセットするため用に先頭2つのコメントを最後に、後ろの2つのコメントを先頭にダミー要素として追加する
            const lastComment = commentElems[count - 1].cloneNode(true);
            const secondLastComment = commentElems[count - 2].cloneNode(true);
            $parentElem.append(commentElems[0].cloneNode(true));
            $parentElem.append(commentElems[1].cloneNode(true));
            $parentElem.prepend(lastComment);
            $parentElem.prepend(secondLastComment);

            // 1,2番目のコメントのみ表示させるためにその他のコメントを一旦非表示にする
            for(let i = 0, length = commentElems.length; i < length; i++) {
                if (2 <= i && i <= 3) continue;
                if (i <= 1 || length - 2 <= i) {
                    commentElems[i].setAttribute('slider-type', 'dummy');
                }
                commentElems[i].style.display = "none";
            }

            let topCommentIndex = 2;
            let translateY = 0;
            let startTranslateY = 0;
            let endTranslateY = 0;
            let stopScroll = false;
            let hiddenCommentArea = false;
            let movingFlg = false;

            // スクロールの次移動関数
            const nextMoveFunc = (noCheckFlg = false) => {
                if (!noCheckFlg) {
                    if (stopScroll || hiddenCommentArea) {
                        return;
                    }
                }
                if (movingFlg || topCommentIndex + 2 >= commentElems.length) {
                    return;
                }

                // 「記事はこちら」ボタンの制御
                // ※スクロール後に、枠外に移動したコメントの「記事はこちら」ボタンが飛び出てしまうため
                let linkElem = commentElems[topCommentIndex].querySelector("a.detail");
                if (linkElem) {
                    $(linkElem).fadeOut(300);
                }
                linkElem = commentElems[topCommentIndex + 2].querySelector("a.detail");
                if (linkElem) linkElem.style.display = "";

                // スクロール位置の設定
                translateY += (commentElems[topCommentIndex].offsetHeight + margin);
                warpperElem.style.cssText = `transition-duration: 500ms; transform: translateY(-${translateY}px);`;
                movingFlg = true;

                topCommentIndex++;

                // コメント欄の高さはコメントの行数によって変わるため、現在表示しているコメント欄から高さを算出
                let height = (margin * 3) + commentElems[topCommentIndex].offsetHeight + commentElems[topCommentIndex + 1].offsetHeight;
                containerElem.style.cssText = `position: relative; overflow: hidden; height: ${height}px;`;
            };

            // スクロールの前移動関数
            const prevMoveFunc = (noCheckFlg = false) => {
                if (!noCheckFlg) {
                    if (stopScroll || hiddenCommentArea) {
                        return;
                    }
                }
                if (movingFlg || topCommentIndex <= 0) {
                    return;
                }

                // 「記事はこちら」ボタンの制御
                let linkElem = commentElems[topCommentIndex - 1].querySelector("a.detail");
                if (linkElem) {
                    $(linkElem).fadeIn(100);
                }
                if ((topCommentIndex - 2) >= 0) {
                    linkElem = commentElems[topCommentIndex - 2].querySelector("a.detail");
                    if (linkElem) linkElem.style.display = "none";
                }

                // スクロール位置の設定
                translateY -= (commentElems[topCommentIndex - 1].offsetHeight + margin);
                warpperElem.style.cssText = `transition-duration: 500ms; transform: translateY(-${translateY}px);`;
                movingFlg = true;

                topCommentIndex--;

                // コメント欄の高さはコメントの行数によって変わるため、現在表示しているコメント欄から高さを算出
                let height = (margin * 3) + commentElems[topCommentIndex].offsetHeight + commentElems[topCommentIndex + 1].offsetHeight;
                containerElem.style.cssText = `position: relative; overflow: hidden; height: ${height}px;`;
            };

            // コメントの「続きを見る」処理
            showMoreCommentFunc = function(element, changeHeight = true) {
                let parentElem = element.parentNode;
                parentElem.style.display = 'none';
                parentElem.nextElementSibling.style.display = '';
                parentElem.parentNode.setAttribute('more-cmnt-status', 'show');
                if (changeHeight) {
                    let height = (margin * 3) + commentElems[topCommentIndex].offsetHeight + commentElems[topCommentIndex + 1].offsetHeight;
                    containerElem.style.cssText = `position: relative; overflow: hidden; height: ${height}px;`;
                }
            }
            
            // コメントの「元に戻す」処理
            hideMoreCommentFunc = function(element, changeHeight = true) {
                let parentElem = element.parentNode;
                parentElem.style.display = 'none';
                parentElem.previousElementSibling.style.display = '';
                parentElem.parentNode.setAttribute('more-cmnt-status', '');
                if (changeHeight) {
                    let height = (margin * 3) + commentElems[topCommentIndex].offsetHeight + commentElems[topCommentIndex + 1].offsetHeight;
                    containerElem.style.cssText = `position: relative; overflow: hidden; height: ${height}px;`;
                }
            }

            // 画像読み込み前に処理をすると要素の高さが変わってしまうので、画像を読み込み後に処理をする
            waitForImagesToLoad(warpperElem)
                .then(() => {
                    // スクロール開始前の初期処理
                    // 非表示にしているコメントを非表示から戻す
                    for(let i = 0, length = commentElems.length; i < length; i++) {
                        commentElems[i].style.display = "";
                        if (i <= 1) {
                            startTranslateY += (commentElems[i].offsetHeight + margin);
                            // 「記事はこちら」ボタンを非表示化
                            let linkElem = commentElems[i].querySelector("a.detail");
                            if (linkElem) linkElem.style.display = "none";
                        }
                        if (i < commentElems.length - 4) {
                            endTranslateY += (commentElems[i].offsetHeight + margin);
                        }
                    }

                    // 1,2番目のコメントのみを表示する高さと位置に調整
                    // コメント欄の高さはコメントの行数によって変わるため、現在表示しているコメント欄から高さを算出
                    let height = (margin * 3) + commentElems[topCommentIndex].offsetHeight + commentElems[topCommentIndex + 1].offsetHeight;
                    containerElem.style.cssText = `position: relative; overflow: hidden; height: ${height}px;`;
                    warpperElem.style.cssText = `transform: translateY(-${startTranslateY}px);`;
                    translateY = startTranslateY;

                    // 1秒後に動き出し、その後は3秒に1度コメントスクロール処理を行う
                    setTimeout(() => {
                        nextMoveFunc();
                        setInterval(() => {
                            nextMoveFunc();
                        }, 4000);
                    }, 1000);
                });


            document.getElementById('next_comment').addEventListener("click", function (event) {
                nextMoveFunc(true);
            });
            document.getElementById('prev_comment').addEventListener("click", function (event) {
                prevMoveFunc(true);
            });

            // マウスをコメント部分欄上に置いている場合はスクロールをさせない
            document.getElementById('section-recent').addEventListener("mouseenter", function (event) {
                stopScroll = true;
            });
            document.getElementById('section-recent').addEventListener("mouseleave", function (event) {
                stopScroll = false;
            });

            // transition後のイベント
            containerElem.addEventListener('transitionend', function (event) {
                if (event.propertyName === 'transform') {
                    if (!movingFlg) return;
                    movingFlg = false;
                    let hideBtn;
                    // コメントが端の位置（ダミー要素）に到達した場合、ループをさせるためにもう一方の同じ要素側に移動
                    if (topCommentIndex == 0) {
                        // 上の端に到達した場合、内部的に下部に移動させる
                        topCommentIndex = commentElems.length - 4;
                        translateY = endTranslateY;
                        warpperElem.style.cssText = `transform: translateY(-${translateY}px);`;
                        for(let i = topCommentIndex - 1; i <= topCommentIndex + 1; i++) {
                            let linkElem = commentElems[i].querySelector("a.detail");
                            if (linkElem) linkElem.style.display = (i < topCommentIndex) ? "none" : "";
                        }
                        // 表示外に移動したコメントの「続きを見る」状態を元に戻す
                        hideBtn = commentElems[2].querySelector('.hide-cmnt');
                        if (hideBtn && hideBtn.parentNode.parentNode.getAttribute('more-cmnt-status') == 'show') {
                            hideMoreCommentFunc(hideBtn, false);
                        }
                        // コメントの「続きを見る」状態をもう一方の同じ要素側に引き継ぐ
                        hideBtn = commentElems[1].querySelector('.hide-cmnt');
                        if (hideBtn && hideBtn.parentNode.parentNode.getAttribute('more-cmnt-status') == 'show') {
                            let lowerShowBtn = commentElems[commentElems.length - 3].querySelector('.show-cmnt');
                            showMoreCommentFunc(lowerShowBtn, false);
                            hideMoreCommentFunc(hideBtn, false);
                        };
                    } else if (topCommentIndex + 2 >= commentElems.length) {
                        // 下の端に到達した場合、内部的に上部に移動させる
                        topCommentIndex = 2;
                        translateY = startTranslateY;
                        warpperElem.style.cssText = `transform: translateY(-${translateY}px);`;
                        for(let i = 1; i <= topCommentIndex + 1; i++) {
                            let linkElem = commentElems[i].querySelector("a.detail");
                            if (linkElem) linkElem.style.display = (i < topCommentIndex) ? "none" : "";
                        }
                        // 表示外に移動したコメントの「続きを見る」状態を元に戻す
                        hideBtn = commentElems[commentElems.length - 3].querySelector('.hide-cmnt');
                        if (hideBtn && hideBtn.parentNode.parentNode.getAttribute('more-cmnt-status') == 'show') {
                            hideMoreCommentFunc(hideBtn, false);
                        }
                        // コメントの「続きを見る」状態をもう一方の同じ要素側に引き継ぐ
                        hideBtn = commentElems[commentElems.length - 2].querySelector('.hide-cmnt');
                        if (hideBtn && hideBtn.parentNode.parentNode.getAttribute('more-cmnt-status') == 'show') {
                            let upperShowBtn = commentElems[2].querySelector('.show-cmnt');
                            showMoreCommentFunc(upperShowBtn, false);
                            hideMoreCommentFunc(hideBtn, false);
                        };
                    } else {
                        // 表示外に移動したコメントの「続きを見る」状態を元に戻す
                        hideBtn = commentElems[topCommentIndex - 1].querySelector('.hide-cmnt');
                        if (hideBtn && hideBtn.parentNode.parentNode.getAttribute('more-cmnt-status') == 'show') {
                            // スクロール位置の設定
                            translateY -= (commentElems[topCommentIndex - 1].offsetHeight);
                            hideMoreCommentFunc(hideBtn, false);
                            translateY += (commentElems[topCommentIndex - 1].offsetHeight);
                            warpperElem.style.cssText = `transform: translateY(-${translateY}px);`;
                        };
                        hideBtn = commentElems[topCommentIndex + 2].querySelector('.hide-cmnt');
                        if (hideBtn && hideBtn.parentNode.parentNode.getAttribute('more-cmnt-status') == 'show') {
                            hideMoreCommentFunc(hideBtn, false);
                        }
                    }
                }
            });

            // コメント部分が画面に表示されていない場合はスクロールを行わない
            let targetElement = document.getElementById('section-recent');
            window.addEventListener('scroll',function(){
                let rect = targetElement.getBoundingClientRect();
                let windowHeight = window.innerHeight || document.documentElement.clientHeight;
            
                // 要素が垂直方向に部分的に表示されているかどうかを判定
                let verticalVisible = (rect.top <= windowHeight && rect.bottom >= 0);
                hiddenCommentArea = !verticalVisible;
            });
        }
    }
    

    //記事一覧（post_list.html）でのページ生成
    if($('body').hasClass('postlist')){
        let pageNum = getParam('num');
        if(!pageNum){
            pageNum = 1;
        }

        let postVol = Object.keys(data.post).length;
        let listPageVol = Math.ceil(postVol / postPerPage);

        let first = (pageNum - 1) * postPerPage + 1;
        let last = pageNum * postPerPage;

        let categoryIdToIndexList = {};
        $.each(data.category, function (i, category) {
            categoryIdToIndexList[category.id] = i;
        });

        //記事の生成
        $.each(data.post, function (i, postData) {

            if(i < first - 1 || i > last - 1 ) return;
            let flag1 = "";
            let flag2 = "";
            let flag3 = "";
            let thumbSize = postData.size;
            let balloonPartClass1 = "";
            let balloonPartClass2 = "";
            let balloonPartClass3 = "";
            let editorId;

            if(data.post[i].flag.continuiing == 1){
                flag1 = '<div class="flag flag-continuiing"></div>'
            }
            if(data.post[i].flag.attention == 1){
                flag2 = '<div class="flag flag-attn"></div>'
            }
            if(data.post[i].flag.new == 1){
                flag3 = '<div class="flag flag-new"></div>'
            }
            if(thumbSize == "2"){
                balloonPartClass1 = 'col-12';
                balloonPartClass2 = 'col-12';
                balloonPartClass3 = 'col-12';
            }else if(thumbSize == "1"){
                balloonPartClass1 = 'col-7 col-md-12';
                balloonPartClass2 = 'col-5 col-md-12';
                balloonPartClass3 = 'col-12';
            }else{
                balloonPartClass1 = 'col-12';
                balloonPartClass2 = 'col-12 d-none d-lg-block';
                balloonPartClass3 = 'col-12';
            }
            let categoryList = "";
            $.each(data.post[i].cat, function (j, catId) {
                if (!(catId in categoryIdToIndexList)) {
                    return true;
                }
                categoryList = categoryList + '<li><a href="category.html?id=' + catId + '">' + data.category[categoryIdToIndexList[catId]].name + '</a></li>';
            });

            if (postData.editor.length > 0) {
                editorId = getEditorId(postData.editor[0]);
            }

            let date = postData.date.split('-');
            let postLinkAttr = postData.ex_site_url ?
                    'href="' + postData.ex_site_url + '" rel="noopener noreferrer" target="_blank"' :
                    'href="post_' + postData.id + '.html"';

            let dom =   '<div class="col col-12 col-md-6">' +
                            '<div class="block block-s t-balloon t-balloon-right">' +
                                '<div class="row">' +
                                    '<div class="col col-icon col-2 col-md-3">' +
                                        '<img class="icon" src="' + resourceImgPath + '/icon/' + postData.icon + '" />' +
                                    '</div>' +
                                    '<div class="col col-post col-10 col-md-9">' +
                                        '<div class="name">' + (postData.editor.length > 0 ? ('<a href="editor.html?editorId=' + editorId + '">' + postData.editor[0]) : '&nbsp;') + '</a></div>' +
                                        '<div class="balloon balloon-right balloon-yellow row">' +
                                            '<div class="col-12">' +
                                                '<div class="row">' +
                                                    '<div class="' + balloonPartClass1 + '">' +
                                                        '<div class="title"><a ' + postLinkAttr + '>' + postData.title + '</a></div>' +
                                                    '</div>' +
                                                    '<div class="col-12">' +
                                                        '<div class="post-date">(' + date[0] + '.' + date[1] + '.' + date[2] + ')</div>' +
                                                    '</div>' +
                                                    '<div class="' + balloonPartClass2 + '">' +
                                                        '<a ' + postLinkAttr + '><img src="' + resourceImgPath + '/post/' + postData.id + '/' + postData.thumb + '" /></a>' +
                                                    '</div>' +
                                                    '<div class="' + balloonPartClass3 + '">' +
                                                        '<ul class="post-category-list">' + categoryList + '</ul>' +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="flags">' + flag1 + flag2 + flag3 + '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>';
            $('#feed-posts-tgt').append(dom);

        });
        //ページャーの生成
        if(data.post.length <= postPerPage){
            $('.pagination').remove();
        }else{
            
            for(let i = 1; i<=listPageVol; i++){
                let classes;
                if(pageNum == i){
                    classes = 'btn num num-active';
                }else{
                    classes = 'btn num';
                }
                let dom = '<a class="' + classes + '" href="post_list.html?num=' + i + '">' + i + '</a>';
                $('#pagination-numbers').append(dom);
            }
            pagePrev = Number(pageNum) - 1;
            pageNext = Number(pageNum) + 1;
            if(pageNum == 1){
                $('#pagenation-arrow-back').css('opacity','0');
                $('#pagenation-arrow-back').css('cursor','auto');
                $('#pagenation-arrow-back').removeAttr('href');
                $('#pagenation-arrow-next').attr('href','post_list.html?num=' + pageNext);
            }else if(pageNum == listPageVol){
                $('#pagenation-arrow-next').css('opacity','0');
                $('#pagenation-arrow-next').css('cursor','auto');
                $('#pagenation-arrow-next').removeAttr('href');
                $('#pagenation-arrow-back').attr('href','post_list.html?num=' + pagePrev);
            }else{
                $('#pagenation-arrow-back').attr('href','post_list.html?num=' + pagePrev);
                $('#pagenation-arrow-next').attr('href','post_list.html?num=' + pageNext);
            }
        }



    }

    //カテゴリ一覧（categories.html）でのページ生成
    if($('body').hasClass('categories')){

        let categoryIdToIndexList = {};
        $.each(data.category, function (i, catData) {
            categoryIdToIndexList[catData.id] = i;
            let catId = catData.id;
            let catShowFlag = false;
            $.each(data.post, function (j, postData) {
                $.each(postData.cat, function (j, relCatId) {
                    if(relCatId == catId){
                        catShowFlag = true;
                        return false;
                    }
                });
                if(catShowFlag){
                    return false;
                }
            });
            if(catShowFlag){
                let dom = '<li><a href="category.html?id=' + catData.id + '">' + catData.name + '</a></li>';
                $('#category-list').append(dom);
            }
        });

        $.each(data.post, function (i, postData) {
            if(i>21) return false;
            let flag1 = "";
            let flag2 = "";
            let flag3 = "";
            let thumbSize = postData.size;
            let balloonPartClass1 = "";
            let balloonPartClass2 = "";
            let balloonPartClass3 = "";
            let editorId;
            if(i>=6){
                exClass = 'dnone';
            }else{
                exClass = '';
            }
            if(data.post[i].flag.continuiing == 1){
                flag1 = '<div class="flag flag-continuiing"></div>'
            }
            if(data.post[i].flag.attention == 1){
                flag2 = '<div class="flag flag-attn"></div>'
            }
            if(data.post[i].flag.new == 1){
                flag3 = '<div class="flag flag-new"></div>'
            }
            if(thumbSize == "2"){
                balloonPartClass1 = 'col-12';
                balloonPartClass2 = 'col-12';
                balloonPartClass3 = 'col-12';
            }else if(thumbSize == "1"){
                balloonPartClass1 = 'col-7 col-md-12';
                balloonPartClass2 = 'col-5 col-md-12';
                balloonPartClass3 = 'col-12';
            }else{
                balloonPartClass1 = 'col-12';
                balloonPartClass2 = 'col-12 d-none d-lg-block';
                balloonPartClass3 = 'col-12';
            }
            let categoryList = "";
            $.each(data.post[i].cat, function (j, catId) {
                if (!(catId in categoryIdToIndexList)) {
                    return true;
                }
                categoryList = categoryList + '<li><a href="category.html?id=' + catId + '">' + data.category[categoryIdToIndexList[catId]].name + '</a></li>';
            });

            if (postData.editor.length > 0) {
                editorId = getEditorId(postData.editor[0]);
            }

            let date = postData.date.split('-');
            let postLinkAttr = postData.ex_site_url ?
                    'href="' + postData.ex_site_url + '" rel="noopener noreferrer" target="_blank"' :
                    'href="post_' + postData.id + '.html"';

            let dom =   '<div class="col col-12 col-md-6 ' + exClass + '">' +
                            '<div class="block block-s t-balloon t-balloon-right">' +
                                '<div class="row">' +
                                    '<div class="col col-icon col-2 col-md-3">' +
                                        '<img class="icon" src="' + resourceImgPath + '/icon/' + postData.icon + '" />' +
                                    '</div>' +
                                    '<div class="col col-post col-10 col-md-9">' +
                                        '<div class="name">' + (postData.editor.length > 0 ? ('<a href="editor.html?editorId=' + editorId + '">' + postData.editor[0]) : '&nbsp;') + '</a></div>' +
                                        '<div class="balloon balloon-right balloon-white row">' +
                                            '<div class="col-12">' +
                                                '<div class="row">' +
                                                    '<div class="' + balloonPartClass1 + '">' +
                                                        '<div class="title"><a ' + postLinkAttr + '>' + postData.title + '</a></div>' +
                                                        '<div class="post-date">(' + date[0] + '.' + date[1] + '.' + date[2] + ')</div>' +
                                                    '</div>' +
                                                    '<div class="' + balloonPartClass2 + '">' +
                                                        '<a ' + postLinkAttr + '><img src="' + resourceImgPath + '/post/' + postData.id + '/' + postData.thumb + '" /></a>' +
                                                    '</div>' +
                                                    '<div class="' + balloonPartClass3 + '">' +
                                                        '<ul class="post-category-list">' + categoryList + '</ul>' +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="flags">' + flag1 + flag2 + flag3 + '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>';
            $('#feed-posts-tgt').append(dom);
        });
    }

    //カテゴリページ（category.html）でのページ生成
    if($('body').hasClass('category')){
        let catId = getParam('id');
        if(!catId && data.category.length > 0){
            catId = data.category[0].id;
        }
        let pageNum = getParam('num');
        if(!pageNum){
            pageNum = 1;
        }

        // カテゴリーのタイトルと説明文
        let catName;
        let catDesc;
        $.each(data.category, function (i, catData) {
            if(catData.id == catId){
                catName = catData.name;
                catDesc = catData.desc;
            }
        });
        // headのtitleとog:titleを上書き
        let pageTitle = catName + 'の記事ページ | NHKライフチャット';
        document.title = pageTitle;
        let headData = document.head.children;
        for(let i = 0; i < headData.length; i++){
            let propertyVal = headData[i].getAttribute('property');
            if(propertyVal !== null){
                if(propertyVal.indexOf('og:title') != -1){
                    headData[i].setAttribute('content',pageTitle);
                }
            }
        }

        $('#cat-title').html(catName + 'の記事');
        //$('#cat-desc').html(catDesc);

    
        let categoryIdToIndexList = {};
        $.each(data.category, function (i, category) {
            categoryIdToIndexList[category.id] = i;
        });

        let postByCat = [];
        $.each(data.post, function (i, postData) {
            $.each(data.post[i].cat, function (j, relateCatId) {
                if(catId == relateCatId){
                    postByCat.push(postData);
                    return false;
                }
            });
        });
        // console.log(postByCat);

        //フィードの生成
        let postVol = Object.keys(postByCat).length;
        let listPageVol = Math.ceil(postVol / postPerPage);

        let first = (pageNum - 1) * postPerPage + 1;
        let last = pageNum * postPerPage;

        $.each(postByCat, function (i, postData) {
            if(i < first - 1 || i > last - 1 ) return;
            let flag1 = "";
            let flag2 = "";
            let flag3 = "";
            let thumbSize = postData.size;
            let balloonPartClass1 = "";
            let balloonPartClass2 = "";
            let balloonPartClass3 = "";
            let editorId;
            if(postByCat[i].flag.continuiing == 1){
                flag1 = '<div class="flag flag-continuiing"></div>'
            }
            if(postByCat[i].flag.attention == 1){
                flag2 = '<div class="flag flag-attn"></div>'
            }
            if(postByCat[i].flag.new == 1){
                flag3 = '<div class="flag flag-new"></div>'
            }
            if(thumbSize == "2"){
                balloonPartClass1 = 'col-12';
                balloonPartClass2 = 'col-12';
                balloonPartClass3 = 'col-12';
            }else if(thumbSize == "1"){
                balloonPartClass1 = 'col-7 col-md-12';
                balloonPartClass2 = 'col-5 col-md-12';
                balloonPartClass3 = 'col-12';
            }else{
                balloonPartClass1 = 'col-12';
                balloonPartClass2 = 'col-12 d-none d-lg-block';
                balloonPartClass3 = 'col-12';
            }
            let categoryList = "";
            $.each(postByCat[i].cat, function (j, relateCatId) {
                if (!(relateCatId in categoryIdToIndexList)) {
                    return true;
                }
                categoryList = categoryList + '<li><a href="category.html?id=' + relateCatId + '">' + data.category[categoryIdToIndexList[relateCatId]].name + '</a></li>';
            });

            if (postData.editor.length > 0) {
                editorId = getEditorId(postData.editor[0]);
            }

            let date = postData.date.split('-');
            let postLinkAttr = postData.ex_site_url ?
                    'href="' + postData.ex_site_url + '" rel="noopener noreferrer" target="_blank"' :
                    'href="post_' + postData.id + '.html"';

            let dom =   '<div class="col col-12 col-md-6">' +
                            '<div class="block block-s t-balloon t-balloon-right">' +
                                '<div class="row">' +
                                    '<div class="col col-icon col-3 col-md-3">' +
                                        '<img class="icon" src="' + resourceImgPath + '/icon/' + postData.icon + '" />' +
                                    '</div>' +
                                    '<div class="col col-post col-9 col-md-9">' +
                                        '<div class="name">' + (postData.editor.length > 0 ? ('<a href="editor.html?editorId=' + editorId + '">' + postData.editor[0]) : '&nbsp;') + '</a></div>' +
                                        '<div class="balloon balloon-right balloon-yellow row">' +
                                            '<div class="col-12">' +
                                                '<div class="row">' +
                                                    '<div class="' + balloonPartClass1 + '">' +
                                                        '<div class="title"><a ' + postLinkAttr + '>' + postData.title + '</a></div>' +
                                                        '<div class="post-date">(' + date[0] + '.' + date[1] + '.' + date[2] + ')</div>' +
                                                    '</div>' +
                                                    '<div class="' + balloonPartClass2 + '">' +
                                                        '<a ' + postLinkAttr + '><img src="' + resourceImgPath + '/post/' + postData.id + '/' + postData.thumb + '" /></a>' +
                                                    '</div>' +
                                                    '<div class="' + balloonPartClass3 + '">' +
                                                        '<ul class="post-category-list">' + categoryList + '</ul>' +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="flags">' + flag1 + flag2 + flag3 + '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>';
            $('#feed-posts-tgt').append(dom);

        });
        //ページャーの生成
        if(listPageVol < 2){
            $('#section-pagination').remove();
        }else{
            for(let i = 1; i<=listPageVol; i++){
                let classes;
                if(pageNum == i){
                    classes = 'btn num num-active';
                }else{
                    classes = 'btn num';
                }
                let dom = '<a class="' + classes + '" href="category.html?id=' + catId + '&num=' + i + '">' + i + '</a>';
                $('#pagination-numbers').append(dom);
            }
        }
        pagePrev = Number(pageNum) - 1;
        pageNext = Number(pageNum) + 1;
        if(pageNum == 1){
            $('#pagenation-arrow-back').css('opacity','0');
            $('#pagenation-arrow-back').css('cursor','auto');
            $('#pagenation-arrow-back').removeAttr('href');
            $('#pagenation-arrow-next').attr('href','post_list.html?num=' + pageNext);
        }else if(pageNum == listPageVol){
            $('#pagenation-arrow-next').css('opacity','0');
            $('#pagenation-arrow-next').css('cursor','auto');
            $('#pagenation-arrow-next').removeAttr('href');
            $('#pagenation-arrow-back').attr('href','post_list.html?num=' + pagePrev);
        }else{
            $('#pagenation-arrow-back').attr('href','post_list.html?num=' + pagePrev);
            $('#pagenation-arrow-next').attr('href','post_list.html?num=' + pageNext);
        }
    }

    //記者ページ（editor.html）でのページ生成
    if($('body').hasClass('editor')){
        let editorId = getParam('editorId');
        if(!editorId && data.editor.length > 0){
            editorId = data.editor[0].id;
        }
        let pageNum = getParam('num');
        if(!pageNum){
            pageNum = 1;
        }

        // 記者の名前
        let editorName;
        let editorIntro;
        let editorRole;
        $.each(data.editor, function (i, editorData) {
            if(editorData.id == editorId){
                editorName = editorData.name;
                editorIntro = editorData.intro;
                editorRole = editorData.role;
            }
        });
        // headのtitleとog:titleを上書き
        let pageTitle = editorName + editorRole + 'の記事一覧 | NHKライフチャット';
        document.title = pageTitle;
        let headData = document.head.children;
        for(let i = 0; i < headData.length; i++){
            let propertyVal = headData[i].getAttribute('property');
            if(propertyVal !== null){
                if(propertyVal.indexOf('og:title') != -1){
                    headData[i].setAttribute('content',pageTitle);
                }
            }
        }

        $('#editor-name').html(editorName + ' ' + editorRole + 'の記事一覧');

        let categoryIdToIndexList = {};
        $.each(data.category, function (i, category) {
            categoryIdToIndexList[category.id] = i;
        });

        let postByEditor = [];
        $.each(data.post, function (i, postData) {
            $.each(data.post[i].editor, function (j, relateEditorName) {
                
                if(editorName + ' ' + editorRole == relateEditorName){
                    postByEditor.push(postData);
                    return false;
                }
            });
        });

        //フィードの生成
        let postVol = Object.keys(postByEditor).length;
        let listPageVol = Math.ceil(postVol / postPerPage);

        let first = (pageNum - 1) * postPerPage + 1;
        let last = pageNum * postPerPage;

        $.each(postByEditor, function (i, postData) {
            if(i < first - 1 || i > last - 1 ) return;
            let flag1 = "";
            let flag2 = "";
            let flag3 = "";
            let thumbSize = postData.size;
            let balloonPartClass1 = "";
            let balloonPartClass2 = "";
            let balloonPartClass3 = "";
            let editorId;

            if(postByEditor[i].flag.continuiing == 1){
                flag1 = '<div class="flag flag-continuiing"></div>'
            }
            if(postByEditor[i].flag.attention == 1){
                flag2 = '<div class="flag flag-attn"></div>'
            }
            if(postByEditor[i].flag.new == 1){
                flag3 = '<div class="flag flag-new"></div>'
            }
            if(thumbSize == "2"){
                balloonPartClass1 = 'col-12';
                balloonPartClass2 = 'col-12';
                balloonPartClass3 = 'col-12';
            }else if(thumbSize == "1"){
                balloonPartClass1 = 'col-7 col-md-12';
                balloonPartClass2 = 'col-5 col-md-12';
                balloonPartClass3 = 'col-12';
            }else{
                balloonPartClass1 = 'col-12';
                balloonPartClass2 = 'col-12 d-none d-lg-block';
                balloonPartClass3 = 'col-12';
            }
            let categoryList = "";
            $.each(postByEditor[i].cat, function (j, relateCatId) {
                if (!(relateCatId in categoryIdToIndexList)) {
                    return true;
                }
                categoryList = categoryList + '<li><a href="category.html?id=' + relateCatId + '">' + data.category[categoryIdToIndexList[relateCatId]].name + '</a></li>';
            });
            if (postData.editor.length > 0) {
                editorId = getEditorId(postData.editor[0]);
            }

            let date = postData.date.split('-');
            let postLinkAttr = postData.ex_site_url ?
                    'href="' + postData.ex_site_url + '" rel="noopener noreferrer" target="_blank"' :
                    'href="post_' + postData.id + '.html"';

            let dom =   '<div class="col col-12 col-md-6">' +
                            '<div class="block block-s t-balloon t-balloon-right">' +
                                '<div class="row">' +
                                    '<div class="col col-icon col-3 col-md-3">' +
                                        '<img class="icon" src="' + resourceImgPath + '/icon/' + postData.icon + '" />' +
                                    '</div>' +
                                    '<div class="col col-post col-9 col-md-9">' +
                                        '<div class="name">' + (postData.editor.length > 0 ? ('<a href="editor.html?editorId=' + editorId + '">' + postData.editor[0]) : '&nbsp;') + '</a></div>' +
                                        '<div class="balloon balloon-right balloon-yellow row">' +
                                            '<div class="col-12">' +
                                                '<div class="row">' +
                                                    '<div class="' + balloonPartClass1 + '">' +
                                                        '<div class="title"><a ' + postLinkAttr + '>' + postData.title + '</a></div>' +
                                                        '<div class="post-date">(' + date[0] + '.' + date[1] + '.' + date[2] + ')</div>' +
                                                    '</div>' +
                                                    '<div class="' + balloonPartClass2 + '">' +
                                                        '<a ' + postLinkAttr + '><img src="' + resourceImgPath + '/post/' + postData.id + '/' + postData.thumb + '" /></a>' +
                                                    '</div>' +
                                                    '<div class="' + balloonPartClass3 + '">' +
                                                        '<ul class="post-category-list">' + categoryList + '</ul>' +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="flags">' + flag1 + flag2 + flag3 + '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>';
            $('#feed-posts-tgt').append(dom);

        });
        //ページャーの生成
        if(listPageVol < 2){
            $('#section-pagination').remove();
        }else{
            for(let i = 1; i<=listPageVol; i++){
                let classes;
                if(pageNum == i){
                    classes = 'btn num num-active';
                }else{
                    classes = 'btn num';
                }
                let dom = '<a class="' + classes + '" href="category.html?id=' + catId + '&num=' + i + '">' + i + '</a>';
                $('#pagination-numbers').append(dom);
            }
        }
        pagePrev = Number(pageNum) - 1;
        pageNext = Number(pageNum) + 1;
        if(pageNum == 1){
            $('#pagenation-arrow-back').css('opacity','0');
            $('#pagenation-arrow-back').css('cursor','auto');
            $('#pagenation-arrow-back').removeAttr('href');
            $('#pagenation-arrow-next').attr('href','post_list.html?num=' + pageNext);
        }else if(pageNum == listPageVol){
            $('#pagenation-arrow-next').css('opacity','0');
            $('#pagenation-arrow-next').css('cursor','auto');
            $('#pagenation-arrow-next').removeAttr('href');
            $('#pagenation-arrow-back').attr('href','post_list.html?num=' + pagePrev);
        }else{
            $('#pagenation-arrow-back').attr('href','post_list.html?num=' + pagePrev);
            $('#pagenation-arrow-next').attr('href','post_list.html?num=' + pageNext);
        }
    }




    //個別記事ページでのコメントの生成・関連記事の生成
    if($('body').hasClass('post')){
        let htmlFileName = window.location.href.split('/').pop();
        let postId = '';
        if($('body').hasClass('sample')){
            postId = 1;
        }else{
            postId = htmlFileName.slice(5).slice(0,-5);
        }
        // console.log(postId);

        let categoryIdToIndexList = {};
        $.each(data.category, function (i, category) {
            categoryIdToIndexList[category.id] = i;
        });

        //コメントの生成
        let comments = data.comment;
        let count1st = 0;
        let count2nd = 0;
        let commentsCount = 0;


        $.each(comments, function (i, comment) {
            if(comment.relate == postId && count1st < 3){

                let commentTextSrc = comment.text.replace(/(\r\n|\n|\r)/gm, '<br />');
                let commentTextArr = commentTextSrc.split('<br />');
                let commentTextFirst = commentTextArr[0];

                let commentTextFirstDom = '<span class="comment-text-first">' + commentTextFirst + '</span>';

                let dom =   '<div class="block t-balloon t-balloon-right">' +
                                '<div class="row">' +
                                    '<div class="col col-icon col-3 col-md-2">' +
                                        '<img class="icon" src="' + resourceImgPath + '/icon/' + comment.icon + '" />' +
                                    '</div>' +
                                    '<div class="col col-post col-9 col-md-10">' +
                                        '<div class="name">' + comment.name + '</div>' +
                                        '<div class="balloon balloon-right balloon-red row">' +
                                            '<div class="col-12 col-text"><div class="comment-tx">' + commentTextFirstDom + '</div></div>' +
                                        '</div>'
                                    '</div>' +
                                '</div>' +
                            '</div>';
                $('#feed-comments-1st').append(dom);
                count1st ++;
                commentsCount ++;
            }
        });
        $.each(comments, function (i, comment) {
            if(comment.relate == postId){
                let exClass = '';
                if(count2nd>=4){
                    exClass = 'dnone';
                }else{
                    exClass = '';
                }
                let commentTextSrc = comment.text.replace(/(\r\n|\n|\r)/gm, '<br />');
                let commentTextArr = commentTextSrc.split('<br />');
                let commentTextFirst = commentTextArr[0];
                let commentTextSecond = '';
                for(let i=0; i<commentTextArr.length; i++){
                    if(i>=1){
                        commentTextSecond = commentTextSecond + '<br />' + commentTextArr[i];
                    }
                }

                let commentTextFirstDom = '<span class="comment-text-first">' + commentTextFirst + '</span>';
                let commentTextSecondDom = '';
                let commentMoreDom = '';
                if(commentTextSecond != ''){
                    commentTextSecondDom = '<span class="comment-text-second">' + commentTextSecond + '</span>';
                    commentMoreDom = '<div class="comment-more">続きをよむ</div>'
                }

                let dom =   '<div class="block t-balloon t-balloon-right ' + exClass + '">' +
                                '<div class="row">' +
                                    '<div class="col col-icon col-3 col-md-2">' +
                                        '<img class="icon" src="' + resourceImgPath + '/icon/' + comment.icon + '" />' +
                                    '</div>' +
                                    '<div class="col col-post col-9 col-md-10">' +
                                    '<div class="name">' + comment.name + '</div>' +
                                        '<div class="balloon balloon-right balloon-red row">' +
                                            '<div class="col-12 col-text"><div class="comment-tx">' + commentTextFirstDom + commentTextSecondDom + '</div></div>' +
                                        '</div>' + commentMoreDom +
                                    '</div>' +
                                '</div>' +
                            '</div>';
                $('#feed-comments-2nd').append(dom);
                count2nd ++;
                commentsCount ++;
            }
        });
        //コメント数によってコメント欄を削除
        if(commentsCount == 0){
            $('#section-comments-title').remove();
            $('#section-comments-1st').remove();
        }
        if(commentsCount < 7){
            $('#section-comments-2nd').remove();
        }

        //関連記事の生成
        let thisPostData;
        $.each(data.post, function (i, postData) {
            if(postData.id == postId){
                thisPostData = postData;
                return false;
            }
        });
        if (thisPostData) {
            if(thisPostData.relate.length > 0){
                //関連記事にデータがあった場合
                let postIdToIndexList = {};
                $.each(data.post, function (i, postData) {
                    postIdToIndexList[postData.id] = i;
                });

                let count = 0;
                $.each(thisPostData.relate, function (i, relPostId) {
                    if(count<7){
                        if (!(relPostId in postIdToIndexList)) {
                            return true;
                        }
                        count++;

                        let postData = data.post[postIdToIndexList[relPostId]];
                        let flag1 = "";
                        let flag2 = "";
                        let flag3 = "";
                        let thumbSize = postData.size;
                        let balloonPartClass1 = "";
                        let balloonPartClass2 = "";
                        let balloonPartClass3 = "";
                        let editorId;

                        if(postData.flag.continuiing == 1){
                            flag1 = '<div class="flag flag-continuiing"></div>'
                        }
                        if(postData.flag.attention == 1){
                            flag2 = '<div class="flag flag-attn"></div>'
                        }
                        if(postData.flag.new == 1){
                            flag3 = '<div class="flag flag-new"></div>'
                        }
                        if(thumbSize == "2"){
                            balloonPartClass1 = 'col-12';
                            balloonPartClass2 = 'col-12';
                            balloonPartClass3 = 'col-12';
                        }else if(thumbSize == "1"){
                            balloonPartClass1 = 'col-7 col-md-12';
                            balloonPartClass2 = 'col-5 col-md-12';
                            balloonPartClass3 = 'col-12';
                        }else{
                            balloonPartClass1 = 'col-12';
                            balloonPartClass2 = 'col-12 d-none d-lg-block';
                            balloonPartClass3 = 'col-12';
                        }
                        let categoryList = "";
                        $.each(postData.cat, function (j, catId) {
                            if (!(catId in categoryIdToIndexList)) {
                                return true;
                            }
                            categoryList = categoryList + '<li><a href="category.html?id=' + catId + '">' + data.category[categoryIdToIndexList[catId]].name + '</a></li>';
                        });
                        if (postData.editor.length > 0) {
                            editorId = getEditorId(postData.editor[0]);
                        }

                        let date = postData.date.split('-');
                        let postLinkAttr = postData.ex_site_url ?
                                'href="' + postData.ex_site_url + '" rel="noopener noreferrer" target="_blank"' :
                                'href="post_' + postData.id + '.html"';

                        let dom =   '<div class="col col-12 col-md-6">' +
                                    '<div class="block block-s t-balloon t-balloon-right">' +
                                        '<div class="row">' +
                                            '<div class="col col-icon col-3 col-md-3">' +
                                                '<img class="icon" src="' + resourceImgPath + '/icon/' + postData.icon + '" />' +
                                            '</div>' +
                                            '<div class="col col-post col-9 col-md-9">' +
                                                '<div class="name">' + (postData.editor.length > 0 ? ('<a href="editor.html?editorId=' + editorId + '">' + postData.editor[0]) : '&nbsp;') + '</a></div>' +
                                                '<div class="balloon balloon-right balloon-white row">' +
                                                    '<div class="col-12">' +
                                                        '<div class="row">' +
                                                            '<div class="' + balloonPartClass1 + '">' +
                                                                '<div class="title"><a ' + postLinkAttr + '>' + postData.title + '</a></div>' +
                                                            '</div>' +
                                                            '<div class="col-12">' +
                                                                '<div class="post-date">(' + date[0] + '.' + date[1] + '.' + date[2] + ')</div>' +
                                                            '</div>' +
                                                            '<div class="' + balloonPartClass2 + '">' +
                                                                '<a ' + postLinkAttr + '><img src="' + resourceImgPath + '/post/' + postData.id + '/' + postData.thumb + '" /></a>' +
                                                            '</div>' +
                                                            '<div class="' + balloonPartClass3 + '">' +
                                                                '<ul class="post-category-list">' + categoryList + '</ul>' +
                                                            '</div>' +

                                                        '</div>' +
                                                    '</div>' +
                                                '</div>' +
                                                '<div class="flags">' + flag1 + flag2 + flag3 + '</div>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>';
                        $('#feed-posts-tgt').append(dom);
                    }

                });
            }else{
                //関連記事にデータがない場合
                let postByCat = [];
                $.each(data.post, function (i, postData) {
                    // 自身の記事は対象にしない
                    if (postData.id == postId) {
                        return true;
                    }
                    let dupCat = postData.cat.filter(x => thisPostData.cat.indexOf(x) !== -1);
                    if(dupCat != ''){
                        postByCat.push(postData);
                    }
                });
                if(postByCat.length != 0){
                    $.each(postByCat, function (i, postData) {
                        if(i > 3) return false;
                        let flag1 = "";
                        let flag2 = "";
                        let flag3 = "";
                        let thumbSize = postData.size;
                        let balloonPartClass1 = "";
                        let balloonPartClass2 = "";
                        let balloonPartClass3 = "";
                        if(postData.flag.continuiing == 1){
                            flag1 = '<div class="flag flag-continuiing"></div>'
                        }
                        if(postData.flag.attention == 1){
                            flag2 = '<div class="flag flag-attn"></div>'
                        }
                        if(postData.flag.new == 1){
                            flag3 = '<div class="flag flag-new"></div>'
                        }
                        if(thumbSize == "2"){
                            balloonPartClass1 = 'col-12';
                            balloonPartClass2 = 'col-12';
                            balloonPartClass3 = 'col-12';
                        }else if(thumbSize == "1"){
                            balloonPartClass1 = 'col-7 col-md-12';
                            balloonPartClass2 = 'col-5 col-md-12';
                            balloonPartClass3 = 'col-12';
                        }else{
                            balloonPartClass1 = 'col-12';
                            balloonPartClass2 = 'col-12 d-none d-lg-block';
                            balloonPartClass3 = 'col-12';
                        }
                        let categoryList = "";
                        $.each(postData.cat, function (j, catId) {
                            if (!(catId in categoryIdToIndexList)) {
                                return true;
                            }
                            categoryList = categoryList + '<li><a href="category.html?id=' + catId + '">' + data.category[categoryIdToIndexList[catId]].name + '</a></li>';
                        });
                        if (postData.editor.length > 0) {
                            editorId = getEditorId(postData.editor[0]);
                        }

                        let postLinkAttr = postData.ex_site_url ?
                                'href="' + postData.ex_site_url + '" rel="noopener noreferrer" target="_blank"' :
                                'href="post_' + postData.id + '.html"';

                        let dom =   '<div class="col col-12 col-md-6">' +
                                        '<div class="block block-s t-balloon t-balloon-right">' +
                                            '<div class="row">' +
                                                '<div class="col col-icon col-3 col-md-3">' +
                                                    '<img class="icon" src="' + resourceImgPath + '/icon/' + postData.icon + '" />' +
                                                '</div>' +
                                                '<div class="col col-post col-9 col-md-9">' +
                                                    '<div class="name">' + (postData.editor.length > 0 ? ('<a href="editor.html?editorId=' + editorId + '">' + postData.editor[0]) : '&nbsp;') + '</a></div>' +
                                                    '<div class="balloon balloon-right balloon-white row">' +
                                                        '<div class="col-12">' +
                                                            '<div class="row">' +
                                                                '<div class="' + balloonPartClass1 + '">' +
                                                                    '<div class="title"><a ' + postLinkAttr + '>' + postData.title + '</a></div>' +
                                                                '</div>' +
                                                                '<div class="' + balloonPartClass2 + '">' +
                                                                    '<a ' + postLinkAttr + '><img src="' + resourceImgPath + '/post/' + postData.id + '/' + postData.thumb + '" /></a>' +
                                                                '</div>' +
                                                                '<div class="' + balloonPartClass3 + '">' +
                                                                    '<ul class="post-category-list">' + categoryList + '</ul>' +
                                                                '</div>' +

                                                            '</div>' +
                                                        '</div>' +
                                                    '</div>' +
                                                    '<div class="flags">' + flag1 + flag2 + flag3 + '</div>' +
                                                '</div>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>';
                        $('#feed-posts-tgt').append(dom);
            
                    });
                }else{
                    $('#section-posts').remove();
                }
            }

            //外部サイトの関連記事データがあった場合、関連記事として表示
            if(thisPostData.ex_relate.length > 0){
                $.each(thisPostData.ex_relate, function (i, exRel) {
                    let dom =   '<div class="col col-12 col-md-6">' +
                                        '<div class="block block-s t-balloon t-balloon-right">' +
                                            '<div class="row">' +
                                                '<div class="col col-icon col-3 col-md-3">' +
                                                    '<img class="icon" src="' + resourceImgPath + '/icon/usr_icon_dummy.png" />' +
                                                '</div>' +
                                                '<div class="col col-post col-9 col-md-9">' +
                                                    '<div class="name">　</div>' +
                                                    '<div class="balloon balloon-right balloon-white row">' +
                                                        '<div class="col-12">' +
                                                            '<div class="row">' +
                                                                '<div class="col-12">' +
                                                                    '<div class="title"><a href="' + exRel.url + '">' + exRel.title + '</a></div>' +
                                                                '</div>' +
                                                                '<div class="col-12">' +
                                                                    '<a href="' + exRel.url + '"><img src="' + exRel.image + '" /></a>' +
                                                                '</div>' +
                                                            '</div>' +
                                                        '</div>' +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>';
                        $('#feed-posts-tgt').append(dom);
                });
            }

        }

    }

    //お知らせ一覧ページでのページング
    if($('body').hasClass('info')){
        let pageLength = $('body').attr('page-length');
        $('.news-feed-block-' + curPage).show();

        $('#pagenation-arrow-back').hide();
        if(pageLength == 1){
            $('#pagenation-arrow-next').hide();
        }

        // ページングボタンを押したら
        $(".btn").click(function () {
            let tgPageNum ;
            $('#pagination-numbers').find('.num').removeClass('num-active');
            $('.news-feed-block').hide();
            if($(this).hasClass('num')){
                tgPageNum = $(this).attr('num');                
                $(this).addClass('num-active');                
                $('.news-feed-block-' + tgPageNum).show();
                curPage = tgPageNum;
            }else{
                if($(this).hasClass('arrow-left')){
                    tgPageNum = Number(curPage) - 1;
                    $('.news-feed-block-' + tgPageNum).show();
                    curPage --;
                    $('.num[num=' + curPage + ']').addClass('num-active');
                }else if($(this).hasClass('arrow-right')){
                    tgPageNum = Number(curPage) + 1;
                    $('.news-feed-block-' + tgPageNum).show();
                    curPage ++;
                    $('.num[num=' + curPage + ']').addClass('num-active');
                }
            }
            if(curPage == 1){
                $('#pagenation-arrow-back').hide();
                if(pageLength >= 2){
                    $('#pagenation-arrow-next').show();
                }
            }else if(curPage == pageLength){
                $('#pagenation-arrow-next').hide();
                if(pageLength >= 2){
                    $('#pagenation-arrow-back').show();
                }
            }else{
                $('#pagenation-arrow-back').show();
                $('#pagenation-arrow-next').show();
            }
            console.log(curPage);

            $('body, html').animate({scrollTop: 0}, 200);

        });
        
    }

    //サイドバーのカテゴリ一覧の生成
    if($('body').hasClass('post') || $('body').hasClass('postlist') || $('body').hasClass('category') || $('body').hasClass('editor') ){
        $.each(data.category, function (i, catData) {
            let catId = catData.id;
            let catShowFlag = false;
            $.each(data.post, function (j, postData) {
                $.each(postData.cat, function (j, relCatId) {
                    if(relCatId == catId){
                        catShowFlag = true;
                        return false;
                    }
                });
                if(catShowFlag){
                    return false;
                }
            });
            if(catShowFlag){
                let dom = '<li><a href="category.html?id=' + catData.id + '">' + catData.name + '</a></li>';
                $('#sidebar').find('#category-list').append(dom);
            }
        });
    }

    // 個別記事内の目次のページ内スクロール
    $('.t-table-of-contents a[href^="#"]').click(function() {
        let elemHash = $(this).attr('href');
        let pos =  $(elemHash).offset().top - 30;
        $('body,html').animate({
            scrollTop: pos
        },
        500);
        return false;
    });

    // チェックシートがある場合
    let checkSheet = document.getElementById('checksheet');
    if(checkSheet){
        window.addEventListener('message', function(e) {
            let iframe = $("#checksheet");
            var eventName = e.data[0];
            var data = e.data[1];
            switch(eventName) {
                case 'setHeight':
                    iframe.height(data);
                    break;
                }
        }, false);
    }
});

function noscroll(e){
    e.preventDefault();
 }

function init(){

}

function getParam(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}




function setLayout(){
}

function setLinks(){

}

function setLinksByTag(){
}

function getEditorId(editorName) {
    let editorId;
    $.each(data.editor, function (i, editorData) {                    
        if(editorName == editorData.name + ' ' + editorData.role){
            editorId = editorData.id;
            return false;
        }
    });

    return editorId;
}

function createCommentDom(comment, postIdToIndexList) {
    let commentTextSrc = comment.text.replace(/(\r\n|\n|\r)/gm, '<br />');
    let commentTextArr = commentTextSrc.split('<br />');
    let commentTextFirst = commentTextArr[0];
    
    let dom;
    let thumbPath;
    let postLinkAttr;
    let commentTextDom;

    if (commentTextArr.length > 1) {
        commentTextDom =    '<span>' + 
                                '<span class="comment-text-first">' + commentTextFirst + '</span>' +
                                '<span class="show-cmnt" onclick="showMoreComment(this)">(続きを見る)</span>' +
                            '</span>' +
                            '<span style="display: none;">' + 
                                '<span class="comment-text">' + commentTextSrc + '</span>' +
                                '<span class="hide-cmnt" onclick="hideMoreComment(this)">(元に戻す)</span>' +
                            '</span>';

    } else {
        commentTextDom = '<span class="comment-text-first">' + commentTextFirst + '</span>';
    }


    if (comment.relate in postIdToIndexList) {
        let postData = data.post[postIdToIndexList[comment.relate]];
        thumbPath = postData.thumb;
        postLinkAttr = postData.ex_site_url ?
                'href="' + postData.ex_site_url + '" rel="noopener noreferrer" target="_blank"' :
                'href="post_' + postData.id + '.html"';
    }
    if(comment.relate == '0' || comment.thumb == '0'){
        dom =  '<div class="block t-balloon t-balloon-right">' +
                    '<div class="row">' +
                        '<div class="col col-icon col-2">' +
                            '<img class="icon" src="' + resourceImgPath + '/icon/' + comment.icon + '" />' +
                        '</div>' +
                        '<div class="col col-post col-10">' +
                            '<div class="name">' + comment.name + '</div>' +
                            '<div class="balloon balloon-right balloon-yellow row">' +
                                '<div class="col-12 comment-tx">' + commentTextDom + '</div>' +
                            '</div>' +
                            (comment.relate != '0' ? '<a class="detail" ' + postLinkAttr + '>記事はこちら</a>' : '') +
                        '</div>' +
                    '</div>' +
                '</div>';
    }else if(comment.thumb == '1'){
        dom =   '<div class="block t-balloon t-balloon-right">' +
                    '<div class="row">' +
                        '<div class="col col-icon col-2">' +
                            '<img class="icon" src="' + resourceImgPath + '/icon/' + comment.icon + '" />' +
                        '</div>' +
                        '<div class="col col-post col-10">' +
                            '<div class="name">' + comment.name + '</div>' +
                            '<div class="balloon balloon-right balloon-yellow row d-flex">' +
                                '<div class="col col-12 col-md-9 comment-tx">' + commentTextDom + '</div>' +
                                '<div class="col col-6 col-md-3 col-comment-thumb">' +
                                    '<a ' + postLinkAttr + '><img src="' + resourceImgPath + '/post/' + comment.relate + '/' + thumbPath + '" /></a>' +
                                '</div>' +
                            '</div>' +
                            '<a class="detail" ' + postLinkAttr + '>記事はこちら</a>' +
                        '</div>' +
                    '</div>' +
                '</div>';
    }else{
        dom =   '<div class="block t-balloon t-balloon-right">' +
                    '<div class="row">' +
                        '<div class="col col-icon col-2">' +
                            '<img class="icon" src="' + resourceImgPath + '/icon/' + comment.icon + '" />' +
                        '</div>' +
                        '<div class="col col-post col-10">' +
                            '<div class="name">' + comment.name + '</div>' +
                            '<div class="balloon balloon-right balloon-yellow row d-flex">' +
                                '<div class="col col-12 col-md-7 comment-tx">' + commentTextDom + '</div>' +
                                '<div class="col col-6 col-md-5 col-comment-thumb">' +
                                    '<a ' + postLinkAttr + '><img src="' + resourceImgPath + '/post/' + comment.relate + '/' + thumbPath + '" /></a>' +
                                '</div>' +
                            '</div>' +
                            '<a class="detail" ' + postLinkAttr + '>記事はこちら</a>' +
                        '</div>' +
                    '</div>' +
                '</div>';
    }

    return dom;
}

function waitForImagesToLoad(element) {
    return new Promise((resolve, reject) => {
        const images = element.querySelectorAll('img');
        const promises = [];
    
        images.forEach((img) => {
            const promise = new Promise((imgResolve, imgReject) => {
                if (img.complete) {
                    imgResolve();
                } else {
                    img.onload = imgResolve;
                    img.onerror = imgResolve;
                }
            });
        
            promises.push(promise);
        });
    
        Promise.all(promises)
            .then(() => {
                resolve();
            })
            .catch((error) => {
                reject(error);
            });
    });
}

function showMoreComment(element) {
    showMoreCommentFunc(element);
}

function hideMoreComment(element) {
    hideMoreCommentFunc(element);
};