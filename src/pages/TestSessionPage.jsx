import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Container,
  Button,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Alert,
} from "@mui/material";
import { ArrowBack, ExitToApp } from "@mui/icons-material";
import { useTest } from "../hooks/useTest";
import QuestionDisplay from "../components/Test/QuestionDisplay";
import TestResult from "../components/Test/TestResult";
import { useAuth } from "../context/AuthContext";
const TestSessionPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const contratId = user.user.contratId;
//  console.log("contrat id ", contratId);
 // console.log("test id", testId);
  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    loading,
    error,
    startTest,
    submitAnswer,
    isFinished,
    result,
    userAnswers,
    goPrevious,
    goNext,
  } = useTest(testId, contratId);

  useEffect(() => {
    startTest();
  }, [startTest]);

  if (loading && !currentQuestion && !isFinished) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          gap: 2,
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="textSecondary">
          Chargement du test...
        </Typography>
      </Box>
    );
  }

  if (error && !currentQuestion) {
    return (
      <Container sx={{ py: 10, textAlign: "center" }}>
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Retour
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh" }}>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: "1px solid #e2e8f0" }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate(-1)}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            {isFinished ? "Résultats" : `Session de Test Blanc`}
          </Typography>
          {!isFinished && (
            <Button
              color="error"
              variant="outlined"
              startIcon={<ExitToApp />}
              onClick={() => {
                if (
                  window.confirm(
                    "Voulez-vous vraiment quitter ? Votre progression sera perdue.",
                  )
                ) {
                  navigate(-1);
                }
              }}
              sx={{ borderRadius: 2 }}
            >
              Quitter
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        {!isFinished ? (
          <QuestionDisplay
            question={currentQuestion}
            currentIndex={currentIndex}
            total={totalQuestions}
            onSubmit={submitAnswer}
            isLoading={loading}
            previouslyAnsweredOptionId={currentQuestion ? (userAnswers[currentQuestion.id] || userAnswers[String(currentQuestion.id)]) : null}
            onPrevious={goPrevious}
            onNext={goNext}
          />
        ) : (
          <Box>
            <TestResult result={result} />
            <Box
              sx={{ display: "flex", justifyContent: "center", mt: 6, gap: 2 }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => startTest()}
                sx={{ borderRadius: 3, px: 4 }}
              >
                Refaire le test
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate("/dashboard/candidat/tests")}
                sx={{ borderRadius: 3, px: 4 }}
              >
                Mes tests
              </Button>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default TestSessionPage;
