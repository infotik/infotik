import { Feather, SimpleLineIcons } from '@expo/vector-icons';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Avatar } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../../firebaseConfig';
import tw from '../../customtwrnc';
import { getUserById } from '../../redux/actions/user';
import { useNavigation } from '@react-navigation/native';

const CommentModel = (({ post, isVisible, onClose }) => {


  // const dispatch = useDispatch();
  const currentUser = FIREBASE_AUTH.currentUser.uid;

  const [comments, setComments] = useState([]);
  const [postComment, setPostComment] = useState({
    sender: currentUser,
    content: "",
    createdAt: new Date().getTime().toString(),
  });
  const [isPosting, setIsPosting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState({});
  const navigation = useNavigation();

  const handleProfile = (commenterid) => {
    navigation.navigate("profile", { uid: commenterid });
  };

  const handlePostComment = async () => {
    try {
      setIsPosting(true);
      const ref = doc(collection(FIREBASE_DB, 'post'), post.uid);
      const refSnapshot = await getDoc(ref);
      await setDoc(ref, {
        ...refSnapshot.data(),
        commentsCount: refSnapshot.data().commentsCount + 1,
        comments: (refSnapshot.data().comments) ? [
          postComment, ...refSnapshot.data()?.comments
        ] : [postComment]
      }, { merge: true })
      setComments(comments ? [...comments, postComment] : [postComment]);
      setPostComment({
        ...postComment,
        content: ""
      })
      setIsPosting(false);
    } catch (err) {
      console.log(err);
    }

  }

  useEffect(() => {
    setIsLoading(true);
    setComments(post.comments);
    // Fetch all users at once
    if (post.comments) {
      Promise.all(post.comments.map(comment => getUserById(comment.sender)))
        .then(usersData => {
          const usersObj = usersData.reduce((obj, user, index) => {
            obj[post.comments[index].sender] = user;
            return obj;
          }, {});
          setUsers(usersObj);
          setIsLoading(false);

        });
    }
    else {
      setIsLoading(false);
    }
  }, [post.comments]);

  const calculateTimeAgo = (createdAt) => {
    const createdAtTime = Number(createdAt); // Convert createdAt back to a number
    const currentTime = new Date().getTime();
    const timeDifference = currentTime - createdAtTime; // Use the numeric value for calculations
    const minutesAgo = Math.floor(timeDifference / (1000 * 60));
    const hoursAgo = Math.floor(timeDifference / (1000 * 60 * 60));
    const daysAgo = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    if (daysAgo > 0) {
      return `${daysAgo}d`;
    } else if (hoursAgo > 0) {
      return `${hoursAgo}h`;
    } else {
      return `${minutesAgo}m`;
    }
  };

  return (

    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={tw`flex-1 justify-end items-center`}>
        <View style={tw`w-full h-full max-h-[81%] bg-black `}>
          {isLoading ? (
            <View style={tw`flex-1 justify-center items-center`}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )
            : (
              <>
                <View style={tw`flex flex-row justify-between items-center p-2 pb-4 `}>
                  <Text style={tw`text-lime-200 font-bold mx-auto border-t-white  `}>
                    {post.commentsCount} Comments
                  </Text>
                  <TouchableOpacity onPress={onClose} style={{ flexDirection: 'row', justifyContent: 'flex-end', marginRight: 10 }}>
                    <Feather
                      name="x"
                      color="#fff"
                      size={25}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
                <ScrollView contentContainerStyle={tw`pb-3 `} style={tw`flex-1`}>

                  {
                    post.commentsCount === 0 ? (
                      <View style={tw`flex-1 mt-50 justify-center items-center`}>
                        <Text style={tw`text-white/50 text-lg`}>Be the first one to comment</Text>
                      </View>
                    ) :
                      (comments?.map((comment, index) => {
                        const user = users[comment.sender];
                        if (!user) return null;
                        const createdAt = (comment.createdAt); //
                        return (
                          <View key={index} style={tw`w-full  px-3`}>
                            <View style={tw`flex flex-row items-center mb-10 gap-3`}>
                              {user?.photoURL ? (
                                <Image source={{ uri: user?.photoURL }} style={tw`w-36 h-36 rounded-full`} />
                              ) : (
                                <Avatar.Icon size={36} icon={"account"} />
                              )}
                              <View style={tw`flex-1`}>
                                <View style={tw`flex flex-row items-center `}>
                                  <Text onPress={() => handleProfile(comment.sender)} style={tw`font-bold text-white`}>{user.username}</Text>
                                  <Text style={tw`text-white/50 text-xs`}>  {calculateTimeAgo(createdAt)}</Text>
                                </View>
                                <Text style={[tw`text-white/80`, { maxWidth: '90%' }]}>{comment.content}</Text>
                              </View>
                              <View style={tw`items-center`}>
                                <TouchableOpacity>

                                  <SimpleLineIcons
                                    name="heart"
                                    size={15}
                                    resizeMode="contain"
                                    color="#fff"
                                  />
                                  {/* <Image
                        source={require("../../../assets/heartfill.png")}
                        style={{
                          width: 15,
                          resizeMode: "contain",
                          marginBottom: 1,
                        }}
                      /> */}
                                </TouchableOpacity>

                                <Text style={tw` pt-1 text-white/50`}>0</Text>
                              </View>

                            </View>
                          </View>
                        );
                      }))}

                </ScrollView>
                <View style={tw`absolute w-full bottom-0 h-12 bg-black/90 flex-row items-center justify-between px-2 border-t border-gray-500`}>
                  <TextInput
                    placeholder='Add Comment...'
                    style={tw`h-10  px-4 flex-1 text-white`}
                    placeholderTextColor={"grey"}
                    value={postComment.content}
                    onChangeText={(txt) => setPostComment({
                      ...postComment, content: txt
                    })}
                  />
                  <TouchableOpacity onPress={handlePostComment} style={tw`bg-[#58b5f1] px-4 py-1 rounded-full ml-2`}>
                    {isPosting ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={tw`text-white`}>Post</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>

            )}
        </View>
      </View>
    </Modal>

  )
})

const styles = StyleSheet.create({
});

export default CommentModel;
