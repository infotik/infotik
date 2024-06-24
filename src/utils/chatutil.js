const { get } = require("firebase/database");

//getting conversation id of a conversation between any two participants
//new conversation gets created if none exists for now
const getOrCreateConversation = async (userId1, userId2) => {
  const conversationsRef = firestore.collection("conversations");
  let conversation = await conversationsRef
    .where("participants", "array-contains", userId1)
    .get()
    .then((querySnapshot) => {
      return querySnapshot.docs.find((doc) => {
        const participants = doc.data().participants;
        return participants.includes(userId2);
      });
    });

  if (!conversation) {
    conversation = await conversationsRef.add({
      participants: [userId1, userId2],
    });
  }

  return conversation.id;
};

module.exports = { getOrCreateConversation };
