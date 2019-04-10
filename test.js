const combineReducers = reducers => {
	//这里得到的state在creatstore之后合并为一个{a:{..},b:{...},...}这种形式   
	return (state = {}, action) => {
		let all = {}
		for(let key in reducers){
			//reducers[key](state[key], action);中state[key]拆开为对应各个reducer的state  最后返回整个集合
			all[key] = reducers[key](state[key], action);
		}
		return all
	};
};
/**
 * react或者vue中有diff算法    虽然我们的redux的state可以不做是否更新的判断   让框架去做diff算法（但是diff算法也是有个计算的过程，大量计算会消耗性能）
 * 所以我们需要对state直接作出判断是否有更新（react-redux）已经实现了更新判断，但是只能判断最外层
 * immutable.js可以实现这个优化功能 单独配合react使用  在shouldComponentUpdata中做优化
 * redux-immutable 提供了  combineReducers为了合并最外层的数据   immutable.js和react-redux配合使用对react的state做判断渲染
 */

//const combineReducers = reducers => {
//return (state = {}, action) => {
//  return Object.keys(reducers).reduce(
//    (nextState, key) => {
//      nextState[key] = reducers[key](state[key], action);
//      return nextState;
//    },
//    {} 
//  );
//};
//};



/**
 * 中间件处理
 */
function applyMiddleware(arg1,arglog,arg2,arg3){

	var store = arg2(arg3)

	//初始化变量  记录上次的state
    var dispatch = store.dispatch;
	var newDispatch = function(){};
    var middlewareAPI = {
      getState: store.getState,
      dispatch: (action) => newDispatch(action)
    }
    
//  var a = arg1(middlewareAPI);
//  var b = arglog(middlewareAPI);
//
//  newDispatch = a(b(dispatch));
	
	var b = arglog(middlewareAPI)(dispatch);
	newDispatch = arg1(middlewareAPI)(b);
	
    return {
      ...store,
      dispatch:newDispatch
    }
}

/**
 * 创建stoe
 * 观察者模式 
 */
function creatStore(reducer){
	
	let listeners = [];
	let state = {};
	const subscribe = (listenerFun) => {
		listeners.push(listenerFun);
	}
	const getState = () => state;
	const dispatch = (action) => {
		//这里的state收到整个集合
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

function changeState(states, action){
	if(!states){
		return {
			count: 0,
			text: {
				text1: 'default',
				text2: 'olddata'
			}
		}
	}
 	switch (action.type){
 		case "UPDATA":
 			return Object.assign({}, states, {
 				count: action.data
 			})
 		break;
 		case "UPDATAS":
 			//...   assign用法一样
 			return Object.assign({}, states, {
 				text:{
 					...states.text,
					text2: action.data
 				}
 			})
 		break;
 		default:
 			return states;
 		break;
 	}
}

function changeState1(states=0, action){
 	switch (action.type) {
	  case 'INCREMENT':
	    return action.data + 1
	  case 'DECREMENT':
	    return action.data - 1
	  default:
	    return states
	  }
}

var allState = combineReducers({
	a:changeState,
	b:changeState1
});

const store = applyMiddleware(thunk,looger,creatStore,allState);

store.subscribe(()=>{
	const newState = store.getState();
//	render(newState);
})

store.dispatch({type:'UPDATA',data:2})
store.dispatch({type:'DECREMENT',data:2})
var common = function(dispatch){
	console.log('2s之后会打印这个异步结果，请稍后...')
	setTimeout(function(){

		dispatch({
			type: 'UPDATAS',
			data: 'newdata'
		})
	},2000)
}
store.dispatch(common)
function render(newdata){
	var ele = document.getElementById('count')
	ele.innerHTML = newdata.a.text.text2
}

