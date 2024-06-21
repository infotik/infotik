import { Feather } from '@expo/vector-icons'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import { useNavigation } from '@react-navigation/native'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Image, ScrollView, Text, TextInput, View } from 'react-native'
import { Avatar } from 'react-native-paper'
import { useDispatch } from 'react-redux'
import ReelCard from '../components/ReelCard'
import { COLORS } from '../constants'
import tw from '../customtwrnc'
import { getPostByKeywords, getUserByQuery } from '../redux/actions/user'
import { GradientText } from './Keyword'

const allKeyword = [
    '#News',
    '#Politics',
    '#Science',
    '#Technology',
    '#Health',
    '#Environment',
    '#Education',
    '#History',
    '#Sports',
    '#AI',
    '#Business',
    '#Finance',
    '#Travel',
    '#Culture',
    '#Art',
    '#Fashion',
    '#Food',
    '#Cooking',
    '#DIY',
    '#Fitness',
    '#Wellness',
    '#Nature',
    '#Space',
    '#Philosophy',
    '#Psychology',
    '#Sustainability'
]

const Discover = () => {
    const [loading, setLoading] = useState(false);
    const [all, setAll] = useState(false);
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState([])
    const ref = useRef();
    const navigation = useNavigation();
    const [posts, setPosts] = useState([])
    const [selectedKeyword, setSelectedKeyword] = useState(0);


    useEffect(() => {
        if (query) {
            ref.current = setTimeout(async () => {
                setLoading(true)
                console.log('searching...')
                const res = await getUserByQuery(query);
                setLoading(false)
                setUsers(res);
            }, 1000)

            return () => {
                clearTimeout(ref.current);
            }
        }
    }, [query])


    const handleProfile = (uid) => {
        navigation.navigate('profile', { uid })
    }

    const dispatch = useDispatch()



    useEffect(() => {
        (async function () {

            const res = await getPostByKeywords(allKeyword[selectedKeyword]);
            setPosts(res);
        })()
    }, [selectedKeyword]);


    const handleReelsPress = (data) => {
        let copy = JSON.parse(JSON.stringify(posts));
        copy = copy.filter(post => post.id != data.id)
        copy.splice(0, 0, data);
        navigation.navigate('userPosts', { posts: copy, profile: true })
    }

    return (
        <View style={tw`flex-1 bg-[${COLORS.primary}] py-2 px-4`}>
            <Text style={tw`text-white text-center text-xl`}>Discover</Text>
            <View style={tw`flex flex-row items-center gap-2 p-2 bg-black rounded-md mt-4`}>
                <Feather name="search" size={24} color={'white'} />
                <TextInput
                    placeholder='Search'
                    placeholderTextColor={'#86878B'}
                    style={tw`text-sm text-white font-montserrat w-full`}
                    onChangeText={setQuery}
                    autoCapitalize='none'
                />
            </View>
            {
                query
                    ? (
                        <View>
                            {
                                loading &&
                                <View style={tw`flex-1 flex justify-center items-center`}>
                                    <ActivityIndicator size={79} color={COLORS.secondary} />
                                </View>
                            }
                            <ScrollView>
                                {
                                    users.map((user) => (
                                        <TouchableOpacity key={user.uid} onPress={() => handleProfile(user.uid)}>
                                            <View style={tw`my-1 p-2 bg-black rounded-md flex flex-row gap-2 items-center`}>
                                                {
                                                    user?.photoURL ?
                                                        <Image
                                                            style={{ height: 60, width: 60, borderRadius: 999999, objectFit: 'contain' }}
                                                            source={{ uri: user?.photoURL }}
                                                        />
                                                        : <Avatar.Icon size={60} backgroundColor={COLORS.secondary} icon={"account"} />
                                                }
                                                <View>
                                                    <Text style={tw`text-white font-montserrat mb-1`}>{user.username}</Text>
                                                    <Text style={tw`text-white/70 font-montserrat`}>{user.displayName}</Text>

                                                </View>

                                            </View>
                                        </TouchableOpacity>
                                    ))
                                }
                            </ScrollView>
                        </View>
                    )
                    : (
                        <ScrollView>
                            <View>
                                <View style={tw`flex justify-center flex-row gap-5 p-5`}>
                                    {
                                        posts?.slice(0, 2).map((data, index) => (<ReelCard key={index} {...data} onPress={() => handleReelsPress(data)} />))
                                    }
                                </View>

                                <View>
                                    <View style={tw`p-4 flex flex-wrap justify-center flex-row gap-3`}>
                                        {
                                            all ?
                                                (allKeyword.map((k, i) => (
                                                    <GradientText key={k} onPress={() => setSelectedKeyword(i)} selected={allKeyword[selectedKeyword] == k}>
                                                        {k}
                                                    </GradientText>
                                                )))
                                                : (
                                                    allKeyword.slice(0, 7).map((k, i) => (
                                                        <GradientText key={k} onPress={() => setSelectedKeyword(i)} selected={allKeyword[selectedKeyword] == k}>
                                                            {k}
                                                        </GradientText>
                                                    ))
                                                )

                                        }


                                    </View>
                                    <TouchableOpacity onPress={() => setAll(!all)}>
                                        <Text style={tw`text-white underline text-center`}>{all ? "Less" : "More"}</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={tw`flex flex-row items-center justify-center flex-wrap gap-5 pt-5`}>
                                    {
                                        posts?.slice(2).map((data, index) => (
                                            <ReelCard {...data} onPress={() => handleReelsPress(data)} />
                                        ))
                                    }
                                </View>

                            </View>
                        </ScrollView>
                    )
            }
        </View>
    )
}

export default Discover