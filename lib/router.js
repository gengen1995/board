'use strict';
const http = require('http');
const postsHandler = require('./posts-handler');
const util = require('./handle-util');


function route(req,res){
  switch(req.url){
    case '/posts':
      postsHandler.handle(req,res);
      break;
      case '/posts?delete=1':
        postsHandler.handleDelete(req,res);
        break;
      case '/logout':
        util.handleLogout(req,res);
        break;
      default:
        util.handleNotFound(req,res);
        break;
  }
}

module.exports = {
  route:route
};