import { View, Text, TextInput, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { TouchableOpacity } from 'react-native';
import { icons } from '../constants';
import { router, usePathname } from 'expo-router';

const SearchInput = ({initialQuery}) => {

    const pathname = usePathname();
    const [query, setQuery] = useState(initialQuery || '');

  return (
    
      <View className="w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 focus:border-secondary  mb-3
      items-center flex-row space-x-4 ">
            <TextInput
            className="text-base mt-0.5 text-white flex-1 font-pregular"
            placeholder="Seacrh for a video topic"
            value={query}
            placeholderTextColor={"#CDCDE0"}
            onChangeText={(e) => (setQuery(e))}
            />
            
            <TouchableOpacity
            onPress={() => {
                if(!query){
                    Alert.alert("Please enter a search query")
                }

                if(pathname.startsWith('/search')){
                    router.setParams({query});
                }
                else{
                    router.push(`/search/${query}`)
                }
            }}>
                <Image
                source={icons.search}
                className="h-5 w-5" 
                resizeMode='contain'/>
            </TouchableOpacity>
      </View>
    
  )
}

export default SearchInput;