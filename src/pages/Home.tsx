import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

interface ClassData {
  classname: string;
  createdAt: any;
}

function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState('');
  const [accountType, setAccountType] = useState<'student' | 'teacher' | ''>('');
  const [classes, setClasses] = useState<ClassData[]>([]);
  const navigate = useNavigate();

  // Auth 상태 확인
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Firestore에서 유저 정보 가져오기
  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setNickname(data.displayName || '');
          setAccountType(data.accountType || '');
        }
      };
      fetchUserData();
    }
  }, [user]);

  // Firestore에서 클래스 리스트 가져오기
  useEffect(() => {
    const fetchClasses = async () => {
      const querySnapshot = await getDocs(collection(db, 'classes'));
      const classList: ClassData[] = [];
      querySnapshot.forEach((doc) => {
        classList.push(doc.data() as ClassData);
      });
      setClasses(classList);
    };
    fetchClasses();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('로그아웃 성공!');
      navigate('/login');
    } catch (error: any) {
      alert(`로그아웃 실패: ${error.message}`);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>What We Have To Do Today</h1>
      {user ? (
        <div>
          <p>환영합니다, {nickname}님!</p>
          <Link to="/setting">설정 페이지로 이동</Link>
          <button
            onClick={handleLogout}
            style={{ padding: '10px 15px', borderRadius: '4px', border: 'none', backgroundColor: '#dc3545', color: 'white', cursor: 'pointer', marginTop: '10px' }}
          >
            로그아웃
          </button>

          {accountType === 'teacher' && (
            <div style={{ marginTop: '20px' }}>
              <Link
                to="/create-class"
                style={{ padding: '10px 15px', borderRadius: '4px', border: 'none', backgroundColor: '#28a745', color: 'white', textDecoration: 'none' }}
              >
                클래스 생성하기
              </Link>
            </div>
          )}

          <div style={{ marginTop: '20px' }}>
            <h2>클래스 목록</h2>
            {classes.length > 0 ? (
              <ul>
                {classes.map((cls, index) => (
                  <li key={index}>
                    {cls.classname} ({cls.createdAt.toDate ? cls.createdAt.toDate().toLocaleString() : cls.createdAt})
                  </li>
                ))}
              </ul>
            ) : (
              <p>등록된 클래스가 없습니다.</p>
            )}
          </div>
        </div>
      ) : (
        <div>
          <p>로그인하세요</p>
          <Link to="/login">로그인 페이지로 이동</Link>
        </div>
      )}
    </div>
  );
}

export default Home;
