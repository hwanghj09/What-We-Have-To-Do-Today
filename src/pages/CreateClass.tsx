import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

function CreateClass() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userUID, setUserUID] = useState('');
  const [classname, setClassName] = useState('');

  // 로그인 유저 정보 가져오기
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserUID(currentUser.uid);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const createClass = async () => {
    if (!classname) return alert('클래스 이름을 입력해주세요');

    const classid = crypto.randomUUID(); // 문서 ID
    const inviteCode = crypto.randomUUID().slice(0, 6); // 6자리 초대코드

    try {
      const classDocRef = doc(db, 'classes', classid);
      await setDoc(classDocRef, {
        classname,
        managerId: userUID,
        inviteCode,
        students: [], // 학생 참여 배열
        createdAt: new Date(),
      });
      alert(`클래스 생성 성공! 초대코드: ${inviteCode}`);
      navigate('/');
    } catch (err: any) {
      alert(`클래스 생성 실패: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>클래스 생성 페이지</h1>
      <input
        type="text"
        placeholder="클래스 이름"
        value={classname}
        onChange={(e) => setClassName(e.target.value)}
        style={{ display: 'block', marginBottom: '10px', padding: '8px' }}
      />
      <button onClick={createClass} style={{ padding: '10px 15px', cursor: 'pointer' }}>
        클래스 생성
      </button>
    </div>
  );
}

export default CreateClass;
