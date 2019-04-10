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
const store = creatStore(changeState);

let oldState = store.getState();
store.subscribe((sta)=>{
	const newState = store.getState();
	render(newState,oldState);
	oldState = newState;
})


store.dispatch({type:'UPDATA',data:2})

function render(newdata,olddate){
	var ele = document.getElementById('count')
	ele.innerHTML = newdata.count
}

