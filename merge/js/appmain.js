/* appmain.js; Liang started it at 2014-12-03 17:55:01est */
/* main app logic, including main function and UI function. */
/******************************************************************************/
/*--global-variables--*/

var cur_repo_addr;
/* in-memory cache */
var raw;

var view_type; /* 0 - histogram, 1 - tree */
var filtering; /* 0 - disabled, 1 - enabled */
var ff; /* filter param */

/* tree-view object */
var TV;
var tvwidth;
var tvheight;
var tvoff;
var tvstep;
var linkwidth = 3;

var BV;
var bvwidth;
var bvheight;
var bvstep;

var basestep = 20;
var bvvmargin = 20;

var sankey = d3.sankey();

/* color map */
var colors = ['grey','blue',
    '#33B5E5','#AA66CC','#99CC00','#FF4444','#0099CC','#9933CC','#669900','#CC0000',
    'grey','red','green','purple','pink','blue','yellow','black',
    ];

var colormap = [ '#669900', '#FF8800', '#CC0000' ];
/******************************************************************************/
var path = d3.svg.diagonal()
    .source( function( d ){
        return {"x":d.source.y + d.source.dy / 2,
                "y":d.source.x + sankey.nodeWidth()/2};
    } )            
    .target( function( d ){
        return {"x":d.target.y + d.target.dy / 2,
                "y":d.target.x + sankey.nodeWidth()/2};
    } )
    .projection( function( d ){  return [d.y, d.x];  } );
