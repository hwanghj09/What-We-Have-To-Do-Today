import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

function CreateClass() {
  const navigate = useNavigate();
  const [classname, setClassName] = useState('');

  const createClass = async () => {
    if (!classname) return alert('클래스 이름을 입력해주세요');
    const classid = crypto.randomUUID();

    try {
      const classDocRef = doc(db, 'classes', classid);
      await setDoc(classDocRef, {
        classname,
        createdAt: new Date(),
      });
      alert('클래스 생성 성공!');
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
      <p style={{ marginTop: '10px' }}>
        <Link to="/">홈으로 돌아가기</Link>
      </p>
    </div>
  );
}

export default CreateClass;
