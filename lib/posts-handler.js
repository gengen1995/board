'use strict';
const crypto = require('crypto');
const pug = require('pug');
const Cookies = require('cookies');
const util = require('./handle-util');
const Post = require('./post');

const trackingIdKey = 'tracking_id';

function handle(req,res){
  const cookies = new Cookies(req,res);
  addTrackingCookies(cookies);
  switch(req.method){
    case 'GET':
      res.writeHead(200,{
        'Content-Type':'text/html; charset=utf-8'
      });
      Post.findAll({order:[['id', 'DESC']]}).then((posts) =>{
        
        res.end(pug.renderFile('./views/posts.pug',
        {posts:posts,
         user: req.user}
        ));
      });
      
      break;
      case 'POST':
        let body = [];
        req.on('data',(chunk) =>{
          body.push(chunk);
        }).on('end',()=>{
          body = Buffer.concat(body).toString();
          const decoded = decodeURIComponent(body);
          const content = decoded.split('content=')[1];
          
          
          Post.create({
            content:content,
            trackingCookie: cookies.get(trackingIdKey),
            postedBy: req.user
          }).then(() =>{
            handleRedirectPosts(req,res);
          });
          
        })
        break;
        default:
          util.handleBadRequest(req,res);
          break;
  }
}

function addTrackingCookies(cookies){
  if(!cookies.get(trackingIdKey)){
    const trackingId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    const tomorrow = new Date(Date.now() + (1000*60*60*24));
    cookies.set(trackingIdKey, trackingId,{expires:tomorrow});
  }
}
function handleRedirectPosts(req,res){
  res.writeHead(303,{
    'Location': '/posts'
  });
  res.end();
}

function handleDelete(req,res){
  switch(req.method){
    case 'POST':
      let body = [];
      req.on('data',(chunk) =>{
        body.push(chunk);
      }).on('end',()=>{
        body = Buffer.concat(body).toString();
        const decoded = decodeURIComponent(body);
        const id = decoded.split('id=') [1];
        Post.findById(id).then((post) =>{
          if(req.user === post.postedBy || req.user === 'admin'){
            post.destroy().then(() =>{
              handleRedirectPosts(req,res);

            });
          }

        });
      })
  }
}


module.exports = {
  handle:handle,
  handleDelete:handleDelete

};