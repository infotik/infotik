import React, { forwardRef, useImperativeHandle, useRef, useMemo, useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../../firebaseConfig';
import { useDispatch } from 'react-redux';
import { getUserById } from '../../redux/actions/user';

const CommentModel = forwardRef(({ post }, prevnetRef) => {
  useImperativeHandle(prevnetRef, () => ({
    open: handlePresentModalPress
  }));

  const dispatch = useDispatch();

  const bottomSheetModalRef = useRef(null);
  const currentUser = FIREBASE_AUTH.currentUser.uid;

  // variables
  const snapPoints = useMemo(() => ['75%', '100%'], []);

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleSheetChanges = useCallback((index) => {
    console.log('handleSheetChanges', index);
  }, []);

  const [comments, setComments] = useState([]);
  const [postComment, setPostComment] = useState({
    sender: currentUser,
    content: "",
    createdAt: new Date().getTime().toString(),
  });

  const handlePostComment = async () => {
    try {
      const ref = doc(collection(FIREBASE_DB, 'post'), post.uid);
      const refSnapshot = await getDoc(ref);
      await updateDoc(ref, {
        ...refSnapshot.data(),
        commentsCount: refSnapshot.data().commentsCount + 1,
        comments: [
          postComment, ...refSnapshot.data()?.comments
        ]
      }, { new: true })
      setComments([...comments, postComment]);
      setPostComment({
        ...postComment,
        content: ""
      })
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    setComments(post.comments);
    // console.log(comments);
  });

  return (
    <BottomSheetModalProvider>
      <View style={styles.container}>
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={1}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          style={styles.bottomSheet} // Add this line to apply zIndex
        >
          <BottomSheetView style={styles.contentContainer}>
            <ScrollView>
              {comments?.map((comment, index) => {
                // console.log(comment.sender);
                const user = getUserById(comment.sender);
                // console.log(user);
                return (
                  <View key={index} style={{ backgroundColor: "white", width: "100%", flex: 1 }}>
                    <Image source={{
                      uri: user.photoURL,
                    }} />
                    <View>
                      <Text style={{ color: "black" }}>{user.displayName}</Text>
                      <Text>{comment.content}</Text>
                    </View>
                  </View>)
              })}
            </ScrollView>
            <View style={styles.textInp}>
              <TextInput
                placeholder='Add Comment...'
                style={styles.textField}
                placeholderTextColor={"#4c4c4c"}
                value={postComment.content}
                onChangeText={(txt) => setPostComment({
                  ...postComment, content: txt
                })} />
              <TouchableOpacity onPress={handlePostComment}>
                <Text style={styles.postBtn}>Post</Text>
              </TouchableOpacity>
            </View>
          </BottomSheetView>
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    position: 'absolute',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: "black",
  },
  bottomSheet: {
    position: 'relative',
    zIndex: 10000, // Set your desired zIndex value here
  },
  postBtn: {
    color: 'white',
    backgroundColor: '#58b5f1',
    fontSize: 18,
    paddingHorizontal: 15,
    paddingVertical: 2.5,
    borderRadius: 15,
    marginRight: 10,
  },
  textInp: {
    width: '100%',
    height: 50,
    position: 'absolute',
    bottom: 30,
    backgroundColor: '#2e2e35',
    flexDirection: 'row',
    borderTopColor: 'lightgrey',
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textField: {
    width: '80%',
    height: 40,
    borderRadius: 25,
    paddingHorizontal: 20,
    marginLeft: 5,
    color: 'white',
    fontSize: 16,
  },
});

export default CommentModel;
