
/**
 * compose处理
 * var fun1 = function(arg){
		console.log(arg,'+fun1')
		return arg;
	}
	var fun2 = function(arg){
		console.log(arg,'+fun2')
		return arg;
	}
	var fun3 = function(arg){
		console.log(arg,'+fun3')
		return arg;
	}
	var chain =[fun1,fun2,fun3]
	var dispatch = fun1(fun2(fun3('我是store.dispatch'))) 等价于  dispatch = compose(...chain)(store.dispatch)
 * 
 */
function compose(...funcs){
	if(funcs.length === 0){
		return arg => arg
	}
	if(funcs.length === 1){
		return funcs[0]
	}
	return funcs.reduce(function(a,b){
		//a 上一次处理的返回值(无默认指定初始值参数时候a代表处理的数组第一个值，b从1开始计算下标) b当前处理的数据
		return function(...args){
			return a(b(...args))
		}
	})
}

/**
 * 中间件处理
 */
function applyMiddleware(...middlewares){
	//第一层匿名函数(createStore)接收一个参数
	return (createStore) => (...args) => { 
		// 第二层匿名函数...args代表(reducer, preloadedState)接收两个参数   
		/**
		 * 在下面的函数creatStore的enhancer(creatStore)(reducer, preloadState)
		 * 只传了reducer, preloadState两个参数  也就是在这个过程中就当做无中间件的情况处理
		 */
		var store = createStore(...args)
		
		//初始化变量  记录上次的state
	    var dispatch = store.dispatch
	    var chain = []
	
	    var middlewareAPI = {
	      getState: store.getState,
	      dispatch: (action) => dispatch(action)
	    }
	    //遍历中间件   将middlewareAPI回调出去  所以中间件中可以使用dispatch getState   chain代表调用中间件之后的返回函数集合
	    chain = middlewares.map(middleware => middleware(middlewareAPI))
	    
	    //compose函数上面有解释
	    dispatch = compose(...chain)(store.dispatch)
	
	    return {
	      ...store,
	      dispatch
	    }
    }
}

/**
 * 创建stoe
 * 观察者模式 
 */
function creatStore(reducer, preloadState, enhancer){
	
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
		return enhancer(creatStore)(reducer, preloadState);
	}
	
	//reducer为一个函数必须
	if(typeof reducer !== 'function'){
		throw new Error('reducer 必须为一个函数');
	}
	
	let listeners = [];
	let state = null;
	const subscribe = (listenerFun) => {
		listeners.push(listenerFun);
	}
	const getState = () => state;
	const dispatch = (action) => {
		state = reducer(state, action);
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

//midleware log
let looger = ({dispatch,getState}) => next => action => {
	console.log('dispatch之前数据：', getState())
	let result = next(action)
	console.log('dispatch之后数据：', getState())
	return result;
}
//midleware thunk
let thunk = ({ dispatch, getState }) => next => action => {
    if (typeof action === 'function') {
        return action(dispatch, getState)
    }
    return next(action)
}

function changeState(states, action){
	if(!states){
		return {
			count: 0
		}
	}
 	switch (action.type){
 		case "UPDATA":
 			return {
 				...states,
 				count: action.data
 			}
 		break;
 		case "UPDATAS":
 			return {
 				...states,
 				count: action.data
 			}
 		break;
 		default:
 			return states;
 		break;
 	}
}

const store = applyMiddleware(thunk,looger)(creatStore)(changeState);

let oldState = store.getState();
store.subscribe(()=>{
	const newState = store.getState();
	render(newState,oldState);
	oldState = newState;
})

store.dispatch({type:'UPDATA',data:2})
store.dispatch(function(dispatch){
	console.log('2s之后会打印这个异步结果，请稍后...')
	setTimeout(function(){
		dispatch({
			type: 'UPDATAS',
			data: 4
		})
	},2000)
})

function render(newdata,olddate){
	var ele = document.getElementById('count')
	ele.innerHTML = newdata.count
}

