/*--sdfetch.js--*/
/* thanksgiving tested Sai's code ; minor modifications were made. */
/******************************************************************************/
function get_wholedata( input_path, start, limit, consumer_key_input, consumer_secrete_input ){
    var max_fetch = 50;
    /* first 50 or 49 */
    console.log( 'get_wholedata::part1' );
    /***/
    var obj_changesets = get_changesets( input_path,start, limit, consumer_key_input, consumer_secrete_input );
    var total_count = obj_changesets.count;

    var total_times;
    if( total_count%(max_fetch-1) != 0 ){
        total_times = parseInt( total_count/(max_fetch-1) )+1;    
    }else{
        total_times = parseInt ( total_count/(max_fetch-1) );
    }

    var commit = new Array();

    var num_copy_to_commit;
    if( obj_changesets.changesets.length == 50 ){
        num_copy_to_commit = 49;
    }else{
        num_copy_to_commit = obj_changesets.changesets.length;
    }

    var start_copy_point=obj_changesets.changesets.length-1;

    var commit_i = 0 ;
    for (var i = 0; i< num_copy_to_commit; i++){
        commit[commit_i] = obj_changesets.changesets[start_copy_point];
        start_copy_point--;
        commit_i++;
    }
    /* middle-part */
    console.log( 'get_wholedata::part2' );
    /***/
    if( total_times > 1 ){
        for(var i = 0; i< (total_times-2); i++){
            var start0 = obj_changesets.changesets[0].node;

            var obj_changesets = get_changesets(input_path,start0, limit, consumer_key_input, consumer_secrete_input );

            for(var j = (max_fetch-1); j>0; j--){
                commit[commit_i] = obj_changesets.changesets[j];
                commit_i++;
            }
        }
    }
    /* final 50 or 49 commmits */
    console.log( 'get_wholedata::part3' );
    /***/
    if( total_times >= 3 ){
        var start0 = obj_changesets.changesets[0].node;
        var obj_changesets = get_changesets(input_path,start0, limit, consumer_key_input, consumer_secrete_input );

        var num_copy_to_commit2;
        if( obj_changesets.changesets.length == 50 ){
            num_copy_to_commit2 = 49;
        }else{
            num_copy_to_commit2 = obj_changesets.changesets.length;
        }

        var start_copy_point2 = obj_changesets.changesets.length-1;

        for (var i = 0; i< num_copy_to_commit2; i++){
            commit[commit_i] = obj_changesets.changesets[start_copy_point2];
            start_copy_point2--;
            commit_i++;
        }
    }
    /***/
   

     var commit_inverse =  new Array ();

     var commit_inverse_i= commit.length-1;

    for(var i=0; i< commit.length; i++)
    {
     commit_inverse[commit_inverse_i]=commit[i];

     commit_inverse_i--;
}

 return commit_inverse;
}
/******************************************************************************/
function get_changesets(input_path, start_input, limit_input, consumer_key_input, consumer_secrete_input){

    var limit = 50;
    if( limit_input != ""   &&  limit_input > 0  &&  limit_input < 50 ){
        limit = limit_input;
    }

    var consumer_key = "";
    var consumer_secrete = "";

    if( consumer_key_input == "" || consumer_secrete_input == "" ){
        consumer_key = "zrB43B3MSYDfY3kkK6";
        consumer_secrete = "ArcubcBnGjHstAcFuk6k4mQqVgvCJaX7";
    }else{
        consumer_key = consumer_key_input;
        consumer_secrete = consumer_secrete_input;
    }

    var test_opts = {
        consumer: { public:consumer_key,
                    secret:consumer_secrete },
        signature_method: 'PLAINTEXT',
        nonce_length: 29,
        version: '1.0',
        parameter_seperator: ', ',
    };

    var myoauth = new OAuth(test_opts);

    myoauth.nonce = myoauth.getNonce();
    myoauth.signature = myoauth.consumer.secret+'%26' ;
    myoauth.timestamp = myoauth.getTimeStamp();

    if( start_input == "" ){
        var my_changesets_string = 'https://bitbucket.org/api/1.0/repositories/'+ input_path +'/changesets/?'
            +"limit="+limit+"&"
            +"oauth_signature_method="+myoauth.signature_method+"&"
            +'oauth_nonce='+myoauth.nonce+'&'
            +"oauth_timestamp="+myoauth.timestamp+"&"
            +"oauth_version="+myoauth.version+"&"
            +'oauth_consumer_key='+myoauth.consumer.public+'&'
            +"oauth_signature="+myoauth.signature  ;
    }else{
        var my_changesets_string = 'https://bitbucket.org/api/1.0/repositories/'+ input_path +'/changesets/?'
            +"start="+start_input+"&"
            +"limit="+limit+"&"
            +"oauth_signature_method="+myoauth.signature_method+"&"
            +'oauth_nonce='+myoauth.nonce+'&'
            +"oauth_timestamp="+myoauth.timestamp+"&"
            +"oauth_version="+myoauth.version+"&"
            +'oauth_consumer_key='+myoauth.consumer.public+'&'
            +"oauth_signature="+myoauth.signature  ;
        console.log( 'id: ' + start_input );
    }
	
    var xmlhttp = new XMLHttpRequest();
	  xmlhttp.open( 'GET', my_changesets_string, false );
	  xmlhttp.send();
	  xmldoc = xmlhttp.responseText;

    if( xmlhttp.readyState == 4 && xmlhttp.status == 200 ){
        var obj = eval('(' + xmldoc + ')');
    }

    return obj;
}
/******************************************************************************/
/*--EOF--*/
