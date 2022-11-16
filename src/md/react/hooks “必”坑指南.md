---
title: 'hooks “必”坑指南'
data: '2022-11-15'
anthor: 'sungy'
---

# hooks “必”坑指南

React hooks想必已经不是什么新鲜“玩意”了，它的出现是为了开发者可以在不写`class`组件的情况使用`state`及其他React特性。

## 动机

引入hooks的动机，官方也是给出了答案：

- 在组件之间复用状态逻辑很难
- 复杂组件变得难以理解
- 难以理解的 class（this的指向问题对新手来说并不友好）
- 由于业务变动，函数组件不得不改为类组件等等

> [React官方文档-Hook简介-动机](https://zh-hans.reactjs.org/docs/hooks-intro.html#motivation)

## 规矩

### 命名

hooks不是普通的函数，必须使用`use`开头命名来表示与普通函数的区别，这样就破坏了函数命名的语义。如 `useGetData` `useTitle` 这样的命名，通过名称很难理解它的用意。这就需要一套严格的hooks命名规则来规范，如果使用 `_` 开头或 `$` 结尾等类似规则可能会更好，当然这并不是什么大问题

### 顺序

同一个组件内，hooks的顺序是不能变化的, 这种要求完全依赖开发者的经验或是 Lint，而站在一般第三方 Lib 的角度看，这种要求调用时序的 API 设计是极为罕见的，非常反直觉。

最理想的API封装应当是给开发者的认知负担最小的。

## Hooks

### useEffect

`React`中有两个重要概念 `Rendering Code` 和 `Event Handlers`

`Rendering Code`是开发者编写的组件渲染逻辑，最终会返回一段`JSX`，它应该是不带副作用的纯函数

```jsx
function App() {
  const [name, updateName] = useState('sungy')

  return <div>{name}</div>
}
```

`Event Handlers`是事件处理函数，可以包含副作用。如下面的`changeName`方法就是属于`Event Handlers`

```jsx
function App() {
  const [name, updateName] = useState('sungy')

  const changeName = () => updateName('zhangsan')

  return <div>{name}</div>
}
```

> 副作用：数据获取，设置订阅以及手动更改 React 组件中的 DOM 都属于副作用

但是并不是所有的副作用都可以放到`Event Handlers`中，比如视图渲染后的数据请求、状态改变后的数据请求

考虑一下默认加载一个列表，点击分页后发起新的请求场景，我们需要组件加载后去发起请求

```jsx
const [pageIndex, setPageIndex] = useState(1)
useEffect(() => {
  fetch('xxx')
}, [pageIndex])
```

现在来思考一下，我们的需求是：
- `pageIndex`变化，接下来发起请求
- 用户点击页码需要重新获取数据，请求依赖`pageIndex`为参数

如果是第二种，那么这是用户行为触发的副作用，相关逻辑应该放到`Event Handlers`中处理

```jsx
const [pageIndex, setPageIndex] = useState(1)
useEffect(() => {
  fetch('xxx')
}, [])

const onPageIndexChange = pageIdx => fetch('xxx')
```

这样`pageIndex`的状态与发送请求之间不再有因果关系，后续对`pageIndex`的修改不会有**无意间触发请求**的顾虑；同样随着业务逻辑复杂，不会导致在`useEffect`的依赖中添加杂乱的变量，使逻辑无法调试、追踪

当我们编写组件时，应尽量保证为纯函数。对于组件中的副作用，应明确副作用是视图渲染后主动触发的还是用户行为触发的，前者应该在`useEffect`中处理， 后者应该放到`Event Handlers`中处理

> `useEffect`

### useRef

我们知道Dom元素是由React创建的，所以Dom元素的增删改都是React的控制范围。

当我们用ref指向一个节点，执行`ref.current`的`fouce`、`blur`、`scrollIntoView`、`getBoundingClientRect` 这些方法时，虽然也是操作了dom，但是这些在React控制范围外；但是当我们执行`remove`、`appendChild`等方法时，这就是React的控制范围内了，React期望开发者能够通过React来控制，而不是调用原生的api，这种情况可以称之为**失控**

```jsx
function App() {
  const [show, setShow] = useState(true)
  const ref = useRef(null)

  return (
    <div>
      <button onClick={() => setShow(false)}>btn1</button>
      <button onClick={() => ref.current.remove()}>btn2</button>
      {show && <p ref={ref}></p>}
    </div>
  )
}
```

`btn1`通过React来移除`p`元素，`btn2`通过原生js来移除。如果先点`btn1`再点`btn2`，那么就会报错。

这就是ref操作dom造成失控的情况。

为了将这种失控控制在单个组件内，React默认情况下不允许跨组件传递ref。

```jsx
function Input(props) {
  return <input {...props} />
}

function Form() {
  const inputRef = useRef()
  const handleClick = () => {
    inputRef.current.force()  // btn点击后会报错
  }
  return (
    <>
      <button onClick={handleClick}>btn</button>
      <Input ref={inputRef} />
    </Input>
  )
}
```

为了能够将ref传递到子组件，React提供了`forwardRef`（forward这里时传递的意思）方法

但从ref失控的角度看，`forwardRef`的意图就很明显了：既然开发者手动调用`forwardRef`破除防止ref失控的限制，那他应该知道自己在做什么，也应该自己承担相应的风险。

### useImperativeHandle

续说上文，既然ref失控是因为使用了不应该使用的方法（比如remove），那么可以限制ref中只存在可以使用的方法，这样就杜绝了开发者通过ref取到dom后，执行不该使用的api，导致ref失控的情况。

```jsx
const Input = forwardRef((props, ref) => {
  const ref = useRef()
  useImperativeHandle(() => {
    return  {
      force: () => ref.current.force()
    }
  })
  return <input {...props} ref={ref} />
})

```

为了减少ref对DOM的滥用，可以使用`useImperativeHandle`限制ref传递的数据结构
