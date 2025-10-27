import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

function CreateClass() {
  const navigate = useNavigate();
  const [classname, setClassName] = useState('');
  const [userUID, setUserUID] = useState('');

  // 로그인한 사용자의 UID 가져오기
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUserUID(currentUser.uid);
      else navigate('/login'); // 로그인 안했으면 로그인 페이지로 이동
    });
    return () => unsubscribe();
  }, [navigate]);

  const createClass = async () => {
    if (!classname) return alert('클래스 이름을 입력해주세요');
    if (!userUID) return alert('사용자 정보를 불러오는 중입니다. 잠시만 기다려주세요.');

    const classid = crypto.randomUUID(); // 랜덤 ID 생성

    try {
      const classDocRef = doc(db, 'classes', classid);
      await setDoc(classDocRef, {
        classname,
        managerId: userUID, // 🔹 오타 수정
        createdAt: new Date(),
      });
      alert('클래스 생성 성공!');
      navigate('/'); // 홈으로 이동
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
        style={{ display: 'block', marginBottom: '10px', padding: '8px', width: '300px' }}
      />
      <button
        onClick={createClass}
        style={{ padding: '10px 15px', cursor: 'pointer', borderRadius: '4px', backgroundColor: '#28a745', color: 'white', border: 'none' }}
      >
        클래스 생성
      </button>
      <p style={{ marginTop: '10px' }}>
        <Link to="/">홈으로 돌아가기</Link>
      </p>
    </div>
  );
}

export default CreateClass;
