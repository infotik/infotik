import { ResizeMode, Video } from "expo-av";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
// import { useUser } from '../../hooks/useUser'
// import PostSingleOverlay from './overlay'
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Avatar } from "react-native-paper";
import index from "uuid-random";
import { COLORS } from "../../constants";
import tw from "../../customtwrnc";
import {
  LikePost,
  checkFollow,
  checkLike,
  followUser,
  getUserById,
} from "../../redux/actions/user";
import CommentModel from "./CommentModel";
import styles from "./styles";

const renderItem = ({ item }) => (
  <TouchableOpacity>
    <View style={tw`mx-1`}>
      <Text style={tw`text-sm text-[${COLORS.secondary}] font-montserrat`}>
        {item}
      </Text>
    </View>
  </TouchableOpacity>
);

export const PostSingle = forwardRef(({ item, ...props }, parentRef) => {
  const video = React.useRef(null);
  const timeoutref = React.useRef(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [user, setUser] = useState(null);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [videoStop, setVideoStop] = useState(false);
  const [isLike, setIsLike] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const bottomSheetModalRef = useRef(null);
  const navigation = useNavigation();
  const [mute, setMute] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [imageFailedToLoad, setImageFailedToLoad] = useState(false);
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);

  useImperativeHandle(parentRef, () => ({
    play,
    unload,
    stop,
  }));

  useEffect(() => {
    return () => {
      console.log("unloading");
      unload();
    };
  }, []);

  const handleLoadStart = () => {
    setIsLoading(true);
  };

  const handleReadyForDisplay = () => {
    setIsLoading(false);
  };

  const play = async () => {
    if (video.current == null) {
      return;
    }

    // if video is already playing return
    const status = await video.current.getStatusAsync();
    if (status?.isPlaying) {
      return;
    }
    try {
      await video.current.playAsync();
    } catch (e) {
      console.log("error", e.message);
    }
  };

  const stop = async () => {
    if (video.current == null) {
      return;
    }

    // if video is already stopped return
    const status = await video.current.getStatusAsync();
    if (!status?.isPlaying) {
      return;
    }
    try {
      await video.current.stopAsync();
    } catch (e) {
      console.log(e);
    }
  };

  const unload = async () => {
    if (video.current == null) {
      return;
    }

    try {
      await video.current.unloadAsync();
    } catch (e) {
      console.log(e);
    }
  };

  const handleOpen = (link) => {
    Linking.openURL(link);
  };

  const handlePressIn = () => {
    const timer = setTimeout(async () => {
      await video.current.pauseAsync();
      setVideoStop(true);
    }, 1000);
    setLongPressTimer(timer);
  };

  const handlePressOut = async () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
    }
    await video.current.playAsync();
    setVideoStop(false);
  };

  useEffect(() => {
    (async function () {
      const user = await getUserById(item.creator);
      const like = await checkLike(item.id);
      setUser(user);
      setIsLike(like);
    })();
  }, []);

  useEffect(() => {
    setLikesCount(item.likesCount);
  }, [item]);

  const HandleLike = async (id) => {
    if (likeLoading) {
      return;
    }
    setLikeLoading(true);
    if (isLike) {
      setIsLike(false);
      setLikesCount((prev) => prev - 1);
    } else {
      setIsLike(true);
      setLikesCount((prev) => prev + 1);
    }

    await LikePost(id);
    setLikeLoading(false);
  };

  const OpenComments = () => {
    console.log("opening...");
    // bottomSheetModalRef.current.open();
    setIsCommentModalVisible(!isCommentModalVisible);
  };
  const closeModal = () => {
    setIsCommentModalVisible(!isCommentModalVisible);
  };
  const handleProfile = () => {
    stop();
    navigation.navigate("profile", { uid: user.uid });
  };

  const handleMuteToggle = async () => {
    if (video.current) {
      video.current.setIsMutedAsync(!mute);
    }
    setMute((prev) => !prev);
    setShowPopup(true);
    if (timeoutref.current) {
      clearTimeout(timeoutref);
    }
    timeoutref.current = setTimeout(() => {
      setShowPopup(false);
    }, 500);
    console.log("muting...");
  };

  const handleMuteToggleLong = () => {
    setShowPopup(false);
    video.current.setIsMutedAsync(false);
  };

  const [loading, setLoading] = useState(false);

  const { followedUsers, setFollowedUsers } = props;
  const isFollowing = followedUsers.has(item.creator);

  useEffect(() => {
    (async function () {
      if (user) {
        const ans = await checkFollow(user.uid);
        if (ans) {
          followedUsers.add(user.uid);
        } else {
          followedUsers.delete(user.uid);
        }
        setFollowedUsers(new Set(followedUsers));
      }
    })();
  }, [user]);

  const handleFollow = async () => {
    if (loading) {
      console.log("loading...");
      return;
    }
    setLoading(true);
    const isCurrentlyFollowing = followedUsers.has(user.uid);
    await followUser(user.uid, isCurrentlyFollowing);
    if (isCurrentlyFollowing) {
      followedUsers.delete(user.uid);
    } else {
      followedUsers.add(user.uid);
    }
    setFollowedUsers(new Set(followedUsers));
    setLoading(false);
  };

  function isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  return (
    <>
      {isLoading && (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: COLORS.primary,
            zIndex: 10,
            position: "absolute",
            bottom: 0,
            top: 0,
            right: 0,
            left: 0,
          }}
        >
          <ActivityIndicator size={79} color={COLORS.secondary} />
        </View>
      )}

      {showPopup && (
        <TouchableWithoutFeedback onPress={handleMuteToggle}>
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10,
              position: "absolute",
              bottom: 0,
              top: 0,
              right: 0,
              left: 0,
            }}
          >
            <View style={tw`p-2 bg-black/50 rounded-full`}>
              <Feather
                name={mute ? "volume-x" : "volume-2"}
                size={30}
                color={"white"}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      )}

      <TouchableWithoutFeedback
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleMuteToggle}
        onLongPress={handleMuteToggleLong}
      >
        <View
          style={tw`absolute bottom-0 left-0 right-0 top-0 justify-end z-2`}
        >
          {!videoStop && (
            <>
              <View style={tw`py-2 px-4 flex gap-2 items-end`}>
                <View style={tw`flex gap-0 items-center`}>
                  <TouchableOpacity onPress={handleProfile}>
                    {user?.photoURL &&
                    isValidUrl(user?.photoURL) &&
                    !imageFailedToLoad ? (
                      <Image
                        source={{ uri: user?.photoURL }}
                        style={{
                          width: 35,
                          height: 35,
                          resizeMode: "contain",
                          marginBottom: 5,
                          borderRadius: 9999,
                          marginBottom: 8,
                        }}
                        onError={() => setImageFailedToLoad(true)}
                      />
                    ) : (
                      <Avatar.Icon
                        size={36}
                        backgroundColor={COLORS.secondary}
                        icon={"account"}
                      />
                    )}
                  </TouchableOpacity>
                </View>
                <View style={tw`flex gap-0 items-center`}>
                  <TouchableOpacity onPress={() => HandleLike(item.id)}>
                    <Image
                      source={
                        isLike
                          ? require("../../../assets/heartfill.png")
                          : require("../../../assets/heart.png")
                      }
                      style={{
                        width: 31,
                        resizeMode: "contain",
                        marginBottom: 5,
                      }}
                    />
                  </TouchableOpacity>
                  <Text style={tw`text-white text-sm font-montserrat`}>
                    {likesCount}
                  </Text>
                </View>
                <View style={tw`flex gap-0 items-center`}>
                  <TouchableOpacity onPress={OpenComments}>
                    <Image
                      source={require("../../../assets/comment.png")}
                      style={{
                        width: 34,
                        resizeMode: "contain",
                        marginBottom: 5,
                      }}
                    />
                  </TouchableOpacity>
                  <Text style={tw`text-white text-sm font-montserrat`}>
                    {item.commentsCount}
                  </Text>
                </View>
                <View style={tw`flex gap-0 items-center`}>
                  <Image
                    source={require("../../../assets/share.png")}
                    style={{
                      width: 34,
                      resizeMode: "contain",
                      marginBottom: 5,
                    }}
                  />
                  <Text style={tw`text-white text-sm font-montserrat`}>
                    Share
                  </Text>
                </View>
              </View>
              <View style={tw`px-4 flex-row justify-start items-center gap-3 `}>
                <Text style={tw`text-white text-lg font-montserrat`}>
                  @{user?.username}
                </Text>
                <TouchableOpacity
                  style={tw`py-1 px-2 rounded-md border border-white flex flex-row items-center gap-1 ${
                    isFollowing ? `bg-transparent text-white` : ""
                  }`}
                  onPress={handleFollow}
                >
                  <Text style={tw`text-white text-base font-montserrat `}>
                    {isFollowing ? "Unfollow" : "Follow"}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={tw`py-2 px-4`}>
                <FlatList
                  key={index}
                  data={item.hashtags}
                  renderItem={renderItem}
                  keyExtractor={(item, index) => item.key || String(index)}
                  horizontal={true} // Set horizontal to true
                />
              </View>
              <View
                style={tw`flex flex-row items-center gap-2 border-t border-b border-[${COLORS.secondary}] pl-4`}
              >
                <Text
                  style={tw`text-sm text-[${COLORS.secondary}] font-montserrat`}
                >
                  News
                </Text>
                <Text
                  style={tw`text-[10px] text-white flex-1 font-montserrat`}
                  numberOfLines={3}
                >
                  {item.description}
                </Text>
                <TouchableOpacity onPress={() => handleOpen(item.newslink)}>
                  <LinearGradient
                    colors={["#53C8D8", "#668AF7"]}
                    style={tw`py-2`}
                  >
                    <View style={tw`w-8 flex justify-center items-center`}>
                      <Feather
                        name={"chevron-right"}
                        size={30}
                        color={"white"}
                      />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          )}
          {isCommentModalVisible && (
            <CommentModel
              isVisible={isCommentModalVisible}
              onClose={closeModal}
              post={item}
            />
          )}
        </View>
      </TouchableWithoutFeedback>
      <View style={tw`flex-1 flex py-12 bg-black`}>
        <Video
          ref={video}
          style={styles.container}
          source={{
            uri: item.media[0],
          }}
          useNativeControls={false}
          resizeMode={ResizeMode.COVER}
          shouldPlay={false}
          isLooping
          usePoster
          onLoadStart={handleLoadStart}
          posterSource={{ uri: item.media[1] }}
          posterStyle={{ resizeMode: "cover", height: "100%" }}
          onReadyForDisplay={handleReadyForDisplay}
        />
      </View>
    </>
  );
});

export default PostSingle;
