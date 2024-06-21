import React from 'react'
import { Image, Text, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { COLORS } from '../constants'
import tw from '../customtwrnc'

const ReelCard = ({ media, description, onPress }) => {
    return (
        <TouchableOpacity onPress={onPress}>
            <View style={tw` w-[40] h-[70]  relative flex justify-end`}>
                <Image
                    style={tw.style({ resizeMode: 'cover' }, ` border rounded-md border-[${COLORS.secondary}] absolute top-0 left-0 right-0 bottom-0`)}
                    source={{ uri: media[1] }}
                />
                <View>
                    <Text numberOfLines={2} style={tw`text-white/80 py-1 bg-black/80 text-xs m-0.4`}>
                        {description}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}

export default ReelCard