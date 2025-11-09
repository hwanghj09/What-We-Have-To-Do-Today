import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

// This function runs every hour.
export const sendTodoNotifications = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const classesSnapshot = await db.collection('classes').get();

    for (const classDoc of classesSnapshot.docs) {
      const classData = classDoc.data();
      const todos = classData.todos || [];
      const studentIds = classData.students || [];

      for (const todo of todos) {
        if (todo.deadline) {
          const deadline = new Date(todo.deadline);

          // Check if the deadline is within 24 hours and has not passed
          if (deadline > now && deadline <= oneDayFromNow) {
            const completedByUids = todo.completedBy.map((c: any) =>
              typeof c === 'string' ? c : c.uid
            );

            const studentsToNotify = studentIds.filter(
              (studentId: string) => !completedByUids.includes(studentId)
            );

            for (const studentId of studentsToNotify) {
              const userDoc = await db.collection('users').doc(studentId).get();
              const userData = userDoc.data();

              if (userData && userData.fcmToken) {
                const payload = {
                  notification: {
                    title: `마감 임박: ${todo.title}`,
                    body: `숙제 마감일이 24시간 남았습니다!`,
                    icon: '/icons/logo.png',
                  },
                };

                try {
                  await admin.messaging().sendToDevice(userData.fcmToken, payload);
                  console.log(`Notification sent to user ${studentId} for todo ${todo.title}`);
                } catch (error) {
                  console.error(`Error sending notification to user ${studentId}:`, error);
                  // Here you might want to handle invalid tokens, e.g., by removing them from the user's document
                }
              }
            }
          }
        }
      }
    }
  });
