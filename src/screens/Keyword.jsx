import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import Button from '../components/Button';
import { COLORS } from '../constants';
import tw from '../customtwrnc';
import { saveKeyword } from '../redux/actions/user';

// const GradientText = ({ children, selected, onPress }) => {
//   return (
//     <TouchableOpacity onPress={onPress}>
//       <LinearGradient
//         colors={['#53C8D8', '#668AF7']}
//         style={tw`p-1 px-3 rounded-3xl flex items-center ${selected ? 'opacity-20' : ''}`}

//       >
//         <Text style={tw`text-white text-sm font-montserrat`}>{children}</Text>
//       </LinearGradient>
//     </TouchableOpacity>
//   );
// };

export const GradientText = ({ children, selected, onPress }) => {
  return (
    <>
      {
        !selected ? (
          <TouchableOpacity onPress={onPress}>
            <View

              style={tw`p-1 px-2 rounded-2xl flex items-center border border-[${COLORS.secondary}]`}

            >
              <Text style={tw`text-white text-base font-bold text-[${COLORS.secondary}]`}>{children}</Text>
            </View>
          </TouchableOpacity>
        ) :
          (
            <TouchableOpacity onPress={onPress}>
              {/* <LinearGradient
                colors={['#53C8D8', '#668AF7']}
                style={tw`p-1 px-3 rounded-3xl flex items-center `}

              > */}
              <Text style={tw`p-1 px-2 border rounded-2xl items-center flex text-black bg-[${COLORS.keywordColor}]  text-base font-bold`}>{children}</Text>
              {/* </LinearGradient> */}
            </TouchableOpacity>
          )
      }
    </>

  );
};

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
  '#Medicine',
  '#Culture',
  '#Art',
  '#Fashion',
  '#Robotics',
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

const Keyword = () => {
  const [keyword, setKeyword] = useState([]);

  const handleSelect = (k) => {
    setKeyword(prev => {
      if (prev.includes(k)) {
        return prev.filter(ke => ke != k);
      } else {
        if (prev.length < 10) {
          return [...prev, k];
        } else {
          alert('You can only select up to 10 keywords.');
          return prev;
        }
      }
    })
  }
  const navigation = useNavigation();
  const handleNext = async () => {
    if (keyword.length < 5) {
      alert('Please select at least 5 keywords.');
      return;
    }

    const res = await saveKeyword(keyword);
    if (res) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'home' }],
      });
    }
  }
  return (
    <View style={tw`flex-1 bg-[${COLORS.primary}] py-4`}>
      <View style={tw`flex items-center`}>
        <Image source={require('../../assets/fulllogo.png')} style={{ width: 80, height: 80, resizeMode: 'contain', marginBottom: 2 }} />
      </View>
      <View style={tw`flex gap-2 items-center`}>
        <Text style={tw`text-white text-lg text-center font-montserrat`}>
          Choose some of your favorite topics
        </Text>
        <Text style={tw`text-white text-2xl text-center`}>
          <Text style={tw`text-white text-2xl text-center`}>
            ({keyword.length}/10)
          </Text>
        </Text>
      </View>


      <View style={tw`p-4 flex flex-wrap flex-row gap-3`}>
        {
          allKeyword.map((k, index) => (
            <GradientText key={index} onPress={() => handleSelect(k)} selected={keyword.includes(k)}>
              {k}
            </GradientText>
          ))
        }
      </View>

      <View style={tw`p-4 px-8 items-center`}>
        <Button onPress={handleNext}>NEXT</Button>
      </View>
    </View>
  )
}



export default Keyword