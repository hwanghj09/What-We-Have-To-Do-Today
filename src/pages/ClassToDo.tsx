import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

interface CompletedInfo {
  uid: string;
  timestamp: string;
}

interface Todo {
  id: string;
  title: string;
  completedBy: (string | CompletedInfo)[];
}

function ClassTodo() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [accountType, setAccountType] = useState<'student' | 'teacher' | ''>('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [classData, setClassData] = useState<any>(null);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setUser(currentUser);

      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const acctType = userDoc.exists() ? userDoc.data().accountType : '';
      setAccountType(acctType as any);

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
    });

    return () => unsubscribe();
  }, [classId, navigate]);

  const handleAddTodo = async () => {
    if (!newTodoTitle.trim() || !classId) return;
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: newTodoTitle,
      completedBy: [],
    };
    const classDocRef = doc(db, 'classes', classId);
    try {
      await updateDoc(classDocRef, { todos: arrayUnion(newTodo) });
      setTodos((prev) => [...prev, newTodo]);
      setNewTodoTitle('');
    } catch (err: any) {
      alert('To-do 추가 실패');
    }
  };

  const handleToggleTodo = async (todoId: string) => {
    if (!user || !classId) return;
    const classDocRef = doc(db, 'classes', classId);
    const todo = todos.find((t) => t.id === todoId);
    if (!todo) return;

    const now = new Date().toISOString();
    const completedByUIDs = todo.completedBy.map((c) =>
      typeof c === 'string' ? c : c.uid
    );
    const alreadyCompleted = completedByUIDs.includes(user.uid);

    const updatedTodos = todos.map((t) =>
      t.id === todoId
        ? {
            ...t,
            completedBy: alreadyCompleted
              ? t.completedBy.filter((c) =>
                  typeof c === 'string' ? c !== user.uid : c.uid !== user.uid
                )
              : [...t.completedBy, { uid: user.uid, timestamp: now }],
          }
        : t
    );

    try {
      await updateDoc(classDocRef, { todos: updatedTodos });
      setTodos(updatedTodos);
    } catch (err: any) {
      alert('To-do 업데이트 실패');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 text-gray-800">
      <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-semibold text-center mb-6 border-b border-gray-200 pb-3">
          ✅ 클래스 To-do
        </h1>

        {/* 선생님 전용 To-do 추가 */}
        {accountType === 'teacher' && classData?.managerId === user?.uid && (
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-3">새 To-do 추가</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="To-do 제목"
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none"
              />
              <button
                onClick={handleAddTodo}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 active:scale-[0.98] transition-all"
              >
                추가
              </button>
            </div>
          </div>
        )}

        {/* To-do 목록 */}
        <h2 className="text-lg font-medium mb-3">To-do 목록</h2>
        {todos.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            등록된 To-do가 없습니다.
          </p>
        ) : (
          <ul className="space-y-3">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex justify-between items-center bg-gray-100 border border-gray-200 rounded-lg px-4 py-3"
              >
                {accountType === 'student' ? (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={todo.completedBy.some((c) =>
                        typeof c === 'string'
                          ? c === user?.uid
                          : c.uid === user?.uid
                      )}
                      onChange={() => handleToggleTodo(todo.id)}
                      className="w-5 h-5 accent-gray-700"
                    />
                    <span className="text-gray-800">
                      {todo.title}{' '}
                      <span className="text-sm text-gray-500">
                        ({todo.completedBy.length}명 완료)
                      </span>
                    </span>
                  </label>
                ) : (
                  <div className="flex justify-between w-full items-center">
                    <span>
                      {todo.title}{' '}
                      <span className="text-sm text-gray-500">
                        — {todo.completedBy.length}명 완료
                      </span>
                    </span>
                    <button
                      onClick={() => setSelectedTodo(todo)}
                      className="text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-1 hover:bg-gray-200 transition-all"
                    >
                      자세히 보기
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ✅ 자세히 보기 모달 */}
      {selectedTodo && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setSelectedTodo(null)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-200 pb-2">
              {selectedTodo.title}
            </h2>
            {selectedTodo.completedBy.length === 0 ? (
              <p className="text-gray-500 text-center">아직 완료한 학생이 없습니다.</p>
            ) : (
              <ul className="space-y-2 text-sm text-gray-700">
                {selectedTodo.completedBy.map((c, i) => {
                  const uid = typeof c === 'string' ? c : c.uid;
                  const time =
                    typeof c === 'string'
                      ? '시간 정보 없음'
                      : new Date(c.timestamp).toLocaleString();
                  return (
                    <li key={i} className="border-b border-gray-100 pb-1">
                      <span className="font-mono">{uid}</span>
                      <br />
                      <span className="text-xs text-gray-500">{time}</span>
                    </li>
                  );
                })}
              </ul>
            )}
            <button
              onClick={() => setSelectedTodo(null)}
              className="w-full mt-6 bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 transition-all"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClassTodo;
