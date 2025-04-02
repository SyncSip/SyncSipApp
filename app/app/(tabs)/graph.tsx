import React, { useState } from "react";
import { View, Button, StyleSheet, Text, SafeAreaView } from "react-native";
import EspressoGraph from "@/components/Graph";

export default function Graph() {
  const [isStarted, setIsStarted] = useState(false);
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        <EspressoGraph isStarted={isStarted} />

        
        <View style={styles.buttonContainer}>
          <Button 
            title={isStarted ? "Stop Recording" : "Start Recording"} 
            onPress={() => {
              console.log("Button pressed, changing isStarted to:", !isStarted);
              setIsStarted(!isStarted);
            }} 
            color={isStarted ? "#cc0000" : "#007700"}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  buttonContainer: {
    marginTop: 20,
    paddingHorizontal: 40,
  }
});
