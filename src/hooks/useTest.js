import { useState, useCallback, useEffect } from "react";
import testService from "../api/testService";

export const useTest = (testId, contratId) => {
  const [testCandidateId, setTestCandidateId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [timeLeft, setTimeLeft] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState(null);

  // ✅ FIN DU TEST
  const finishTest = useCallback(async () => {
    if (!testCandidateId || isFinished) return;

    console.log("🏁 Fin du test détectée. ID Session:", testCandidateId);
    setLoading(true);
    try {
      const response = await testService.terminerTest(testCandidateId);
      console.log("✅ Réponse terminerTest:", response);
      if (response.success) {
        setResult(response.data);
        setIsFinished(true);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error("❌ Erreur finishTest:", err);
      setError("Erreur lors de la clôture du test");
    } finally {
      setLoading(false);
    }
  }, [testCandidateId, isFinished]);

  // ✅ TIMER SIMPLE ET FIABLE
  useEffect(() => {
    if (timeLeft === null || isFinished) return;

    if (timeLeft <= 0) {
      finishTest();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isFinished, finishTest]);

  // ✅ START TEST (CORRIGÉ)
  const startTest = useCallback(async () => {
    if (loading) return;

    console.log("🚀 Lancement de startTest...");
    setLoading(true);
    setError(null);

    try {
      const sessionResponse = await testService.demarrerTest(contratId, testId);

      if (sessionResponse && sessionResponse.success) {
        const sessionData = sessionResponse.data;

        setTestCandidateId(sessionData.testCandidateId);

        // ✅ 🔥 TIMER FIX (SANS dateDebut)
        const totalMinutes = sessionData.dureeMinutes || 12;
        const totalSeconds = totalMinutes * 60;

        console.log("⏱️ Timer initialisé à :", totalSeconds, "secondes");

        setTimeLeft(totalSeconds);

        // ✅ CHARGEMENT QUESTIONS
        const questionsResponse = await testService.getQuestionsByTest(
          sessionData.testBlancId,
        );

        if (questionsResponse && questionsResponse.success) {
          setQuestions(questionsResponse.data);

          const resumeIndex = sessionData.questionsRepondues || 0;
          setCurrentIndex(
            resumeIndex < questionsResponse.data.length ? resumeIndex : 0,
          );
        } else {
          setError("Impossible de charger les questions");
        }

        setIsFinished(false);
        setResult(null);
      } else {
        setError(sessionResponse?.message || "Erreur de démarrage");
      }
    } catch (err) {
      console.error("🔥 Erreur startTest:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors du démarrage",
      );
    } finally {
      setLoading(false);
    }
  }, [contratId, testId]);

  // ✅ RÉPONSE QUESTION
  const submitAnswer = async (optionId) => {
    if (loading || isFinished) return;

    setLoading(true);
    try {
      const currentQuestion = questions[currentIndex];

      const response = await testService.repondreQuestion(
        testCandidateId,
        currentQuestion.id,
        optionId,
      );

      if (response.success) {
        // Passer à la question suivante ou terminer
        if (currentIndex + 1 < questions.length) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          await finishTest();
        }
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Erreur validation réponse");
    } finally {
      setLoading(false);
    }
  };

  return {
    currentQuestion: questions[currentIndex],
    currentIndex,
    totalQuestions: questions.length,
    loading,
    error,
    startTest,
    submitAnswer,
    isFinished,
    result,
    timeLeft,
  };
};
