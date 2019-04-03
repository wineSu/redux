//设置数据集合
const stateAll = {
	title:{
		text: 'redux 实现',
		color: 'red'
	},
	content:{
		text: 'redux 内容',
		color: 'blue'
	}
}
render(stateAll);
function render(state){
	renderTitle(state.title);
	renderContent(state.content);
}

function renderTitle(tit){
	const titDom = document.getElementById('title');
	titDom.innerHTML = tit.text;
	titDom.style.color = tit.color;
}

function renderContent(cont){
	const contDom = document.getElementById('content');
	contDom.innerHTML = cont.text;
	contDom.style.color = cont.color;
}

function dispatch(action){
	switch (action.type){
		case 'UPDATE_TITLE_TEXT':
			stateAll.title.text = action.text
		break;
		case 'UPDATE_TITLE_COLOR':
			stateAll.title.color = action.color
		break;
		default:
		break;
	}
}
dispatch({ type: 'UPDATE_TITLE_TEXT', text: '《React.js 小书》' })
dispatch({ type: 'UPDATE_TITLE_COLOR', color: 'blue' })
render(stateAll);