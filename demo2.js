
function render(data){
		var ele = document.getElementById('cont')
		ele.innerHTML = data.people.eyes;
		ele.style.color = data.people.color;
	}


function reducer(state, action){
	if(!state){
		return {
			people:{
				eyes: '有点疼',
				color: 'red'
			}
		}
	}
	switch (action.type){
		case 'EYES_QUESTION_LOG':
			return Object.assign({}, state, {
				people: {
					...state.people,
					eyes: action.data
				}
 			})
		break;
		case 'EYES_COLOR_LOG':
			return Object.assign({}, state, {
				people: {
					...state.people,
					color: action.data
				}
 			})
		break;
		default:
		break;
	}
}

function createStore(reducer, preloadState, enhancer){
	
	//creatStore(reducer,middelewareFun)  只有两个参数时（第二个参数为中间件函数，preloadState可选） 将第二个参数视为enhancer增强函数
	if(typeof preloadState === 'function' && typeof enhancer === 'undefined'){
		enhancer = preloadState;
		preloadState = undefined;
	}
	
	//如果传了中间件则处理 否则直接执行无中间的情况
	if(typeof enhancer !== 'undefined'){
		if(typeof enhancer !== 'function'){
			throw new Error('中间件必须是一个函数！');
		}
		/**
		 * enhancer是上面applyMiddleware函数返回的匿名函数 接收了 enhancer 传来的 createStore
		 * // 第一层匿名函数
		 * return function (createStore) { 
			    // 接收了 enhancer(createStore) 传来的 reducer, preloadedState
			    return function (reducer, preloadedState, enhancer) {
			        ...
			    }
			};
		 */
		return enhancer(createStore)(reducer, preloadState);
	}
	
	//reducer为一个函数必须
	if(typeof reducer !== 'function'){
		throw new Error('reducer 必须为一个函数');
	}
	
	/*
	 * isDispatching
	 * 比如我们在reducer函数中又执行了 dispatch store.dispatch({type:'UPDATA',data:2}) 不加锁就会死循环
	 * 不允许在reducer中进行任何操作  保证reducer是一个纯函数
	 */
	let isDispatching = false;
	let listeners = [];
	let state = null;
	const subscribe = (listenerFun) => {
		//订阅不允许在reducer操作
		if(isDispatching){
			throw new Error('Reducer 中不可以subscribe');
		}
		listeners.push(listenerFun);
	}
	const getState = () => {
		/**
		 * reducer中是不允许操作state  执行到state = reducer(state, action);  isDispatching变成true  未执行到finally
		 * 尽管可以取到值但是不允许这么做
		 */
		if(isDispatching){
			throw new Error('Reducer 中不可以读取state');
		}
		return state
	};
	const dispatch = (action) => {
		if (isDispatching) {
	      throw new Error('Reducers中不允许执行dispatch')
	    }
		try{
			//到这里会出现死循环的情况  所以需要加锁
			isDispatching = true;
			state = reducer(state, action);
		}finally{
			isDispatching = false;
		}
		for(let i = 0, len = listeners.length; i < len; i++){
			listeners[i](state);
		}
	}
	dispatch({});
	return {
		getState,
		dispatch,
		subscribe
	}
}




//function middle1(api){
//	return (num2) => (num3) => {
//		return num2(num3)
//	}
//}
//function middle2(api){
//	return (num2) => (num3) => {
//		return num2+num3
//	}
//}

//function applyMiddleware(arg1,arg2){
//	const api = {}
//	var b = arg2(api)(2);
//
//	var newDispatch = arg1(api)(b);
//
//  return {
//    dispatch:newDispatch
//  }
//}

function middle1(api){
	return (next) => (num3) => {
		console.log('aaaaa')
		return next(num3)
	}
}
function middle2(api){
	return (num2) => (num) => {
		console.log('bbbbb')
		return num2(num)
	}
}
//1
function compose(...fns) {
    return function (res) {
        for (var i = fns.length - 1; i > -1; i--) {
            res = fns[i](res)
        }
        return res
    }
}

//2
//function compose(...funcs){
//	if(funcs.length === 0){
//		return arg => arg
//	}
//	if(funcs.length === 1){
//		return funcs[0]
//	}
//	return funcs.reduce(function(a,b){
//		return function(...args){
//			return a(b(...args))
//		}
//	})
//}
//
function compose(...funcs){
	return function(...args){
		return funcs.reduce(function(a,b){
			//a 上一次处理的返回值(无默认指定初始值参数时候a代表处理的数组第一个值，b从1开始计算下标) b当前处理的数据
			return a(b(...args))
		})
	}
}




//3
//function compose(...args) {
//	let count = args.length - 1
//	let result
//	return function fun (...arg1) {
//	    result = args[count].apply(null, arg1)
//	    if (count <= 0) {
//	      return result
//	    }
//	    count--
//	    return fun.call(null, result)
//	}
//}

//4
function compose(...funcs){
	return function(...args){
		return funcs.reduceRight(function(a,b){
			return b(a(...args))
		})
	}
}

function applyMiddleware(arg1,arg2){
	const api = {}
	var a = arg1(api);
	var b = arg2(api);
	let newDispatch = compose(a,b)(function(num){
		console.log(num+'：我是外面传来的数据')
	});
    return {
      dispatch:newDispatch
    }
}
applyMiddleware(middle1,middle2).dispatch(6)

//midleware log
let looger = function({dispatch,getState}){
	//next代表  newDispatch = a(b(dispatch))中的dispatch参数
	return function(next){
		return function(action){
			//可以优化处理  根据action操作
			console.log('dispatch之前数据：', getState())
			let result = next(action)
			console.log('dispatch之后数据：', getState())
			return result;
		}
	}
}

let thunk = function({dispatch,getState}){
	return function(next){
		
		return function(action){

			if (typeof action === 'function') {
		        return action(dispatch, getState)
		    }
			
		    return next(action)
		}
	}
}

//function applyMiddleware(...middlewares){
//	//第一层匿名函数(createStore)接收一个参数
//	return (createStore) => (...args) => { 
//		// 第二层匿名函数...args代表(reducer, preloadedState)接收两个参数   
//		/**
//		 * 在下面的函数creatStore的enhancer(creatStore)(reducer, preloadState)
//		 * 只传了reducer, preloadState两个参数  也就是在这个过程中就当做无中间件的情况处理
//		 */
//		var store = createStore(...args)
//		
//		//初始化变量  记录上次的state
//	    var dispatch = store.dispatch
//	    var chain = []
//	
//	    var middlewareAPI = {
//	      getState: store.getState,
//	      dispatch: (action) => dispatch(action)
//	    }
//	    middlewares.forEach(middleware =>
//		    dispatch = middleware(middlewareAPI)(dispatch)
//		)
//
//	    return {
//	      ...store,
//	      dispatch
//	    }
//  }
//}
//
//const store = createStore(reducer, applyMiddleware(thunk,looger));
//
//store.subscribe(()=>{
//	render(store.getState())
//})
//
//store.dispatch({
//	type: "EYES_QUESTION_LOG",
//	data: "好点了"
//})
//
//store.dispatch({
//	type: "EYES_COLOR_LOG",
//	data: "green"
//})