/******************************************************************************/
var noderadius = function( d ){
    var res;
    /***/
    //res = Math.sqrt( d.dy );
    //res = Math.ceil( Math.log( d.dy ) );
    res = 4 ;
    /***/
    return res;
};
/******************************************************************************/
var nodecolor = function( d, i ){
	var res;
    /***/
	if( filtering == 0 ){
		/* filter disabled */
        //res = d3.rgb( z( i ) ).darker() ;
        res = 1;
    }else{
		//console.log('filtering the historgram');
        /* filter enabled */
        var ta = false; // author
        var tb = false; // type+count, filename
        var tc = false; // date
        /***/
        var dd = raw[ i ] ;
        /* author */
        if( dd.author == ff.author ){
            ta = true;
        }else{
            ta = false;
        }
        /* file type and count; file name */
        var cc = 0 ;
        var i;
        var cf = 0 ;
        for( i = 0 ; i < dd.files.length ; i++ ){
            if( dd.files[i].type == ff.ftype ){  cc = cc + 1;  }
            /* NOTE-Liang: simple search function */
            var tss = dd.files[i].file;
            if( ff.fname == '' ){
                /* ignore file name */
            }else{
                if( ff.fname == '*' ){
                    cf = cf + 1;
                }else{
                    if( tss.search( ff.fname ) >= 0 ){  cf = cf + 1;  }
                }
            }
        }
        if( cc >= ff.fcount ){
            tb = true;
        }else{
            tb = false;
        };
        if( cf > 0 ){
            tb = true;
        }else{
            tb = false;
        };
        /* fragile date comparison; it does NOT work under Firefox */
        tc = true;
        //tc = checkdate( ff.date_start, ff.date_stop, dd.utctimestamp );
        /***/
        if( ta && tb && tc ){
            res = 'red';
			console.log("fuck this project");
            //res = 1;
        }else{
            /* use default color */
            //res = 1/2;
        }
    }
    return res;
};
/******************************************************************************/
var nodeinfo = function( d ){
    var ts = get_message( d.raw_id );
    $('#msgpanel').html( ts );
}
/******************************************************************************/
function get_message( pos ){
    var TC = raw[ pos ] ;
    /***/
    var res = '<b>Commit:</b> ' + TC.node + "<br />\n<b>author:</b> "+ TC.author +"<br />\n<b>date:</b> "+ TC.timestamp +"<br />\n<b>Message:</b> "+ TC.message +"<br />\n<b>files:</b> <a href=\"#filelist\"  data-rel=\"popup\" class=\"ui-btn ui-btn-inline ui-corner-all\">show</a>";
    /***/
    var al = '';//new Array();
    var ml = '';//new Array();
    var dl = '';//new Array();

    var TF = TC.files;
    var fc = TF.length;
    var i;
    for( i = 0 ; i < fc ; i++ ){
        if( TF[ i ].type == 'added' ){
            //al.push( TF[ i ].file );
            al = al + TF[ i ].file + "<br />\n";
        }
        if( TF[ i ].type == 'modified' ){
            //ml.push( TF[ i ].file );
            ml = ml + TF[ i ].file + "<br />\n";
        }
        if( TF[ i ].type == 'deleted' ){
            //dl.push( TF[ i ].file );
            dl = dl + TF[ i ].file + "<br />\n";
        }
    }
    var flist = "";
    if( al.length > 0 ){
        flist = flist + "<b>Added:</b><br />\n" + al;
    }
    if( ml.length > 0 ){
        flist = flist + "<b>Modified:</b><br />\n" + ml;
    }
    if( dl.length > 0 ){
        flist = flist + "<b>Deleted:</b><br />\n" + dl;
    }
    $('#filelist').html( flist );
    /***/
    return res ;
}
/******************************************************************************/
var sect_msg = function( d, i ){
    var ts = get_message( i );
    $('#msgpanel').html( ts );
};
/******************************************************************************/
function erase_chart(){
    $('#msgpanel').html( '' );
    /***/
    var tt = document.getElementById("mychart");
    while( tt.firstChild ){
        tt.removeChild( tt.firstChild );
    }
}
/******************************************************************************/
function erase_sbar(){
    $('#msgpanel').html( '' );
    $('#mychart').empty();
}
/******************************************************************************/
function mk_sect( DATA ){
    var res = new Array ;
    /***/
    var cnt = DATA.length ;
    var i;
    for( i = 0 ; i < cnt ; i++ ){
        var ac = 0;
        var mc = 0;
        var dc = 0;
        var TF = DATA[ i ].files ;
        var fcnt = TF.length ;
        var j;
        for( j = 0 ; j < fcnt ; j++ ){
            if( TF[j].type == 'added' ){  ac = ac + 1;  }
            if( TF[j].type == 'modified' ){  mc = mc + 1;  }
            if( TF[j].type == 'deleted' ){  dc = dc + 1;  }
        }
        /***/
        res.push( [ i, ac, mc, dc ] );
    }
    /***/
    //var basestep = 15 ;
    bvwidth = basestep * cnt ;
    bvstep = 15 * basestep ;
    bvheight = window.localStorage.getItem('view.height');
    /***/
    return res;
}
/******************************************************************************/
function draw_sbar( entropy ){
    $('#msgpanel').html( '' );
    BV = genBV();
    /***/
    x = d3.scale.ordinal().rangeRoundBands( [ 0, bvwidth - 50 ] );
    y = d3.scale.linear().range( [ 0, bvheight - 50 ] );
    z = d3.scale.ordinal().range( colormap );


    var sbarhl = function( d, i ){
        var res;
        /***/
        if( filtering == 0 ){
            /* filter disabled */
            //res = d3.rgb( z( i ) ).darker() ;
            res = 1;
        }else{
			//console.log('filtering the historgram');
            /* filter enabled */
            var ta = false; // author
            var tb = false; // type+count, filename
            var tc = false; // date
            /***/
            var dd = raw[ i ] ;
            /* author */
            if( dd.author == ff.author ){
                ta = true;
            }else{
                ta = false;
            }
            /* file type and count; file name */
            var cc = 0 ;
            var i;
            var cf = 0 ;
            for( i = 0 ; i < dd.files.length ; i++ ){
                if( dd.files[i].type == ff.ftype ){  cc = cc + 1;  }
                /* NOTE-Liang: simple search function */
                var tss = dd.files[i].file;
                if( ff.fname == '' ){
                    /* ignore file name */
                }else{
                    if( ff.fname == '*' ){
                        cf = cf + 1;
                    }else{
                        if( tss.search( ff.fname ) >= 0 ){  cf = cf + 1;  }
                    }
                }
            }
            if( cc >= ff.fcount ){
                tb = true;
            }else{
                tb = false;
            };
            if( cf > 0 ){
                tb = true;
            }else{
                tb = false;
            };
            /* fragile date comparison; it does NOT work under Firefox */
            tc = true;
            //tc = checkdate( ff.date_start, ff.date_stop, dd.utctimestamp );
            /***/
            if( ta && tb && tc ){
                //res = 'blue';
                res = 1;
            }else{
                /* use default color */
                res = .2;
            }
        }
        return res;
    };

    var RM = [ 'c1', 'c2', 'c3' ].map( function( dat, i ){
        return entropy.map( function( d, ii ){
            return { x: ii, y: d[ i+ 1 ] };
        } )
    } );

    var ST = d3.layout.stack()( RM );

    x.domain( ST[ 0 ].map( function( d ){  return d.x;  } ) );
    y.domain( [ 0, d3.max( ST[ ST.length - 1 ], function( d ){  return d.y0 + d.y;  } ) ] );

    /* Add a group for each column */
    var valgroup = BV.selectAll('g.valgroup')
        .data( ST )
        .enter().append('svg:g')
        .attr('class', 'valgroup')
        .style('fill', function( d, i ){  return z( i );  } )
        .style('stroke', function( d, i ){  return d3.rgb( z( i ) ).darker();  } )
		
    /* Add a rect for each date */
    var rect = valgroup.selectAll('rect')
        .data( function( d ){  return d;  } )
        .enter().append('svg:rect')
        .attr('x', function( d ){  return x(d.x);  } )
        .attr('y', function( d ){  return -y(d.y0) - y(d.y);  } )
        .attr('height', function( d ){  return y(d.y);  } )
        .attr('width', x.rangeBand())
		.style('opacity', sbarhl)
        .on('click', sect_msg );

}
function genBV(){
    var res = d3.select('#mychart').append('svg:svg')
        .attr('class', 'chart')
        .attr('width', bvwidth)
        .attr('height', bvheight)
        .append('svg:g')
        .attr('transform', 'translate('+ tvoff +','+ (bvheight - bvvmargin) +')');
    return res;
}
/******************************************************************************/
function destroy_tree(){
    $('#msgpanel').html( '' );
    $('#mychart').empty();
}
/******************************************************************************/
function mk_tree( raw_input ){
    /***/
    var tree = {
            "nodes" : [],
            "links": []
    };
    /***/
	//console.log(raw_input);
    var cnt = raw_input.length;
    var i;
    for( i = 0; i < cnt ; i++ ){
        /* add the node to the vertex list */
        var node_name = raw_input[i].node ;
        var node_id = i ;
        tree.nodes.push( { "name": node_name, "raw_id": node_id } );
        /***/
        /* add the edge to the edge list */
        var j;
        var jc = raw_input[i].parents.length ;
        for( j = 0 ; j < jc ; j++ ){
            var parent_id = raw_input[ i ].parents[ j ] ;
            var k;
            for( k = 0 ; k < tree.nodes.length ; k++ ){
                if( parent_id == tree.nodes[k].name ){
                    tree.links.push( { "source":k, "target":i, "value":10 } );
                }
            }
        }
    }
    /***/
    //var basestep = 15 ;
    tvwidth = basestep * cnt ;
    tvstep = 15 * basestep ;
    /***/
    return tree;
}
/******************************************************************************/
function draw_tree( energy ){
    $('#msgpanel').html( "" );
    TV = genTV();
    /***/
    var snode_color = function( d, i ){
        var res;
        /***/
        if( filtering == 0 ){
            /* filter disabled */
            //res = d3.rgb( z( i ) ).darker() ;
            res = 1;
        }else{
			//console.log('filtering the historgram');
            /* filter enabled */
            var ta = false; // author
            var tb = false; // type+count, filename
            var tc = false; // date
            /***/
            var dd = raw[ i ] ;
            /* author */
            if( dd.author == ff.author ){
                ta = true;
            }else{
                ta = false;
            }
            /* file type and count; file name */
            var cc = 0 ;
            var i;
            var cf = 0 ;
            for( i = 0 ; i < dd.files.length ; i++ ){
                if( dd.files[i].type == ff.ftype ){  cc = cc + 1;  }
                /* NOTE-Liang: simple search function */
                var tss = dd.files[i].file;
                if( ff.fname == '' ){
                    /* ignore file name */
                }else{
                    if( ff.fname == '*' ){
                        cf = cf + 1;
                    }else{
                        if( tss.search( ff.fname ) >= 0 ){  cf = cf + 1;  }
                    }
                }
            }
            if( cc >= ff.fcount ){
                tb = true;
            }else{
                tb = false;
            };
            if( cf > 0 ){
                tb = true;
            }else{
                tb = false;
            };
            /* fragile date comparison; it does NOT work under Firefox */
            tc = true;
            //tc = checkdate( ff.date_start, ff.date_stop, dd.utctimestamp );
            /***/
            if( ta && tb && tc ){
                res = 'blue';
                //res = 1;
            }else{
				res = 'black';
                /* use default color */
                //res = 1/2;
            }
        }
        return res;
    };


    sankey
		.nodeWidth(15)
	    .nodePadding(10)
	    .size([ tvwidth, tvheight ])
        .nodes(energy.nodes)
        .links(energy.links)
        .layout(32);

    var link = TV.append("g")
        .selectAll(".link")
        .data( energy.links )
        .enter().append("path")
        .attr("class", function( d ){  return (d.causesCycle ? "cycleLink" : "link")  } )
        .attr("d", path)
        .style("stroke-width", linkwidth )
        .sort( function( a, b ){  return b.dy - a.dy;  } );

    var dragmove = function( d ){
        d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(tvheight - d.dy, d3.event.y))) + ")");
        sankey.relayout();
        link.attr("d", path);
    };

    var node = TV.append("g").selectAll(".node")
        .data(energy.nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function( d ){  return "translate(" + d.x + "," + d.y + ")";  } )
        .call( d3.behavior.drag()
            .origin( function( d ){  return d;  } )
            .on("dragstart", function(){  this.parentNode.appendChild(this);  } )
            .on("drag", dragmove) );

    node.append("circle")
        .attr("cx", sankey.nodeWidth()/2)
        .attr("cy", function( d ){  return d.dy/2;  } )
        .attr("r", function( d ){  return noderadius( d );  } )
        //.attr('fill', 'red')
        .attr('fill', nodecolor)

    /* show node information */
    node.on('click', nodeinfo);
}
/******************************************************************************/
function genTV(){
    var res = d3.select("div#mychart").append("svg")
    .attr("width", tvwidth )
    .attr("height", tvheight )
    .append("g")
    .attr("transform", "translate(" + tvoff + "," + 10 + ")");
	//console.log('tv::w,h = 'tvwidth+', '+tvheight);
    return res;
}
/******************************************************************************/
function update_view( force_draw ){
    if( force_draw ){
        /* firce re-draw */
        destroy_tree();
        if( view_type == 0 ){
            /* bars */
            draw_sbar( mk_sect( raw ) );
            BV.attr("transform", "translate(" + tvoff + "," + (bvheight-bvvmargin) + ")");
        }else if( view_type == 1 ){
            /* tree */
            draw_tree( mk_tree( raw ) );
            TV.attr("transform", "translate(" + tvoff + "," + 10 + ")");
        }else{
            /* incorrect value, do nothing */
        }
    }else{
        /* change offset only */
        if( view_type == 0 ){
            /* bars */
            BV.attr("transform", "translate(" + tvoff + "," + (bvheight-bvvmargin) + ")");
        }else if( view_type == 1 ){
            /* tree */
            TV.attr("transform", "translate(" + tvoff + "," + 10 + ")");
        }else{
            /* incorrect value, do nothing */
        }
    }
}
/******************************************************************************/
function switch_view(){
    var tty = $("#viewType").find("option:selected").val();
    if( "tree" == tty ){
        view_type = 1 ;
        /* branch */
    }
    if( "hist" == tty ){
        view_type = 0 ;
        /* histogram */
    }
    /***/
    update_view( true );
}
/******************************************************************************/
document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady(){
    //console.log('Device is ready.');
}
/******************************************************************************/
function update_consumer( key, sec ){
    var consumer = {  public: key,  secret: sec  };
    window.localStorage.setItem( 'consumer', JSON.stringify(consumer) );
    /* turn on flag bit */
    window.localStorage.setItem( 'newkey', 1 );
}
/******************************************************************************/
function read_consumer(){
    var res = window.localStorage.getItem('consumer');
    return JSON.parse(res);
}
/******************************************************************************/
function get_screen_height(){
    var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    return h;
}
/******************************************************************************/
function get_screen_width(){
    var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    return w;
}
/******************************************************************************/
function get_display_info(){
    /* read screen geometry info */
    /***/
    var h = this.get_screen_height();
    var w = this.get_screen_width();
    /***/
    window.localStorage.setItem('h', h);
    window.localStorage.setItem('w', w);
    /***/
    var v_width = w - 30;
    var v_height = h - 190;
    window.localStorage.setItem('view.width', v_width );
    window.localStorage.setItem('view.height', v_height );
    /***/
    tvwidth = v_width;
    tvheight = v_height;
    /***/
}
/******************************************************************************/
function get_max_array( D ){
    var res = 100 ;
    var cnt = D.length ;
    /***/
    var i;
    var tmpval = D[0] ;
    for( i = 0; i < cnt; i++ ){
        if( tmpval < D[i] ){
            tmpval = D[i] ;
        }
    }
    res = tmpval ;
    /***/
    return res;
}
/******************************************************************************/
function parse_repo_url( input_repo_url ){
    var aa = input_repo_url.split('/');
    var alen = aa.length;
    /***/
    var res = new Array();
    for( i = 0; i < 3; i++ ){
        res.push('');
    }
    /**/
    var k = 0;
    if( alen > 2 ){
        k = 3;
    }else{
        k = alen;
    }
    for( i = 0; i < k; i++ ){
        res[i] = aa[i];
    }
    /***/
    return res;
}
/******************************************************************************/
function get_repo_url( s ){
    var tt = parse_repo_url( s );
    var res = tt;
    /***/
    for (i = 0; i< 3; i++){
        if( tt[i].length == 0 ){
            res = null;
            break;
        }
    }
    if( (tt[0] == "bitbucket.org")||(tt[0] == "github.com") ){
    }else{
        res = null;
    }
    /* successful call return array, otherwise it returns null. */
    return res;
}
/******************************************************************************/
function gen_ff( fa, ft, fc, fn, fda, fdb ){
    var res = {
            author: fa,
            ftype: ft,
            fcount: fc,
            fname: fn,
            date_start: fda,
            date_stop: fdb,
        };
    /***/
    return res;
}
/******************************************************************************/
function ffetch( url ){
        var aa = get_repo_url( url );
        var ccc = 0 ;
        if( aa ){
            ccc = get_repo( aa[0], aa[1]+'/'+aa[2] );
            /***/
            if( ccc > 0 ){
                raw = JSON.parse( window.localStorage.getItem('rawdata') );
                update_view( true );
            }else{
                alert( 'Failed to retrieve repository data.' );
            }
            parent.history.back();
        }else{
            /* incorrect user input */
            alert('Invalid repository URL: '+ss);
        }
        /***/
        /* add to quicklist */
        if( ( ccc > 0 ) && $('#add_repo').is(':checked') ){
            /* FIXME */
        }

}
/******************************************************************************/
(function($) {
    "use strict";
    /***/
    var basic_setup = function(){
        /* some basic setup work at the beginning */
        get_display_info();
        /***/
        var screen_width = get_screen_width();
        //console.log( 'scrn_width:='+screen_width );
        window.localStorage.setItem('screen.width', screen_width );
        /***/
        var vh = window.localStorage.getItem('view.height');
        $('#mychart').height( vh );
        /***/
        window.localStorage.setItem('rawdata', '' );
        window.localStorage.setItem('mockup', '' );
        /***/
        cur_repo_addr = '';
        /* set default view type: bars */
        view_type = 0;
        /* memory cache is empty */
        raw = [];
        /* filtering disabled */
        filtering = 0;
        ff = null;
        /***/
        var flagbit = window.localStorage.getItem('newkey');
        if( flagbit == 0 ){
            update_consumer( 'zrB43B3MSYDfY3kkK6', 'ArcubcBnGjHstAcFuk6k4mQqVgvCJaX7' );
        }
        /***/
        tvoff = 20;
        tvstep = 150;
        /***/
        /* built-in data */
        raw = mmock;
        switch_view();
        /***/
        $('#filelist').attr('style', 'overflow-y: scroll; height: '+Math.ceil(vh / 2)+'px;');
    };
    /***/
    var getRepoData = function(){
        view_type = 0;
        filtering = 0 ;
        tvoff = 20;
        var filter_check = $('#filtering').is(':checked');
        if( filter_check ){
            filtering = 1 ;
        }else{
            filtering = 0 ;
        }
        /* get repository data */
        cur_repo_addr = $('#repo_url').val();
        //console.log( cur_repo_addr );
        ffetch( cur_repo_addr );
    };

    var panleft = function(){
        tvoff = tvoff - tvstep ;
        /***/
        update_view( false );
    };
    var panright = function(){
        tvoff = tvoff + tvstep ;
        /***/
        update_view( false );
    };

    var useQL = function(){
        /* WIP-Liang: load the quicklist item (url) and call getRepoData() */
        cur_repo_addr = $('#quicklist').val() ;
        console.log( cur_repo_addr );
        /***/
        ffetch( cur_repo_addr );
    };

    var useFilter = function(){
        var user_check = $('#filtering').is(':checked');
        if( user_check ){
            /* apply filter to histogram */
            filtering = 1;
            ff = gen_ff(
                $('#filter_author').val(),
                $('#filter_type').val(),
                $('#filter_count').val(),
                $('#filter_fname').val(),
                $('#filter_date_start').val(),
                $('#filter_date_end').val()
            );
            update_view( true );
            /**/
            parent.history.back();
        }else{
            filtering = 0;
            ff = null;
            //alert('If you want to filter the commits, check "Enable filtering".');
            update_view( true );
            /**/
            parent.history.back();
        }
    };

    var saveConsumer = function(){
        var user_check = $('#reset_auth').is(':checked');
        if( user_check ){
            //console.log( 'save consumer.' );
            update_consumer( $('#username').val(),  $('#userpass').val() );
        }else{
            alert('If you want GitViewer to remember your consumer key and secret, check "Update authentication data".');
        }
    };

    var toggle_view = function(){  switch_view();  };
    /***/
    /* start-up */
    $('#enterButton').on('click', basic_setup);
    /* draw area swipe */
    $('#mychart').on('swiperight', panright);
    $('#mychart').on('swipeleft', panleft);

    /* button click */
    $('#getRepo').on('click', getRepoData);

    $('#useList').on('click', useQL);

    $('#applyFilter').on('click', useFilter);

    $('#updateAuth').on('click', saveConsumer);

    /* drop down */
    $('#viewType').on('change', toggle_view);
    /***/
})(jQuery);
/******************************************************************************/

/*--eof--*/
