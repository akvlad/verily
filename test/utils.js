/**
 * Commonly used test functions
 */
var async = require('async'),
    fs = require('fs'),
    orm = require('orm'),
    app,
    server,
    db_url = "test/app.db";

exports.run_app = function (done){
    //todo: Settings to test in production
    process.env.NODE_ENV = 'test';
    fs.unlink(db_url, function (err) {
        if (err) {}
        require("../server.js")(false, 'sqlite://'+db_url, function(application, db, app_server){
            server = app_server;
            done(application, db);
        }); 
    });
          
}
exports.end_test = function(db, done){
    server.close(function () {
        console.log('Server closed');
        db.close(function () {
            exports.drop_db(db, function () {
                done();
            }); 
        });  
    });
        
}

exports.drop_db = function(db, done){
    db.drop(function () {
        done();
    });
}

exports.clear_model = function(model, callback){
    model.clear(function(err){
        if(err)callback(err);
        callback();
    })
}
//Accounts
exports.set_users_agents_account = function(request, app, db, done){
    var async = require('async'),
        admin_agent = request.agent(app),
        editor_agent = request.agent(app),
        basic_agent = request.agent(app),
        editor_user = {
            email : 'editor@verily.com',
            name : 'editor',
            password : 'admin123',
            verifyPassword : 'admin123',
            termsAgreement: true
        },
        basic_user = {
            email : 'basic@verily.com',
            name : 'basic',
            password : 'admin123',
            verifyPassword : 'admin123',
            termsAgreement: true
        },
        admin_user = {
            email : 'verily',
            password : '1234'
        };
    editor_agent.post('/user').send(editor_user)
        .expect('Content-Type', /text/)
        .expect(302)
        //.expect('set-cookie', /connect.sid=/)
        .expect('Location', '/')
        .end(function(err, res){
            if(err) throw err;
            db.models.user.find({name: editor_user.name}, function(err, result){
                if(err) throw err;
                var user = result[0];
                user.role = "editor";
                user.save(function(){

                    basic_agent.post('/user').send(basic_user)
                        .expect('Content-Type', /text/)
                        .expect(302)
                        .expect('Location', '/')
                        .end(function(err, res){
                            if(err) throw err;

                            admin_agent.post('/login').send(admin_user)
                                .expect('Content-Type', /text/)
                                .expect(302)
                                .expect('Location', '/')
                                .end(function(err, res){
                                    if(err) throw err;
                                    done({
                                        admin_agent: admin_agent,
                                        editor_agent: editor_agent,
                                        basic_agent: basic_agent,
                                        admin_user: admin_user,
                                        editor_user: editor_user,
                                        basic_user: basic_user

                                    });
                                });
                        });
                });
            });
        });
}
exports.clear_account_models = function(db, done){
    var arr = [db.models.user, db.models.local];
    async.each(arr, this.clear_model , function(err){
        if(err) throw err;
        done();
    });
}

exports.create_crisis = function (user, agent, db, done) {
    var crisis_post_1 = {
        title : "Verily 1st Crisis",
        targetDateTimeOccurred: [10, 2, 2014, 10, 20]
    }

    agent.post('/crisis').send(crisis_post_1)
    .expect('Content-Type', /text/)
    .expect(302)
    .expect('Location', '/crisis/1')
    .end(function(err, res){
        if(err) throw err;
        db.models.post.find({title: crisis_post_1.title}, function (err, result) {
            if(err) throw err;
            var post = result[0];
            post.getCrisis(function(err, crisis){
                if(err) throw err;
                post.should.have.property('title', crisis_post_1.title);
                post.getUser(function(err, user){
                    if(err) throw err;
                    user.should.have.property('name',  user.name);
                    done(crisis_post_1);
                });
            });
        });
    });
}; 