import EspressoGraph from "@/components/Graph";
import { useState } from "react";
import { View, Button, StyleSheet, Dimensions } from "react-native";



export default function Graph(){
  const [isStarted, setIsStarted] = useState(false);
  console.log(isStarted)
  return (
    <View>
      <EspressoGraph isStarted={isStarted} />
      <View style={styles.buttonContainer}>
      <Button 
        title={isStarted ? "Stop" : "Start"} 
        onPress={() => setIsStarted(!isStarted)} 
      />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    top: 90,
    right: 150,
    transform: [{rotate: "90deg"}]
  }
})