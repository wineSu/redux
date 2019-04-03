//function Middleware(){
// this.cache = [];
//}
//Middleware.prototype.use = function(fn){
//if(typeof fn !== 'function'){
//  throw 'middleware must be a function';
//}
//this.cache.push(fn);
//return this;
//}
//
//Middleware.prototype.next = function(fn){
//if(this.middlewares && this.middlewares.length > 0 ){
//  var ware = this.middlewares.shift();
//  console.log(ware) //根据js的执行机制  只要发现next就执行下个函数   没有next的情况  会将剩下的函数再依次执行完毕（按照他们被触发的顺序的逆序，a执行一半到b 所以需要等到b执行完才回头执行a）
//  ware.call(this, this.next.bind(this));
//}
//}
//Middleware.prototype.handleRequest = function(){//执行请求
//this.middlewares = this.cache.map(function(fn){//复制
//  return fn;
//});
//this.next();
//}
//var middleware = new Middleware();
//middleware.use(function(next){
//console.log(1);next();console.log('1结束');
//});
//middleware.use(function(next){
// console.log(2);next();console.log('2结束');
//});
//middleware.use(function(next){
// console.log(3);console.log('3结束');
//});
//middleware.use(function(next){
// console.log(4);next();console.log('4结束');
//});
//middleware.handleRequest();

function Middleware(){
   this.cache = [];
}
Middleware.prototype.use = function(fn){
  if(typeof fn !== 'function'){
    throw 'middleware must be a function';
  }
  this.cache.push(fn);
  return this;
}

Middleware.prototype.next = function(fn){
  var index = 0;
  function next(s){
  	console.log(s+'-------')
  	index ++
  }
  this.cache.map(function(fn,i){//复制
    if(index === i){
    	fn(next);
    }
 });
}
Middleware.prototype.handleRequest = function(){//执行请求
  this.next();
}
var middleware = new Middleware();
middleware.use(function(next){
  console.log(1);next(1);console.log('1结束');
});
middleware.use(function(next){
   console.log(2);next(2);console.log('2结束');
});
middleware.use(function(next){
   console.log(3);console.log('3结束');
});
middleware.use(function(next){
   console.log(4);next(3);console.log('4结束');
});
middleware.handleRequest();