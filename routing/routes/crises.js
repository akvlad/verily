exports.specific = '/crisis/:crisis_id';
var specific = exports.specific;

exports.route = function (app, controllers, doc) {
    var route = require('../route')(app, controllers, doc, __filename);
    // View to create crisis
    route('get', '/crisis/create', 'create', 'Create View; View to create crisis');
    
    // Create crisis API endpoint
    route('post', '/crisis', 'new', 'New; New crisis');

    // View to edit crisis
    route('get', specific + '/markImportant', 'markImportant', 'Mark as Important');

    route('get', '/crisis', 'all', 'Get All; Get all crises');

    route('get', specific, 'get', 'Get; Get crisis with specific ID');
    
    // View to edit crisis
    route('get', specific + '/edit', 'edit', 'Edit View; View to edit crisis');

    // API endpoint to update crisis
    route('put', specific, 'update', 'Update; Update crisis');

    route('delete', specific, 'remove', 'Delete; Delete crisis');

    route('get', '/', 'index', 'Index; Spotlight: returns up to 10 crises');
};