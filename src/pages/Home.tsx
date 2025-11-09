import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import {
  collection,
  getDocs,
  getDoc,
  doc,
} from 'firebase/firestore';

function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState('');
  const [accountType, setAccountType] = useState<'student' | 'teacher' | ''>('');
  const [classes, setClasses] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      setUser(currentUser);
      setNickname(currentUser.displayName || '');

      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setAccountType(data.accountType || '');
        } else {
          setAccountType('student');
        }
      } catch (err) {
        console.error(err);
        setAccountType('student');
      }

      fetchClasses(currentUser);
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchClasses = async (currentUser: User) => {
    try {
      const classesSnapshot = await getDocs(collection(db, 'classes'));
      const classesList = classesSnapshot.docs
        .filter(doc =>
          doc.data().managerId === currentUser.uid || doc.data().students?.includes(currentUser.uid)
        )
        .map(doc => ({ id: doc.id, ...doc.data() }));
      setClasses(classesList);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 px-6 py-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-200 pb-4 mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          What We Have To Do Today
        </h1>
        <div className="flex items-center gap-3 mt-3 sm:mt-0">
          {/* 설정 버튼 */}
          <Link
            to="/setting"
            className="px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 hover:shadow-sm transition-all"
          >
            ⚙ 설정
          </Link>

          {/* 로그아웃 버튼 */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium bg-gray-800 text-white rounded-lg shadow-sm hover:bg-gray-900 hover:shadow-md active:scale-95 transition-all"
          >
            🚪 로그아웃
          </button>
        </div>
      </header>

      {/* Welcome */}
      <section className="mb-8">
        <p className="text-lg">
          <span className="font-medium">{nickname}</span>님, 환영합니다 👋
        </p>
      </section>

      {/* Quick Actions */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8">
        <h2 className="text-lg font-medium mb-4">빠른 작업</h2>
        <div className="flex flex-wrap gap-3">
          {accountType === 'teacher' && (
            <Link
              to="/create-class"
              className="px-5 py-2.5 bg-gray-800 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-gray-900 hover:shadow-md active:scale-95 transition-all"
            >
              ➕ 클래스 생성하기
            </Link>
          )}
          {accountType === 'student' && (
            <Link
              to="/join-class"
              className="px-5 py-2.5 bg-gray-700 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-gray-800 hover:shadow-md active:scale-95 transition-all"
            >
              👥 클래스 참여하기
            </Link>
          )}
          <Link
            to="/calendar"
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md active:scale-95 transition-all"
          >
            📅 캘린더 보기
          </Link>
        </div>
      </section>

      {/* Class List */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-medium mb-4">참여 중인 클래스</h2>
        {classes.length === 0 ? (
          <p className="text-gray-500 text-sm">참여 중인 클래스가 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {classes.map(cls => (
              <li
                key={cls.id}
                className="flex items-center justify-between px-4 py-3 border border-gray-100 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all"
              >
                <Link
                  to={`/class-todo/${cls.id}`}
                  className="text-gray-800 hover:text-gray-900 font-medium"
                >
                  {cls.classname}
                </Link>
                {cls.managerId === user?.uid && (
                  <Link
                    to={`/class-setting/${cls.id}`}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    ⚙ 설정
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default Home;
