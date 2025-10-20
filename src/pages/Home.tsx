import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'

interface Todo {
  id: number
  text: string
}

function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [text, setText] = useState('')

  useEffect(() => {
    const savedTodos = Cookies.get('todos')
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos))
    }
  }, [])

  useEffect(() => {
    Cookies.set('todos', JSON.stringify(todos))
  }, [todos])

  const addTodo = () => {
    if (text.trim() !== '') {
      const newTodo: Todo = {
        id: Date.now(),
        text: text,
      }
      setTodos([...todos, newTodo])
      setText('')
    }
  }

  const removeTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  return (
    <>
      <h1>Todo List</h1>
      <div className='todolist'>
        {todos.map(todo => (
          <div key={todo.id}>
            <input type="checkbox" />
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