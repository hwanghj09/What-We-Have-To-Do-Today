import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';

const locales = {
  'ko': ko,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Event {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource: {
    todo: any;
    classId: string;
    classname: string;
  };
}

function CalendarView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [_user, setUser] = useState<User | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setUser(currentUser);

      const classesRef = collection(db, 'classes');
      let combinedEvents: Event[] = [];
      const classEventsMap = new Map<string, Event[]>();

      const processAndSetEvents = () => {
        combinedEvents = [];
        classEventsMap.forEach(events => {
          combinedEvents.push(...events);
        });
        setEvents(combinedEvents);
      };

      const studentQuery = query(classesRef, where('students', 'array-contains', currentUser.uid));
      const studentUnsubscribe = onSnapshot(studentQuery, (querySnapshot) => {
        const studentEvents: Event[] = [];
        querySnapshot.forEach((doc) => {
          const classData = doc.data();
          if (classData.todos) {
            classData.todos.forEach((todo: any) => {
              if (todo.deadline) {
                studentEvents.push({
                  title: `${classData.classname}: ${todo.title}`,
                  start: new Date(todo.deadline),
                  end: new Date(todo.deadline),
                  allDay: true,
                  resource: {
                    todo: todo,
                    classId: doc.id,
                    classname: classData.classname,
                  },
                });
              }
            });
          }
        });
        classEventsMap.set('student', studentEvents);
        processAndSetEvents();
      });

      const managerQuery = query(classesRef, where('managerId', '==', currentUser.uid));
      const managerUnsubscribe = onSnapshot(managerQuery, (querySnapshot) => {
        const managerEvents: Event[] = [];
        querySnapshot.forEach((doc) => {
          const classData = doc.data();
          if (classData.todos) {
            classData.todos.forEach((todo: any) => {
              if (todo.deadline) {
                managerEvents.push({
                  title: `${classData.classname}: ${todo.title}`,
                  start: new Date(todo.deadline),
                  end: new Date(todo.deadline),
                  allDay: true,
                  resource: {
                    todo: todo,
                    classId: doc.id,
                    classname: classData.classname,
                  },
                });
              }
            });
          }
        });
        classEventsMap.set('manager', managerEvents);
        processAndSetEvents();
      });

      return () => {
        studentUnsubscribe();
        managerUnsubscribe();
      };
    });

    return () => authUnsubscribe();
  }, [navigate]);

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
  };

  const closeModal = () => {
    setSelectedEvent(null);
  };
  
  const messages = {
    today: '오늘',
    next: '다음',
    previous: '이전',
    month: '월',
    week: '주',
    day: '일',
    agenda: '일정',
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">📅 캘린더</h1>
      <div style={{ height: '70vh' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          onSelectEvent={handleSelectEvent}
          messages={messages}
          culture='ko'
        />
      </div>

      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-2 border-b border-gray-200 pb-2">
              {selectedEvent.resource.todo.title}
            </h2>
            <div className="space-y-2 text-sm text-gray-700 my-4">
              <p><strong>클래스:</strong> {selectedEvent.resource.classname}</p>
              <p><strong>마감일:</strong> {format(selectedEvent.start, 'yyyy-MM-dd HH:mm', { locale: ko })}</p>
            </div>
            <div className="flex flex-col gap-2">
               <Link
                to={`/class-todo/${selectedEvent.resource.classId}`}
                className="w-full text-center bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 transition-all"
              >
                To-Do 페이지로 이동
              </Link>
              <button
                onClick={closeModal}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-all"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarView;