import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import {
  collection,
  getDocs,
  getDoc,
  query,
  where,
  doc,
  updateDoc,
  arrayUnion
} from 'firebase/firestore';

interface Invite {
  inviteId: string;
  classId: string;
  classname: string;
}

function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState('');
  const [accountType, setAccountType] = useState<'student' | 'teacher' | ''>('');
  const [classes, setClasses] = useState<any[]>([]);
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([]);
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
      // Firestore에서 계정 정보 가져오기
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setAccountType(data.accountType || '');
      } else {
        // 문서가 없으면 student로 기본 설정
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


  // 클래스 가져오기
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
    <div style={{ padding: '20px' }}>
      <h1>What We Have To Do Today</h1>
      <p>환영합니다, {nickname}님!</p>
      <button onClick={handleLogout}>로그아웃</button>
      <Link to="/setting" style={{ marginLeft: '10px' }}>설정 페이지로 이동</Link>

      {accountType === 'teacher' && (
        <div style={{ marginTop: '20px' }}>
          <Link to="/create-class">클래스 생성하기</Link>
        </div>
      )}
      {accountType === 'student' && (
  <div>
    <Link to="/join-class">클래스 참여하기</Link>
  </div>
)}
      <div style={{ marginTop: '20px' }}>
        <h2>참여 중인 클래스</h2>
        {classes.length === 0 ? (
          <p>참여 중인 클래스가 없습니다.</p>
        ) : (
          <ul>
            {classes.map(cls => (
              <li key={cls.id}>
                {cls.classname} {cls.managerId === user?.uid && <Link to={`/class-setting/${cls.id}`} style={{ marginLeft: '10px' }}>(설정)</Link>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Home;
