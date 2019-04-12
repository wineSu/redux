
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

function createStore (stateChanger) {
  const listeners = []
  let state = null;
  const subscribe = (listener) => {
  	listeners.push(listener)
  }
  const getState = () => state
  const dispatch = (action) => {
    state = stateChanger(state, action)
    listeners.forEach((listener) => listener())
  }
  dispatch({})
  return { getState, dispatch, subscribe }
}

const store = createStore(reducer);

store.subscribe(()=>{
	render(store.getState())
})

store.dispatch({
	type: "EYES_QUESTION_LOG",
	data: "好点了"
})

store.dispatch({
	type: "EYES_COLOR_LOG",
	data: "green"
})

