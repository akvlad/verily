var ConnectRoles = require('connect-roles');
var common = require('../static/js/common');

exports.user = new ConnectRoles({
		failureHandler: function (req, res, action) {
	    // optional function to customise code that runs when
	    // user fails authorization
	    var accept = req.headers.accept || '';
	    res.status(403);
	    if (accept.indexOf('html') !== -1) {
	    	if (req.user) {
	      		res.render('user/access-denied', {action: action, user: req.user.name});
	      	} else {
	      		res.render('user/access-denied', {action: action});
	      	}
	    } else {
	      	res.send('Access Denied - You don\'t have permission to: ' + action);
	    }
	  }
	});

	//var User = exports.user;
    
    var CRISIS_1_ACTIVE = false;
    
    // Request comes in to view a challenge page.
    var viewChallengePages = function(req) {
        var isAdmin = req.user && req.user.role === 'admin';
        
        // If challenge is active or user is an admin, can view challenge pages.
        var permissionToView = common.challengeActive() || isAdmin;

        return permissionToView;
    }
    

    function getCrisisNumber(req){
        //Split the path to be sure that they are accessing Crisis 1, also convert it to uppercase to make a case insensitive comparison.
    	if (req.path.split('/')[1].toUpperCase() === 'crisis'.toUpperCase()) {
    		return req.path.split('/')[2];
    	} else {
    		return '-1';
    	}
    }
    
    var crisisActive = function(req) {
        if (getCrisisNumber(req) === '1') {
            // Requesting something in crisis 1.
            return CRISIS_1_ACTIVE;
        } else {
            return true;
        }
    }

    
    //set to true for crises that allow anonymous users to submit questions
    var crisisWithOpenQuestionSubmission = function(req) {
        if (getCrisisNumber(req) === '14') {
            return true;
        } else {
            return false;
        }
    }
    
    
    
    
    exports.user.use('change password', function (req) {
        if (req.user && req.user.type !== 'provisional' && req.user.local_id)
            return true && common.challengePublished();
    });

    exports.user.use('choose a username', function (req) {
        if (req.session.user && !req.session.user.name && (!req.user || req.user.type === 'provisional')){
            return true && common.challengePublished();
        }
    });

    exports.user.use('change username', function (req) {
        if (req.user && req.user.type !== 'provisional'){
            return true && common.challengePublished();
        }
    });
    
    exports.user.use('provisional user', function (req) {
        return req.user && req.user.type === 'provisional';
    });
    
    exports.user.use('view challenge pages', function (req) {
        return viewChallengePages(req);
    });

    exports.user.use('upvote downvote', function (req){
        if (req.user && common.properUser(req)) {
            return viewChallengePages(req) && common.challengePublished() && crisisActive(req);
        }
    });

    exports.user.use('mark important', function (req){
        if (req.user && common.properUser(req)) {
            return viewChallengePages(req) && common.challengePublished() && crisisActive(req);
        }
    });

	exports.user.use('create a question', function (req){
		if (crisisWithOpenQuestionSubmission(req) || (req.user && (req.user.role === 'editor' || req.user.role === 'admin'))) {
            return true && crisisActive(req);
		}
	});

	exports.user.use('create an answer', function (req) {
		if (req.user && common.properUser(req)) {
            return viewChallengePages(req) && common.challengePublished() && crisisActive(req);
		}
	});
    
    exports.user.use('edit an answer', function (req){
        if (req.user && (req.user.role === 'editor' || req.user.role === 'admin')) {
            return true && common.challengePublished() && crisisActive(req);
        }  
    });
    
	exports.user.use('create an answer comment', function (req) {
		if (req.user && common.properUser(req)) {
            return viewChallengePages(req) && common.challengePublished() && crisisActive(req);
		}
	});
    
    exports.user.use('edit an answer comment', function (req){
        if (req.user && (req.user.role === 'editor' || req.user.role === 'admin')) {
            return true && common.challengePublished() && crisisActive(req);
        }  
    });
    
	exports.user.use('create a crisis', function (req){
		if (req.user && (req.user.role === 'editor' || req.user.role === 'admin')) {
            return true;
		}
			
	});
    
    exports.user.use('edit a question', function (req){
        if (req.user && (req.user.role === 'editor' || req.user.role === 'admin')) {
            return true && crisisActive(req);
        }  
    });

    exports.user.use('edit a crisis', function (req){
        if (req.user && (req.user.role === 'editor' || req.user.role === 'admin')) {
            return true && crisisActive(req);
        }
            
    });

    exports.user.use('assign roles', function (req){
		if (req.user && req.user.role === 'admin') {
		    return true;
		}
			
	});

    exports.user.use('create multiple questions', function (req){
        if (req.user && req.user.role === 'admin')
            return true;
    });

    exports.user.use('export questions', function (req){
        if (req.user && req.user.role === 'admin')
            return true;
    });
    

