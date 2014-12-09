/* utest.js; started at 2014-11-05 22:19:32.728580965 est */

QUnit.test("repo url test", function( assert ) {
    var ts = "";

    ts = "bitbucket.org/liuc/cs456";
    assert.ok( get_repo_url(ts), "correct url, bitbucket; url="+ts );
    ts = "github.com/liuc/cs456";
    assert.ok( get_repo_url(ts), "correct url, github; url="+ts );

    ts = "/liuc/cs456";
    assert.equal( get_repo_url(ts), null, "no host name; url="+ts );
    ts = "example.com/liuc/cs456";
    assert.equal( get_repo_url(ts), null, "incorrect host name; url="+ts );
    ts = "localhost/liuc/cs456";
    assert.equal( get_repo_url(ts), null, "localhost; url="+ts );

    ts = "bitbucket.org/liuc/";
    assert.equal( get_repo_url(ts), null, "no repo name; url="+ts );
    ts = "bitbucket.org//cs456/";
    assert.equal( get_repo_url(ts), null, "no repo owner; url="+ts );
    ts = "bitbucket.org//";
    assert.equal( get_repo_url(ts), null, "no path; url="+ts );
});


/*--eof--*/