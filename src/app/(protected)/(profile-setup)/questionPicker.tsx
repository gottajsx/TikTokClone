import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';

type Question = {
  id: string;
  video_text: string;
};

const QUESTIONS: Question[] = [
  { id: "1", video_text: "Quelle est ta plus grande peur ?" },
  { id: "2", video_text: "Quel est ton plus beau souvenir ?" },
  { id: "3", video_text: "Si tu pouvais voyager n'importe où, où irais-tu ?" },
  { id: "4", video_text: "Quel est ton rêve ultime ?" },
  { id: "5", video_text: "Quelle est ta plus grande réussite ?" },
  { id: "6", video_text: "Si tu pouvais rencontrer une personne célèbre, qui serait-ce ?" },
  { id: "7", video_text: "Quel est ton film préféré ?" },
  { id: "8", video_text: "Qu'est-ce qui te rend vraiment heureux ?" }
];

export default function QuestionPicker() {
  const router = useRouter();
  const [remainingQuestions, setRemainingQuestions] = useState<Question[]>([...QUESTIONS]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  useEffect(() => {
    pickRandomQuestion();
  }, []);

  const pickRandomQuestion = () => {
    if (remainingQuestions.length === 0) {
      Alert.alert(
        "Questions épuisées",
        "Toutes les questions ont été posées. On recommence !"
      );
      setRemainingQuestions([...QUESTIONS]);
      return;
    }
    const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
    const question = remainingQuestions[randomIndex];
    setCurrentQuestion(question);
    const updated = remainingQuestions.filter((_, index) => index !== randomIndex);
    setRemainingQuestions(updated);
  };

  const handleAnswer = () => {
    if (!currentQuestion) return;
    router.replace({
      pathname: '/(protected)/(tabs)/uploadVideo',
      params: {
        videoText: currentQuestion.video_text,
        questionId: currentQuestion.id,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.questionText}>
          {currentQuestion?.video_text || "Chargement..."}
        </Text>
      </View>
      <TouchableOpacity style={styles.answerButton} onPress={handleAnswer}>
        <Text style={styles.buttonText}>Répondre à la question</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.nextButton} onPress={pickRandomQuestion}>
        <Text style={styles.buttonText}>Nouvelle Question</Text>
      </TouchableOpacity>
      {remainingQuestions.length === 0 && (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>⚠️ Toutes les questions ont été épuisées !</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#0a0a0a',
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 40,
    width: '100%',
    shadowColor: '#ffffff',
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  questionText: {
    fontSize: 22,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
  },
  answerButton: {
    width: '100%',
    backgroundColor: '#16a34a',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#22c55e',
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  nextButton: {
    width: '100%',
    backgroundColor: '#1d4ed8',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#3b82f6',
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  warningBox: {
    marginTop: 20,
    padding: 15,
  },
  warningText: {
    color: '#facc15',
    fontSize: 14,
  },
});