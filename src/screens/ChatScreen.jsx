import React, { useState, useEffect, useCallback } from "react";
import { GiftedChat } from "react-native-gifted-chat";
import { firestore, auth } from "./firebaseConfig";

//TODO: add navigation on app.js
const ChatScreen = ({ route }) => {
  //pass the receiver's user id in params
  const { otherUserId } = route.params;
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);

  useEffect(() => {
    const fetchConversation = async () => {
      const conversationId = await getOrCreateConversation(
        auth.currentUser.uid,
        otherUserId
      );
      setConversationId(conversationId);

      const unsubscribe = firestore
        .collection(`conversations/${conversationId}/messages`)
        .orderBy("createdAt", "desc")
        .onSnapshot((querySnapshot) => {
          const messagesFirestore = querySnapshot.docs.map((doc) => {
            const firebaseData = doc.data();
            //firestore collection for message data
            //also containing the sender's information
            const data = {
              _id: doc.id,
              text: firebaseData.text,
              createdAt: firebaseData.createdAt.toDate(),
              user: {
                _id: firebaseData.user._id,
                name: firebaseData.user.name,
                avatar: firebaseData.user.avatar,
              },
            };

            return data;
          });

          setMessages(messagesFirestore);
        });

      return () => unsubscribe();
    };

    fetchConversation();
  }, [otherUserId]);

  const onSend = useCallback(
    (messages = []) => {
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, messages)
      );
      const { _id, createdAt, text, user } = messages[0];

      firestore.collection(`conversations/${conversationId}/messages`).add({
        _id,
        createdAt: new Date(createdAt),
        text,
        user,
      });
    },
    [conversationId]
  );

  return (
    <GiftedChat
      messages={messages}
      onSend={(messages) => onSend(messages)}
      user={{
        _id: auth.currentUser.uid,
        name: auth.currentUser.displayName,
        avatar: auth.currentUser.photoURL,
      }}
    />
  );
};

export default ChatScreen;
