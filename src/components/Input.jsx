import React from 'react'
import { TextInput } from 'react-native'
import tw from 'twrnc'
import { COLORS } from '../constants'

const Input = ({ placeholder, value, setValue, secureTextEntry, keyboardType, autoCapitalize }) => {
  return (
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={setValue}
      style={tw.style(`p-2 px-3 text-gray-50 text-lg border-2 rounded-3xl border-[${COLORS.secondary}] my-3`, { fontFamily: 'Montserrat' })}
      placeholderTextColor={'gray'}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}

    />
  )
}

export default Input