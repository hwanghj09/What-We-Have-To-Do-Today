import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../firebase';

function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>What We Have To Do Today</h1>
      {user ? (
        <div>
          <p>환영합니다, {user.email}님!</p>
          <a href="/setting">설정 페이지로 이동</a>
          <button onClick={handleLogout} style={{ padding: '10px 15px', borderRadius: '4px', border: 'none', backgroundColor: '#dc3545', color: 'white', cursor: 'pointer', marginTop: '10px' }}>
            로그아웃
          </button>
        </div>
      ) : (
        <div>
          <p>로그인하세요</p>
          <a href="/login">로그인 페이지로 이동</a>
        </div>
      )}
    </div>
  );
}

export default Home