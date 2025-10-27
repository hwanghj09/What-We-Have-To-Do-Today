import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

function CreateClassTodo() {
    const { classId } = useParams<{ classId: string }>();
    console.log("classId:", classId);
  return (
    <div style={{ padding: '20px' }}>
      
    </div>
  );
}

export default CreateClassTodo;
