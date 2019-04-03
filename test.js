
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
    
    var a = arg1(middlewareAPI);
    var b = arglog(middlewareAPI);

    newDispatch = a(b(dispatch));

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
let looger = function({dispatch,getState}){
	//next代表  newDispatch = a(b(dispatch))中的dispatch参数
	return function(next){
		return function(action){
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

const store = applyMiddleware(thunk,looger,creatStore,changeState);

store.subscribe(()=>{
	const newState = store.getState();
	render(newState);
})

store.dispatch({type:'UPDATA',data:2})
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
	ele.innerHTML = newdata.text.text2
}

