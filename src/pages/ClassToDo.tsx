import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

interface CompletedInfo {
  uid: string;
  timestamp: string;
}

interface Todo {
  id: string;
  title: string;
  completedBy: (string | CompletedInfo)[];
  deadline?: string;
}

function ClassTodo() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [accountType, setAccountType] = useState<'student' | 'teacher' | ''>('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoDeadline, setNewTodoDeadline] = useState('');
  const [classData, setClassData] = useState<any>(null);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setUser(currentUser);

      const userDocQuery = doc(db, 'users', currentUser.uid);
      getDoc(userDocQuery).then(userSnap => {
        if (userSnap.exists()) {
          setAccountType(userSnap.data().accountType || '');
        }
      });

      if (!classId) return;

      const classDocRef = doc(db, 'classes', classId);
                const classUnsubscribe = onSnapshot(classDocRef, (docSnap) => {
                  if (docSnap.exists()) {
                    const data = docSnap.data();
                    setClassData(data);
          const now = new Date();
          const filteredTodos = (data.todos || []).map((todo: any) => {
            // If dueDate exists and deadline is missing, use dueDate as deadline
            if (todo.dueDate && !todo.deadline) {
              todo.deadline = todo.dueDate;
            }
            // Ensure dueDate is removed for consistency within the app
            delete todo.dueDate;
            return todo;
          }).filter((todo: Todo) => {
            if (!todo.deadline) {
              return true;
            }
            const deadlineDate = new Date(todo.deadline);
            return deadlineDate > now;
          });
          setTodos(filteredTodos);
        } else {
          alert('클래스를 찾을 수 없습니다.');
          navigate('/');
        }
      });

      return () => {
        classUnsubscribe();
      };
    });

    return () => {
      authUnsubscribe();
    };
  }, [classId, navigate]);

  const handleAddTodo = async () => {
    if (!newTodoTitle.trim() || !classId) return;

    const deadlineUTC = newTodoDeadline
      ? new Date(newTodoDeadline).toISOString()
      : undefined;

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: newTodoTitle,
      completedBy: [],
      deadline: deadlineUTC,
    };
    const classDocRef = doc(db, 'classes', classId);
    try {
      await updateDoc(classDocRef, { todos: arrayUnion(newTodo) });
      // No local state update needed, onSnapshot will handle it.n      setNewTodoTitle('');
      setNewTodoDeadline('');
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

  

      // Create the updated array and clean the data at the same time.

      const updatedTodos = todos.map((t) => {

        const cleanTodo: any = { ...t };

        delete cleanTodo.dueDate; // Explicitly remove the dueDate field.

  

        if (t.id === todoId) {

          return {

            ...cleanTodo,

            completedBy: alreadyCompleted

              ? t.completedBy.filter((c) =>

                  typeof c === 'string' ? c !== user.uid : c.uid !== user.uid

                )

              : [...t.completedBy, { uid: user.uid, timestamp: now }],

          };

        }

        return cleanTodo;

      });

  

      try {

        await updateDoc(classDocRef, { todos: updatedTodos });

        // No local state update needed, onSnapshot will handle it.

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
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="To-do 제목"
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none"
              />
              <input
                type="datetime-local"
                value={newTodoDeadline}
                onChange={(e) => setNewTodoDeadline(e.target.value)}
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
                  <div className="flex items-center justify-between w-full">
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
                        {todo.title}
                      </span>
                    </label>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">
                        ({todo.completedBy.length}명 완료)
                      </span>
                      {todo.deadline && (
                        <div className="text-xs text-red-500 mt-1">
                          마감: {format(parseISO(todo.deadline), 'yyyy-MM-dd HH:mm', { locale: ko })}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between w-full items-center">
                    <span>
                      {todo.title}{' '}
                      <span className="text-sm text-gray-500">
                        — {todo.completedBy.length}명 완료
                      </span>
                      {todo.deadline && (
                        <span className="text-xs text-red-500 ml-2">
                          마감: {format(parseISO(todo.deadline), 'yyyy-MM-dd HH:mm', { locale: ko })}
                        </span>
                      )}
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
            {selectedTodo.deadline && (
              <p className="text-sm text-red-500 mb-3">
                마감: {format(parseISO(selectedTodo.deadline), 'yyyy-MM-dd HH:mm', { locale: ko })}
              </p>
            )}
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
