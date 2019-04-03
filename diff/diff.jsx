function view(count) {
  const r = [...Array(count).keys()];
  return <ul id="filmList" className={`list-${count % 3}`}>
	    {r.map(key => {
	    	return <li>list+{key+1}</li>
	    })}
  </ul>
}

//一维数组
function flatten(arr) {
  return [].concat(...arr)
}

//处理数据结构
function el(type, props = {}, ...children){
	return {
		type,
		props,
		children: flatten(children)
	}
}

// 渲染
function render(s){
	s.appendChild(creatEle(view(2)));
}
//创建节点函数
function creatEle(nodes) {
	if (typeof nodes === 'string' || typeof nodes === 'number') {
		return document.createTextNode(nodes);
	}
	let { type, props, children } = nodes;
	const ele = document.createElement(type);  // ul li p span p li li
	//属性赋值
	if(props){
		Object.keys(props).forEach(key => {
			if(key === 'className'){
				ele.setAttribute('class',props[key])
			}else{
				ele.setAttribute(key,props[key])
			}
		})
	}
	for(let item in children){
		let els = creatEle(children[item]);
		ele.appendChild(els)
	}
	return ele;
}

const CREATE = 'CREATE'   //新增一个节点
const REMOVE = 'REMOVE'   //删除原节点
const REPLACE = 'REPLACE'  //替换原节点
const UPDATE = 'UPDATE'    //检查属性或子节点是否有变化
const SET_PROP = 'SET_PROP'  //新增或替换属性
const REMOVE_PROP = 'REMOVE PROP'  //删除属性

function diff(newNode, oldNode){
	if(!oldNode){
		return {
			type: CREATE,
			newOld
		}
	}
	if(!newNode){
		return {
			type: REMOVE
		}
	}
	if(changed(newNode, oldNode)){
		return {
			type: REPLACE,
			newNode
		}
	}
	if(newNode.type){
		return {
			type: UPDATE,
			props: diffProps(newNode.props, oldNode.props),
			children: diffChildren(newNode.children, oldNode.children)
		}
	}
}

function changed(news, olds){
	return typeof(news) !== typeof(olds) || typeof(news) === 'string' && news !== olds || news.type !== olds.type;
}

function diffProps(newProp, oldProp){
	let patches = [];
	let props = Object.assign({},newProp,oldProp);
	Object.keys(props).map(key => {
		const newVal = newProp[key],
			  oldVal = oldProp[key];
		//删除属性
		if(!newVal){
			patches.push({
				type: REMOVE_PROP,
				key,
				value: oldVal
			});
		}
		//更新属性
		if(!oldVal || newVal !== oldVal){
			patches.push({
				type: SET_PROP,
				key,
				value: newVal
			})
		}
	})
	return patches;
}

function diffChildren(newChild, oldChild){
	let patches = [];
	const maximumLength = Math.max(newChild.length, oldChild.length);
	for(let i = 0, len = maximumLength.length; i < len; i++){
		patches[i] = diff(
			newhild[i],
			oldChild[i]
		);
	}
}


var app = document.getElementById('app')
render(app)