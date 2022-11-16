display = (function() {
    var
        ver,
        balllines_matrix_rand,
        balllines_matrix_next,
        balllines_score,

        color_ball,
        lang,
        cols,
        rows,
        blank,
        path,
        matrix_rand,
        matrix_next,
        game_over,
        div_msg,

        ticSize,
        ticPadding,
        ticPaddingMark,
        ticPaddingX,
        ticWidth,
        ticWidthX,
        sizeLoader,
        theme_black,
        theme_logo_red,

        ctx,
        canvas;

    function initialize( conf ){
        ver = conf.ver;
        //balllines_matrix_rand = 'balllines_matrix_rand'+ver;
        //balllines_matrix_next = 'balllines_matrix_next'+ver;
        //balllines_score = 'balllines_score'+ver;

        blank = conf.action.blank;
        setup( conf  );
        div_msg =  document.getElementById('msg');
        div_msg.textContent = '';

        game_over = false;

        logic.init( conf.action );
        drawScore();

        matrix_rand =  logic.getEmptyMatrix();

        if( '1'  === ver  ){
            var balllines_matrix_rand = JSON.parse(localStorage.getItem('balllines_matrix_rand1'));
        }
        if( '2'  === ver  ){
            var balllines_matrix_rand = JSON.parse(localStorage.getItem('balllines_matrix_rand2'));
        }
        if( '3'  === ver  ){
            var balllines_matrix_rand = JSON.parse(localStorage.getItem('balllines_matrix_rand3'));
        }


        if(balllines_matrix_rand){
          matrix_rand = logic.copyMarix( balllines_matrix_rand );
        }else{
          matrix_rand =  logic.getRandomMatrix( matrix_rand,  conf.action.balls_init_no  );
        }
        drawBalls( matrix_rand, 'o' , ticPadding, 0 );

        if( '1'  === ver  ){
            var balllines_matrix_next = JSON.parse(localStorage.getItem('balllines_matrix_next1'));
        }
        if( '2'  === ver  ){
            var balllines_matrix_next = JSON.parse(localStorage.getItem('balllines_matrix_next2'));
        }
        if( '3'  === ver  ){
            var balllines_matrix_next = JSON.parse(localStorage.getItem('balllines_matrix_next3'));
        }

        if(balllines_matrix_next){
          matrix_next = logic.copyMarix( balllines_matrix_next );
        }else{
          matrix_next = logic.getRandomMatrix( matrix_rand,  conf.action.balls_next_no );
        }

        drawBalls( matrix_next, 'x', ticPadding, 0  );

        path = { 'init':0, 'start_x':'', 'start_y':'' };
        canvas.addEventListener("click",  clickBall, false);
        document.getElementById('clear').addEventListener("click",  clearBoard, false);
    }

    function drawScore(){
        document.getElementById('you_score').textContent = logic.getScore();
    }

    function clearBoard(){
      setTimeout(function(){
          boardElement.removeChild(canvas);

          if( '1'  === ver  ){
                  localStorage.removeItem('balllines_matrix_next1');
                  localStorage.removeItem('balllines_matrix_rand1');
                  localStorage.removeItem('balllines_score1');
          }

          if( '2'  === ver  ){
                  localStorage.removeItem('balllines_matrix_next2');
                  localStorage.removeItem('balllines_matrix_rand2');
                  localStorage.removeItem('balllines_score2');
          }

          if( '3'  === ver  ){
                  localStorage.removeItem('balllines_matrix_next3');
                  localStorage.removeItem('balllines_matrix_rand3');
                  localStorage.removeItem('balllines_score3');
          }

          conf.action.score = 0;
          initialize( conf  );
      },4000);
    }

    function clickBall(e){
        if(  game_over == true  ){
            return false;
        }

        rect = canvas.getBoundingClientRect()

        relX = e.clientX - rect.left;
        relY = e.clientY - rect.top;

        ticX = Math.floor( (relX / rect.width) * cols);
        ticY = Math.floor( (relY / rect.width) * rows);

        // gdy pomlil nam sie punkt startu
        if( (  path.init == 1  ) && (path.start_x == ticX) &&  ( path.start_y == ticY)  ){
            //console.log( "=mistake=" );

            createBackgroundItem( ticX, ticY );
            drawTic(  ticX, ticY, matrix_rand[ticX][ticY], 'o', ticPadding );

            path.init = 0;
            path.start_x = '';
            path.start_y = '';

        }

        // definijujemy punkt startu
        // tego w ife nie moze byc path.init == 0
        else if( ( matrix_rand[ticX][ticY] != blank )   ){
            //console.log( "punkt_start" );

            drawBalls( matrix_rand, 'o',  ticPadding, 1  );
            var color =  matrix_rand[ticX][ticY];
            drawTic( ticX, ticY,  color, 'o', ticPaddingMark );

            path.start_x = ticX;
            path.start_y = ticY;
            path.color =   color;
            path.init = 1;

        }

        // definijujemy punkt stopu
        else if( ( matrix_rand[ticX][ticY] == blank ) && (  path.init == 1  )   ){
            //console.log( "punkt_stop" );

            path.stop_x = ticX;
            path.stop_y = ticY;
            //console.log( path );

            var matrix_transform  = logic.transformMatrix( matrix_rand );
            var graph = new Graph(
                matrix_transform
            );
            var start = graph.nodes[path.start_x][path.start_y];
            var end = graph.nodes[path.stop_x][path.stop_y];
            var result = astar.search(graph.nodes, start, end);
            //console.log(  result  );
            if( result.length == 0 ){
                //console.log( 'no_way' );
                return false;
            }
            path.init = 0;

            createBackgroundItem( path.start_x  ,  path.start_y  );
            matrix_rand[path.start_x][path.start_y] =  blank;

            drawTic(  ticX, ticY,  path.color, 'o', ticPadding );
            matrix_rand[ticX][ticY] =  path.color;

            counter++;

            var matrix_rand_before_sum = logic.copyMarix( matrix_rand );
            matrix_rand = logic.sumMatrix( matrix_rand, matrix_next );
            //kolejnosc wazna - przypadek ze zniknie samo
            var m_ball_to_del = logic.getFilterMatch( matrix_rand );
            if(  m_ball_to_del   != false  ){
                matrix_rand = logic.delBall(  matrix_rand_before_sum,  m_ball_to_del );
                matrix_next = logic.delBall(  matrix_next,  m_ball_to_del );
                delBalls( m_ball_to_del );
                drawScore();
                //console.log( 'waiting' );//czekam kolejke
                return false;
            }


            drawBalls( matrix_rand, 'o', ticPadding, 0  );

            var balls_next_no_tmp0 = logic.getBallsNextNo();
            matrix_next =   logic.getRandomMatrix( matrix_rand, balls_next_no_tmp0 );
            if( matrix_next == false  ){
                div_msg.textContent =   conf.text[lang].game_over;
                game_over = true;
                clearBoard();

                // localStorage.removeItem('balllines_matrix_rand');
                // localStorage.removeItem('balllines_matrix_next');
                // setTimeout(function(){
                //     boardElement.removeChild(canvas);
                //     initialize( conf  );
                // },6000);

                return false;
            }
            drawBalls( matrix_next, 'x', ticPadding, 0  );
        }

        if( '1'  === ver  ){
                localStorage.setItem('balllines_matrix_rand1',  JSON.stringify(matrix_rand));
                localStorage.setItem('balllines_matrix_next1',  JSON.stringify(matrix_next));
                var logicScore = logic.getScore();
                localStorage.setItem('balllines_score1',  JSON.stringify(logicScore))
        }
        if( '2'  === ver  ){
                localStorage.setItem('balllines_matrix_rand2',  JSON.stringify(matrix_rand));
                localStorage.setItem('balllines_matrix_next2',  JSON.stringify(matrix_next));
                var logicScore = logic.getScore();
                localStorage.setItem('balllines_score2',  JSON.stringify(logicScore))
        }
        if( '3'  === ver  ){
                localStorage.setItem('balllines_matrix_rand3',  JSON.stringify(matrix_rand));
                localStorage.setItem('balllines_matrix_next3',  JSON.stringify(matrix_next));
                var logicScore = logic.getScore();
                localStorage.setItem('balllines_score3',  JSON.stringify(logicScore))
        }





    }

    function delBalls( matrix_ball_to_del  ){

        for (var x=0;x<cols;x++) {
            for (var y=0;y<rows;y++) {
                if( matrix_ball_to_del[x][y] != blank ){
                    createBackgroundItem( x, y );
                }
            }
        }
    }

    function drawBalls( matrix_inner, tic, ticPadding_in, restetBackground   ){

        for (var x=0;x<cols;x++) {
            //matrix[x] = [];
            for (var y=0;y<rows;y++) {
                var color =  matrix_inner[x][y];
                if( color != blank  ){
                    //console.log(ticPadding);
                    if( restetBackground == 1 ){
                        createBackgroundItem( x,y );
                    }
                    drawTic( x, y, color, tic, ticPadding_in );
                }
            }
        }
    }


    function setup( ttt ) {
        color_ball = ttt.color_ball,
        lang = ttt.lang,
        cols = ttt.action.cols,
        rows = ttt.action.rows,
        ticSize = ttt.settings.ticSize,
        ticPadding = ttt.settings.ticPadding,
        ticPaddingMark = ttt.settings.ticPaddingMark,
        ticPaddingX = ttt.settings.ticPaddingX,
        ticWidth = ttt.settings.ticWidth,
        ticWidthX = ttt.settings.ticWidthX,
        theme_black = ttt.color.theme_black,
        theme_logo_red = ttt.color.theme_logo_red,
        theme_light_black = ttt.color.theme_light_black,
        sizeLoader = ttt.settings.sizeLoader;


        canvas = document.createElement("canvas");
        canvas.id = "main_canvas";
        canvas.width = cols * ticSize;
        canvas.height = rows * ticSize;
        ctx = canvas.getContext("2d");
        createBackground(  );


        boardElement = document.getElementById("game-board");
        boardElement.appendChild(canvas);

        div_msg = document.getElementById('msg');
        div_msg.style.height = (sizeLoader * ticSize) +"px";
        div_msg.style.width = (cols  * ticSize ) + "px";
        div_msg.style.paddingTop =  '3px';


        var widthGame = cols  * ticSize;


        var el_header =  document.getElementsByTagName('header');
        if( el_header.length  ){
            el_header[0].style.width = widthGame + "px";
            el_header[0].style.height = ticSize + "px";
        }
        document.getElementById('score').style.width = widthGame + "px";

        var el_h1 =  document.getElementsByTagName('h1');
        if( el_h1.length  ){
            el_h1[0].textContent = ttt.text[lang].title;
        }
        document.getElementById('you').textContent = ttt.text[lang].score;
        document.getElementById('clear').textContent = ttt.text[lang].clear;
    }

    function createBackground( ){
        var x_start = 0;
        var y_itart = 0;

        for (var x=0;x<cols;x++) {
            for (var y=0;y<rows;y++) {
                createBackgroundItem( x,y );
            }
        }
    }

    function createBackgroundItem( x,y ){
        x_start = x * ticSize;
        y_start = y * ticSize;
        ctx.fillStyle =( ((x+y) % 2) ? conf.color.theme_light_blue : '#FFFFFF' );
        ctx.fillRect( x_start, y_start, ticSize, ticSize);
    }


    function drawO( octx, start_x, start_y, color_num, ticPadding_inner   ){
        var half = Math.floor(ticSize/2);
        var r =  half - ticPadding_inner;

        octx.beginPath();
        octx.arc(  start_x + half, start_y + half,  r  , 0, 2 * Math.PI, false);

        octx.fillStyle =  color_ball[color_num];   //color_ball.1;
        octx.fill();
        octx.lineWidth =  ticWidth;
        octx.strokeStyle =  color_ball[color_num];
        octx.stroke();

    }

    function drawX( xctx,  start_x, start_y, color_num  ){
        var endP = ticSize - ticPaddingX;
        var x_start_point = start_x + ticPaddingX;
        var x_stop_point = start_x + endP;
        var y_start_point =  start_y +  ticPaddingX;
        var y_stop_point =  start_y + endP;

        xctx.beginPath();
        xctx.moveTo( x_start_point , y_start_point );
        xctx.lineTo( x_stop_point  , y_stop_point  );
        xctx.moveTo( x_start_point , y_stop_point  );
        xctx.lineTo( x_stop_point  , y_start_point );

        xctx.lineWidth =  ticWidthX;
        xctx.strokeStyle = color_ball[color_num];
        xctx.stroke();
    }


    function drawTic( x_p, y_p,  color_num, tic, ticPadding_in  ){
        //w innych miejscach tez to dalem - wtedy bedzie to nadmiarowe
        //x -> o dlatego to dalem
        createBackgroundItem( x_p, y_p );
        var x_start = x_p * ticSize;
        var y_start = y_p * ticSize;
        ( tic == 'o'   ) ?  drawO(ctx, x_start, y_start,   color_num, ticPadding_in  ) :  drawX(ctx, x_start, y_start, color_num  );
    }

    return {
        initialize : initialize
    }
})();
