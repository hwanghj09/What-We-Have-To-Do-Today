import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [accountType, setAccountType] = useState<'student' | 'teacher' | ''>('');
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    if (user) {
      const fetchNickname = async () => {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setNickname(userDoc.data().displayName || '');
          setAccountType(userDoc.data().accountType || '');
        }
      };
      fetchNickname();
    }
  }, [user]);
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('로그아웃 성공!');
      navigate('/login');
    } catch (error: any) {
      alert(`로그아웃 실패: ${error.message}`);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>What We Have To Do Today</h1>
      {user ? (
        <div>
          <p>환영합니다, {nickname}님!</p>
          <Link to="/setting">설정 페이지로 이동</Link>
          <button onClick={handleLogout} style={{ padding: '10px 15px', borderRadius: '4px', border: 'none', backgroundColor: '#dc3545', color: 'white', cursor: 'pointer', marginTop: '10px' }}>
            로그아웃
          </button>
          {accountType === 'teacher' && (
            <div style={{ marginTop: '20px' }}>
              <Link to="/create-class" style={{ padding: '10px 15px', borderRadius: '4px', border: 'none', backgroundColor: '#28a745', color: 'white', textDecoration: 'none' }}>
                클래스 생성하기
              </Link>
            </div>
          )

          }
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

export default Home