import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  setDoc
} from 'firebase/firestore';

interface Todo {
  id: string;
  title: string;
  completedBy: string[];
}

function ClassTodo() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [accountType, setAccountType] = useState<'student' | 'teacher' | ''>('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [classData, setClassData] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setUser(currentUser);

      // 유저 정보 가져오기
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const acctType = userDoc.exists() ? userDoc.data().accountType : '';
      setAccountType(acctType as any);

      // 클래스 데이터 가져오기
      if (!classId) return;
      const classDoc = await getDoc(doc(db, 'classes', classId));
      if (!classDoc.exists()) {
        alert('클래스를 찾을 수 없습니다.');
        navigate('/');
        return;
      }
      const data = classDoc.data();
      setClassData(data);
      setTodos(data.todos || []);

      // 학생이면서 매니저가 아닌 경우 접근 금지
      if (acctType === 'student' && data.managerId !== currentUser.uid) {
        // 학생은 접근 가능, 체크만 가능
        setTodos(data.todos || []);
      }
    });

    return () => unsubscribe();
  }, [classId, navigate]);

  const handleAddTodo = async () => {
    if (!newTodoTitle.trim() || !classId) return;
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: newTodoTitle,
      completedBy: []
    };
    const classDocRef = doc(db, 'classes', classId);
    try {
      await updateDoc(classDocRef, {
        todos: arrayUnion(newTodo)
      });
      setTodos(prev => [...prev, newTodo]);
      setNewTodoTitle('');
    } catch (err: any) {
      console.error(err);
      alert('To-do 추가 실패');
    }
  };

  const handleToggleTodo = async (todoId: string) => {
    if (!user || !classId) return;
    const classDocRef = doc(db, 'classes', classId);
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;

    const completed = todo.completedBy.includes(user.uid);
    try {
      if (completed) {
        // 체크 해제
        await updateDoc(classDocRef, {
          todos: todos.map(t =>
            t.id === todoId
              ? { ...t, completedBy: t.completedBy.filter(uid => uid !== user.uid) }
              : t
          )
        });
        setTodos(prev =>
          prev.map(t =>
            t.id === todoId
              ? { ...t, completedBy: t.completedBy.filter(uid => uid !== user.uid) }
              : t
          )
        );
      } else {
        // 체크
        await updateDoc(classDocRef, {
          todos: todos.map(t =>
            t.id === todoId
              ? { ...t, completedBy: [...t.completedBy, user.uid] }
              : t
          )
        });
        setTodos(prev =>
          prev.map(t =>
            t.id === todoId
              ? { ...t, completedBy: [...t.completedBy, user.uid] }
              : t
          )
        );
      }
    } catch (err: any) {
      console.error(err);
      alert('To-do 업데이트 실패');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>클래스 To-do</h1>
      {accountType === 'teacher' && classData?.managerId === user?.uid && (
        <div style={{ marginTop: '20px' }}>
          <h2>새 To-do 추가</h2>
          <input
            type="text"
            placeholder="To-do 제목"
            value={newTodoTitle}
            onChange={e => setNewTodoTitle(e.target.value)}
            style={{ padding: '8px', marginRight: '10px' }}
          />
          <button onClick={handleAddTodo}>추가</button>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <h2>To-do 목록</h2>
        {todos.length === 0 ? <p>등록된 To-do가 없습니다.</p> :
          <ul>
            {todos.map(todo => (
              <li key={todo.id} style={{ marginBottom: '10px' }}>
                {accountType === 'student' ? (
                  <label>
                    <input
                      type="checkbox"
                      checked={todo.completedBy.includes(user!.uid)}
                      onChange={() => handleToggleTodo(todo.id)}
                    />
                    {' '}{todo.title} ({todo.completedBy.length}명 완료)
                  </label>
                ) : (
                  <span>{todo.title} - 완료한 학생: {todo.completedBy.length}</span>
                )}
              </li>
            ))}
          </ul>
        }
      </div>
    </div>
  );
}

export default ClassTodo;
