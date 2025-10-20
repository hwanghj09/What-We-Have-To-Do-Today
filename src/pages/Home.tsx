import { useState } from 'react'

function Home() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>Home Page</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </>
  )
}

export default Home
