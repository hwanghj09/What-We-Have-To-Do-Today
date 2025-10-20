import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'

interface Todo {
  id: number
  text: string
  checked: boolean
}

function Home() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = Cookies.get('todos')
    if (savedTodos) {
      try {
        return JSON.parse(savedTodos)
      } catch (e) {
        console.error('Error parsing todos from cookies', e)
        return []
      }
    }
    return []
  })
  const [text, setText] = useState('')

  useEffect(() => {
    Cookies.set('todos', JSON.stringify(todos))
  }, [todos])

  const addTodo = () => {
    if (text.trim() !== '') {
      const newTodo: Todo = {
        id: Date.now(),
        text: text,
        checked: false,
      }
      setTodos([...todos, newTodo])
      setText('')
    }
  }

  const removeTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, checked: !todo.checked } : todo
      )
    )
  }

  return (
    <>
      <h1>What We Have To Do Today</h1>
      <div className='todolist'>
        {todos.map(todo => (
          <div key={todo.id}>
            <input
              type="checkbox"
              checked={todo.checked}
              onChange={() => toggleTodo(todo.id)}
            />
            <span>{todo.text}</span>
            <button onClick={() => removeTodo(todo.id)}>Remove</button>
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Type something"
        className='test'
        value={text}
        onChange={e => setText(e.currentTarget.value)}
        onKeyPress={e => e.key === 'Enter' && addTodo()}
      />
      <button onClick={addTodo}>Add Todo</button>
    </>
  )
}

export default Home