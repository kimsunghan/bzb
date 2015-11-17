
(function() {



    document.addEventListener('DOMContentLoaded', function() {
        /*origin chat height*/
        const ORIGIN_HEIGHT = 384;//document.getElementsByClassName('chat')[0].offsetHeight;
        
        /*Get elements*/
        var bizvi = document.getElementById('bizvi');
        var bizvi_chat = document.getElementById('bizvi-chat');
        var chat = bizvi_chat.getElementsByClassName('chat')[0];
        var chatMessageCounter = bizvi_chat.getElementsByClassName('chat-message-counter')[0];
        var bizvi_header = bizvi_chat.getElementsByTagName('header')[0];
        var bizvi_icon = bizvi.getElementsByClassName('bizvi-icon')[0];

//////////////////////////////////////////////////////////style start
        
        /*init style*/
        bizvi_chat.getElementsByClassName('chat-message-counter')[0].style.display = 'none';
        bizvi_chat.getElementsByClassName('chat-message-counter')[0].style.display = 'block';
        resize();
        
//////////////////////////////////////////////////////////style end

        ///////////////////////////////////////////event 성한

////////////////////////////////////////////////////////////event 성한 끝


//////////////////////////////////////////////////////////events start

        
        /*header click event*/
        bizvi_header.onclick = function(){            
            /*브라우저 창 크기에 따른 헤더 이벤트 다름*/
            if(/*chat.offsetHeight==ORIGIN_HEIGHT && */window.innerWidth<980){
                this.style.display = 'none';
                chat.style.height = '0px';
                bizvi.getElementsByClassName('bizvi-icon')[0].style.display = 'block';

                
                chatMessageCounterToggle(chatMessageCounter);
            }else if(window.innerWidth>=980){
                slideToggle(chat, 0, 5.0);
                chatMessageCounterToggle(chatMessageCounter);
            }
        };
        
        /*icon click event*/
        bizvi_icon.onclick = function(){
            chatMessageCounterToggle(chatMessageCounter);
            chat.style.height = ORIGIN_HEIGHT + 'px';
            bizvi_header.style.display = 'block';
            bizvi_icon.style.display = 'none';

        }

        /*visitor's typing enterkey press event*/
        document.getElementById('bizvichat-visitor-typing').onkeypress = function(e){
            if (e.keyCode == 13) {
                sendMessage();
                return false;
            }
        }
        
        /*visitor's typing enterkey click event*/
        document.getElementById('bizvichat-enterKey').onclick = function(e){
            e.preventDefault();
            sendMessage();
        }
        
//////////////////////////////////////////////////////////events end

 //////////////////////////////////////////////////////////성한 function





//////////////////////////////////////////////////////////functions1 대규
        
        /*send message*/
        function sendMessage(){
            var message = document.getElementById('bizvichat-visitor-typing');


            if(message != ''){
                addViMessage(message.value);
                socket.emit('sendchat', message.value);
            }
            message.value = '';
            setReadPosition();
            getReadPosition();
        }
        
        /*Add biz message*/
    /*    function addBizMessage(message) {
            var div1 = document.createElement('div');
            div1.classList.add('biz-chat-message', 'clearfix');

            var img1 = document.createElement('img');
            img1.src = 'http://gravatar.com/avatar/2c0ad52fc5943b78d6abe069cc08f320?s=32';
            img1.style.height = '32px';
            img1.style.width = '32px';

            var div2 = document.createElement('div');
            div2.classList.add('chat-message-content', 'clearfix');

            var span1 = document.createElement('span');
            span1.classList.add('chat-time');
            span1.innerHTML = '14:02';

            var h5_1 = document.createElement('h5');
            h5_1.classList.add('biz');
            h5_1.innerHTML = '상담자';

            var p1 = document.createElement('p');
            p1.innerHTML = message;

            var hr1 = document.createElement('hr');

            div1.appendChild(img1);
            div1.appendChild(div2);

            div2.appendChild(span1);
            div2.appendChild(h5_1);
            div2.appendChild(p1);

            bizvi_chat.getElementsByClassName('chat-history')[0].appendChild(div1);
            bizvi_chat.getElementsByClassName('chat-history')[0].appendChild(hr1);
        }*/
        
        /*Add visitor message*/
        function addViMessage(message) {
            var div1 = document.createElement('div');
            div1.classList.add('vi-chat-message', 'clearfix');
            
            var img1 = document.createElement('img');
            img1.src = 'http://gravatar.com/avatar/2c0ad52fc5943b78d6abe069cc08f320?s=32';
            img1.style.height = '32px';
            img1.style.width = '32px';
            
            var div2 = document.createElement('div');
            div2.classList.add('chat-message-content', 'clearfix');
            
            var span1 = document.createElement('span');
            span1.classList.add('chat-time');
            span1.innerHTML = '14:02';
            
            var h5_1 = document.createElement('h5');
            h5_1.classList.add('visitor');
            h5_1.innerHTML = '고객';
            
            var p1 = document.createElement('p');
            p1.innerHTML = message;
            
            var hr1 = document.createElement('hr');
            
            div1.appendChild(img1);
            div1.appendChild(div2);
            
            div2.appendChild(span1);
            div2.appendChild(h5_1);
            div2.appendChild(p1);
            
            bizvi_chat.getElementsByClassName('chat-history')[0].appendChild(div1);
            bizvi_chat.getElementsByClassName('chat-history')[0].appendChild(hr1);
        }
        
        /*slide toggle effect function*/
        function slideToggle(element, minHeight, speed){
            var realHeight = element.offsetHeight;

            function slideDown() {
                element.style.height = realHeight + 'px';
                realHeight-=speed;

                if (minHeight >= realHeight) {
                    element.style.height = 0 + 'px';
                    clearInterval(slideDownTimer);
                } 
            }

            function slideUp() {
                element.style.height = realHeight + 'px';
                realHeight+=speed;

                if (ORIGIN_HEIGHT <= realHeight ) {
                    element.style.height = ORIGIN_HEIGHT + 'px';
                    clearInterval(slideUpTimer);
                }
            }

            if (minHeight < realHeight) {
                var slideDownTimer = setInterval(slideDown, 1);
            } else if (minHeight == realHeight) {
                var slideUpTimer = setInterval(slideUp, 1);
            }
        }

        /*chatMessageCounter toggle effect function*/
        function chatMessageCounterToggle(element){
            var chatHeight = bizvi_chat.getElementsByClassName('chat')[0].offsetHeight;
            
            if(chatHeight == 0){
                element.style.display = 'none';
                setReadPosition();  //닫기 전 읽었던 곳 위치 정하기
            }else if(chatHeight != 0){
                element.style.display = 'block';
                getReadPosition();  //이전에 읽었던 곳 위치 가져오기
            }
        }
        
        /*set read message function -> scroll position*/
        function setReadPosition(){
            var chatHr = bizvi_chat.getElementsByClassName('chat-history')[0].getElementsByTagName('hr');
            
            chatHr[chatHr.length-1].classList.add('read');
        }
        
        /*get read message function -> scroll position*/
        function getReadPosition(){
            var checkReadPosition = bizvi_chat.getElementsByClassName('read')[0];
            
            bizvi_chat.getElementsByClassName('chat-history')[0].scrollTop = checkReadPosition.offsetTop;
            
            checkReadPosition.classList.remove('read');
        }
        
        /*window resize function*/
        function resize(){
            if (window.matchMedia("(max-width: 980px)").matches) {
                if(document.getElementsByClassName('chat')[0].offsetHeight==0){
                    bizvi_chat.getElementsByTagName('header')[0].style.display = 'none';
                    bizvi.getElementsByClassName('bizvi-icon')[0].style.display = 'block';
                    chatMessageCounter.style.display = 'block';
                    /*
                    bizvi_chat.style.display = 'none';
                    bizvi_chat.style.height = '10px';
                    bizvi_chat.style.width = '10px';*/
                }else if(document.getElementsByClassName('chat')[0].offsetHeight==ORIGIN_HEIGHT){
                }
            } else {
                if(document.getElementsByClassName('chat')[0].offsetHeight==0){
                    bizvi.getElementsByClassName('bizvi-icon')[0].style.display = 'none';
                    bizvi_chat.getElementsByTagName('header')[0].style.display = 'block';
                    chatMessageCounter.style.display = 'block';
                }else if(document.getElementsByClassName('chat')[0].offsetHeight==ORIGIN_HEIGHT){
                }
            }
        }
        
//////////////////////////////////////////////////////////functions end
        
//////////////////////////////////////////////////////////run start
        
        window.onresize = resize;
        
//////////////////////////////////////////////////////////run end
    });
}) ();