var conf = {
    lang : 'en',
    ver: '',
    //lang : 'pl',
    text : {
        pl : {
            title : 'Kulki',
            score : 'PUNKTY',
            game_over : 'Koniec gry',
            clear: 'Czyść',
            alternative : 'Aby zagrać w grę musisz posiadać nową wersję przeglądarki (rekomendowane przeglądarki: firefox lub chrome)',
        },
        en : {
            title : 'Ball lines',
            score : 'SCORE',
            game_over : 'Game over',
            clear: 'Clear',
            alternative : 'In order to play with this game, You have to install a new web browser (recommend: firefox or chrome)',
        }
    },
    color :{
        theme_logo_blue: '#b1ccdd',
        theme_black: '#050505',
        theme_light_black: '#191919',
        theme_logo_red: '#ff5050',
        theme_light_blue: '#d9d9d9',
        theme_a_blue:'#174f82'
    },

    color_ball :[
         '#FFFF00', //0  yellow
         '#FF0000',  //1  red
         '#0000FF',  //2  blue
         '#00FF00', //3  gren
         '#00FFFF', //4  light blue
         '#000000', //5  black
         '#8B4513', //6 brown

         '#FF00FF', //7  light red
         '#909090', //8 grey
         '#99FF99' //9  light green -- kiepsko widoczny kolor!!!!
    ],
    settings : {
        sizeLoader : 1,
        //ticPadding : 4,
        ticPadding : 10,
        ticPaddingMark : 5,
        ticPaddingX : 14,
        ticWidth : 6,
        ticWidthX : 4
    },
    action :{
        rows : 9,
        cols : 9,
        len : 5,
        blank : -1,
        balls_color_no : 6, //dotyczy kolorow, 8-trudno wygrac
        balls_next_no : 3,
        balls_init_no : 5,
        score : 0
    }

};

if (Modernizr.canvas ){

    window.addEventListener("load", function() {
        if(typeof  lang !==  'undefined' ){
            conf.lang =  lang;
        }

        if(typeof  balllinesV2 !==  'undefined' ){
            conf.ver = '2';	
            conf.action.rows = 8;	
            conf.action.cols = 8;	
            conf.action.len = 4; 
            conf.action.balls_next_no = 4;
            conf.action.balls_color_no = 7; 
            conf.text.pl.title = 'Kulki v2';
            conf.text.en.title = 'Ball lines v2';
            var jewelProto = document.getElementById(  'square-size-checkers' );
            var rect = jewelProto.getBoundingClientRect();
            conf.settings.ticSize = rect.width;

            var balllines_score =  JSON.parse(localStorage.getItem('balllines_score2' ));
        }else if(typeof  balllinesV3 !==  'undefined' ){
            conf.ver = '3';	
            conf.action.rows = 10;	
            conf.action.cols = 10;	
            conf.action.len = 6; 
            conf.action.balls_color_no = 6; 
	    conf.action.balls_next_no = 2;
            conf.text.pl.title = 'Kulki v3';
            conf.text.en.title = 'Ball lines v3';
            var jewelProto = document.getElementById(   'square-size-ten'  );
            var rect = jewelProto.getBoundingClientRect();
            conf.settings.ticSize = rect.width;

            var balllines_score =  JSON.parse(localStorage.getItem('balllines_score3' ));
        }else{
            conf.ver = '1';	
            var jewelProto = document.getElementById(  'square-size'  );
            var rect = jewelProto.getBoundingClientRect();
            conf.settings.ticSize = rect.width;

            var balllines_score =  JSON.parse(localStorage.getItem('balllines_score1' ));
        }


        if(balllines_score){
          conf.action.score = balllines_score;
          //localStorage.removeItem('balllines_score');
        }else{
          conf.action.score = 0;
        }

        display.initialize( conf );

    }, false);

}else{
    alert(  conf.text['pl'].alternative +  " / " +    conf.text['en'].alternative );
}
