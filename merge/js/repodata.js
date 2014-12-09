/*--repodata.js--; started at 2014.10-24-0948.25edt by Liang */
/* Repository data Retrievel module */
/******************************************************************************/
function get_next_pos( d ){
    var res = d[ 0 ].node ;
    /***/
    return res;
}
/******************************************************************************/
function meg( td, dd, endpoint ){
    var res = new Array();
    res = dd;
    var cnt = td.changesets.length ;
    var i;
    for( i = (cnt - 1) ; i > 0 ; i-- ){
        res.unshift( td.changesets[i] );
    }
    /**/
    if( endpoint ){
        res.unshift( td.changesets[ 0 ] );
    }
    /***/
    return res;
}
/******************************************************************************/
function get_repo( repo_server, repo_path ){
    var res = 0 ;
    /***/
    if( repo_server == 'bitbucket.org' ){
        /* bitbucket */
        //res = get_bb_repo( repo_path );
        res = get_bb_sfetch( repo_path );
    }else{
        /* github */
        res = get_gt_repo( repo_path );
    }
    return res;
}
/******************************************************************************/
function get_bb_sfetch( repo_path ){
    var res = 0;
    var DD = new Array();
    /**/
    var consumer = read_consumer();
    if( consumer ){
        consumer_key = consumer.public ;
        consumer_sec = consumer.secret ;
    }else{
        consumer_key = 'zrB43B3MSYDfY3kkK6' ;
        consumer_sec = 'ArcubcBnGjHstAcFuk6k4mQqVgvCJaX7' ;
    }
    /***/
    DD = get_wholedata( repo_path, '', 50, consumer_key, consumer_sec );
    /***/
    window.localStorage.setItem( 'rawdata', JSON.stringify(DD) );
    res = DD.length ;
    return res;
}
/******************************************************************************/
function get_bb_repo( repo_path ){
    var res = 0;
    var DD = [];
    /**/
    var consumer = read_consumer();
    if( consumer ){
        /* user customized OAuth data. */
    }else{
        consumer = {
            public:'zrB43B3MSYDfY3kkK6',
            secret:'ArcubcBnGjHstAcFuk6k4mQqVgvCJaX7',
        } ;
    }
    /***/
    /* get the first 50, and check the total commit count */
    var HR = get_bb_single_fetch( repo_path, consumer, '' );
    var TD = HR.rawdata ;
    var pos = get_next_pos( TD.changesets );
    DD = meg(TD, DD, true);
    /**/
    var tcnt = TD.count ;
    if( tcnt > 50 ){
        /* fetch more */
        var repeat = Math.ceil( (tcnt - 50)/49 ) ;
        var i;
        for( i = 0 ; i < repeat ; i++ ){
            HR = get_bb_single_fetch( repo_path, consumer, pos );
            TD = HR.rawdata ;
            pos = get_next_pos( TD.changesets );
            /**/
            DD = meg( TD, DD, false );
        }
    }
    /***/
    window.localStorage.setItem( 'rawdata', JSON.stringify(DD) );
    res = DD.length ;
    return res;
}
/******************************************************************************/
function get_bb_single_fetch( repo_path, consumerKP, pos ){
    /* This function is re-written by Liang based on Sai's protocol code. */
    var res;
    /***/
    /* OAuth */
    var oa_param = {
        consumer: {
                    public: consumerKP.public,
                    secret: consumerKP.secret,
        },
        signature_method: 'PLAINTEXT',
        nonce_length: 29,
        version: '1.0',
        parameter_seperator: ', ',
    };
    var oai = new OAuth( oa_param );
    oai.Nonce = oai.getNonce();
    oai.Signature = oai.consumer.secret + '%26' ;
    oai.TimeStamp = oai.getTimeStamp();
    /***/
    /* combine URL */
    var sURL = 'https://bitbucket.org/api/1.0/repositories/' + repo_path + '/changesets/'
                + '?oauth_signature_method=' + oai.signature_method
        + '&oauth_nonce=' + oai.Nonce
        + '&oauth_timestamp=' + oai.TimeStamp
        + '&oauth_version=' + oai.version
        + '&oauth_consumer_key=' + oai.consumer.public
        + '&oauth_signature=' + oai.Signature
    ;
    if( pos == ''){
        sURL = sURL + '&limit=50' ;
    }else{
        sURL = sURL + '&limit=50' + '&start=' + pos ;
    }
    /***/
    /* send request */
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open( 'GET', sURL, false );
	xmlhttp.send();
    /* get response */
    res = {
        ready: xmlhttp.readyState,
        status: xmlhttp.status,
    };
    if( xmlhttp.readyState == 4 ){
        if( xmlhttp.status == 200 ){
            var xmldoc = xmlhttp.responseText;
            var xhrRes = eval('(' + xmldoc + ')');
            /***/
            res['rawdata'] = xhrRes;
        }else{
            /* console.log('http: err,status = '+ xmlhttp.readyState +','+ xmlhttp.status); */
        }
    }else{
        /* console.log('http: err = '+ xmlhttp.readyState ); */
        /* FIXME HERE */
    }
    /***/
    return res;
}
/******************************************************************************/
function get_gt_repo( repo_path ){
    var res = 0 ;
    /***/
    /* TODO-Liang: call get_gt_single_fetch() */
    /***/
    return res;
}
/******************************************************************************/
function get_gt_single_fetch( repo_path, consumerKP, pos ){
    var res = {} ;
    return res;
}
/******************************************************************************/
/*--EOF--*/