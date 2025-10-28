import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

interface Todo {
  id: string;
  title: string;
  completedBy: any[];
  dueDate?: string;
}

function ClassSetting() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [_user, setUser] = useState<User | null>(null);
  const [className, setClassName] = useState('');
  const [students, setStudents] = useState<{ uid: string; email: string }[]>([]);
  const [classinviteCode, setClassinviteCode] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setUser(currentUser);

      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const accountType = userDoc.exists() ? userDoc.data().accountType : '';
      if (accountType === 'student') {
        alert('학생은 클래스 설정 페이지에 접근할 수 없습니다.');
        navigate('/');
        return;
      }

      if (classId) {
        const classDoc = await getDoc(doc(db, 'classes', classId));
        if (!classDoc.exists()) {
          alert('클래스를 찾을 수 없습니다.');
          navigate('/');
          return;
        }

        const classData = classDoc.data();
        if (classData.managerId !== currentUser.uid) {
          alert('이 클래스의 매니저가 아니므로 접근할 수 없습니다.');
          navigate('/');
          return;
        }

        setClassName(classData.classname || '');
        setClassinviteCode(classData.inviteCode || '');
        setTodos(classData.todos || []);

        const studentUIDs: string[] = classData.students || [];
        const fetchedStudents: { uid: string; email: string }[] = [];
        for (const uid of studentUIDs) {
          const userSnap = await getDoc(doc(db, 'users', uid));
          if (userSnap.exists()) {
            const userData = userSnap.data();
            fetchedStudents.push({
              uid,
              email: userData.email || '이메일 없음',
            });
          }
        }
        setStudents(fetchedStudents);
      }
    });

    return () => unsubscribe();
  }, [classId, navigate]);

  const handleUpdateName = async () => {
    if (!classId) return;
    try {
      await updateDoc(doc(db, 'classes', classId), { classname: className });
      alert('클래스 이름이 변경되었습니다.');
    } catch (err) {
      console.error(err);
      alert('클래스 이름 변경 실패');
    }
  };

  const handleDeleteClass = async () => {
    if (!classId) return;
    if (!window.confirm('정말로 클래스를 삭제하시겠습니까?')) return;
    try {
      await deleteDoc(doc(db, 'classes', classId));
      alert('클래스가 삭제되었습니다.');
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('클래스 삭제 실패');
    }
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setNewTitle(todo.title);
    setNewDueDate(todo.dueDate ? todo.dueDate.slice(0, 16) : '');
  };

  const handleSaveTodo = async () => {
    if (!editingTodo || !classId) return;

    const updatedTodo = {
      ...editingTodo,
      title: newTitle.trim(),
      dueDate: newDueDate ? new Date(newDueDate).toISOString() : undefined,
    };

    const updatedTodos = todos.map((t) => (t.id === editingTodo.id ? updatedTodo : t));
    try {
      await updateDoc(doc(db, 'classes', classId), { todos: updatedTodos });
      setTodos(updatedTodos);
      setEditingTodo(null);
      alert('To-do가 수정되었습니다.');
    } catch (err) {
      console.error(err);
      alert('수정 실패');
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    if (!classId) return;
    if (!window.confirm('이 To-do를 삭제하시겠습니까?')) return;
    const updatedTodos = todos.filter((t) => t.id !== todoId);
    try {
      await updateDoc(doc(db, 'classes', classId), { todos: updatedTodos });
      setTodos(updatedTodos);
    } catch (err) {
      console.error(err);
      alert('삭제 실패');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
          <h1 className="text-2xl font-semibold">⚙ 클래스 설정</h1>
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-gray-700 transition-all"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600">
            <strong>초대 코드:</strong> <span className="font-mono">{classinviteCode}</span>
          </p>
        </div>

        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-2">클래스 이름 변경</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none"
            />
            <button
              onClick={handleUpdateName}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all"
            >
              변경
            </button>
          </div>
        </div>

        {/* To-do 관리 */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-3">📋 클래스 To-do 관리</h2>
          {todos.length === 0 ? (
            <p className="text-gray-500">등록된 To-do가 없습니다.</p>
          ) : (
            <ul className="space-y-3">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className="border border-gray-200 rounded-lg p-3 flex justify-between items-center"
                >
                  <div>
                    <strong>{todo.title}</strong>{' '}
                    {todo.dueDate && (
                      <span className="text-sm text-gray-500">
                        (기한: {new Date(todo.dueDate).toLocaleString()})
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditTodo(todo)}
                      className="text-gray-700 hover:text-black text-sm"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      삭제
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* To-do 수정 폼 */}
        {editingTodo && (
          <div className="bg-gray-100 border border-gray-200 p-6 rounded-xl mb-10">
            <h3 className="font-semibold mb-3">✏️ To-do 수정</h3>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
            />
            <label className="block text-sm mb-1 text-gray-700">기한 설정</label>
            <input
              type="datetime-local"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveTodo}
                className="flex-1 bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 transition-all"
              >
                저장
              </button>
              <button
                onClick={() => setEditingTodo(null)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-all"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* 학생 목록 */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-3">👩‍🎓 학생 목록</h2>
          {students.length === 0 ? (
            <p className="text-gray-500">등록된 학생이 없습니다.</p>
          ) : (
            <ul className="space-y-1">
              {students.map((stu) => (
                <li key={stu.uid} className="text-sm text-gray-700">
                  {stu.email}{' '}
                  <span className="text-gray-400">({stu.uid})</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleDeleteClass}
            className="w-full bg-red-100 text-red-700 py-3 rounded-lg hover:bg-red-200 transition-all"
          >
            🗑 클래스 삭제
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClassSetting;
