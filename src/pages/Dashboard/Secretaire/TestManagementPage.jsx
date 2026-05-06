import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  DialogActions,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip
} from '@mui/material';
import { Add, Close, ArrowBack, Delete, Edit } from '@mui/icons-material';
import testService from '../../../api/testService';
import TestList from '../../../components/Test/TestList';
import TestForm from '../../../components/Test/TestForm';
import QuestionForm from '../../../components/Test/QuestionForm';

const TestManagementPage = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Modals state
  const [testModal, setTestModal] = useState({ open: false, data: null });
  const [questionModal, setQuestionModal] = useState({ open: false, data: null, testId: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, type: 'test' });
  
  // Detail view state (when managing questions for a specific test)
  const [selectedTest, setSelectedTest] = useState(null);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const data = await testService.getAllTests();
      setTests(data.data);
    } catch (err) {
      setError("Erreur lors du chargement des tests");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateTest = async (formData) => {
    setLoading(true);
    try {
      if (testModal.data) {
        await testService.updateTest(testModal.data.id, formData);
        showSnackbar("Test mis à jour avec succès");
      } else {
        await testService.createTest(formData);
        showSnackbar("Test créé avec succès");
      }
      setTestModal({ open: false, data: null });
      fetchTests();
    } catch (err) {
      showSnackbar("Erreur lors de l'enregistrement", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async () => {
    setLoading(true);
    try {
      await testService.deleteTest(deleteDialog.id);
      showSnackbar("Test supprimé");
      setDeleteDialog({ open: false, id: null });
      fetchTests();
    } catch (err) {
      showSnackbar("Erreur lors de la suppression", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleManageQuestions = async (test) => {
    setSelectedTest(test);
    setLoading(true);
    try {
      const data = await testService.getQuestionsByTest(test.id);
      setQuestions(data.data);
    } catch (err) {
      showSnackbar("Erreur lors du chargement des questions", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateQuestion = async (formData) => {
    setLoading(true);
    try {
      const payload = { ...formData };

      if (questionModal.data) {
        await testService.updateQuestion(questionModal.data.id, payload);
        showSnackbar("Question mise à jour");
      } else {
        await testService.createQuestion(selectedTest.id, payload);
        showSnackbar("Question ajoutée");
      }
      setQuestionModal({ open: false, data: null });
      handleManageQuestions(selectedTest); // Refresh list
    } catch (err) {
      showSnackbar("Erreur lors de l'enregistrement de la question", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (qId) => {
    setLoading(true);
    try {
      await testService.deleteQuestion(qId);
      showSnackbar("Question supprimée");
      handleManageQuestions(selectedTest);
    } catch (err) {
      showSnackbar("Erreur lors de la suppression", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  if (selectedTest) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => setSelectedTest(null)}><ArrowBack /></IconButton>
          <Typography variant="h4">Gestion des Questions - Test #{selectedTest.id}</Typography>
        </Box>

        <Card sx={{ mb: 4, bgcolor: '#f0f7ff', borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1"><b>Détails :</b> {selectedTest.nombreQuestions} questions attendues | Thème : {selectedTest.themeName}</Typography>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">Questions actuelles ({questions.length})</Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={() => setQuestionModal({ open: true, data: null })}
            disabled={questions.length >= selectedTest.nombreQuestions}
          >
            Ajouter une question
          </Button>
        </Box>

        {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />}

        <Grid container spacing={2}>
          {questions.map((q, idx) => (
            <Grid item xs={12} key={q.id}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body1" sx={{ mt: 1 }}><b>Q{idx + 1}:</b> {q.enonce}</Typography>
                    </Box>
                    <Box>
                      <IconButton color="info" onClick={() => setQuestionModal({ open: true, data: q })}><Edit /></IconButton>
                      <IconButton color="error" onClick={() => handleDeleteQuestion(q.id)}><Delete /></IconButton>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {q.options.map(opt => (
                      <Alert 
                        key={opt.id} 
                        icon={false} 
                        severity={opt.estCorrect ? "success" : "info"}
                        sx={{ py: 0, px: 1, '& .MuiAlert-message': { p: 0.5 } }}
                      >
                        {opt.texte}
                      </Alert>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Question Modal */}
        <Dialog open={questionModal.open} onClose={() => setQuestionModal({ open: false })} maxWidth="md" fullWidth>
          <DialogTitle>
            {questionModal.data ? "Modifier la question" : "Ajouter une question"}
            <IconButton onClick={() => setQuestionModal({ open: false })} sx={{ position: 'absolute', right: 8, top: 8 }}><Close /></IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <QuestionForm 
              initialData={questionModal.data} 
              onSubmit={handleCreateOrUpdateQuestion} 
              onCancel={() => setQuestionModal({ open: false })}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">Gestion des Tests Blancs</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          size="large"
          onClick={() => setTestModal({ open: true, data: null })}
          sx={{ borderRadius: 2 }}
        >
          Nouveau Test
        </Button>
      </Box>

      {loading && !tests.length ? (
        <Box sx={{ textAlign: 'center', py: 10 }}><CircularProgress /></Box>
      ) : (
        <TestList 
          tests={tests} 
          onEdit={(t) => setTestModal({ open: true, data: t })}
          onDelete={(id) => setDeleteDialog({ open: true, id, type: 'test' })}
          onManageQuestions={handleManageQuestions}
        />
      )}

      {/* Test Modal */}
      <Dialog open={testModal.open} onClose={() => setTestModal({ open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>
          {testModal.data ? "Paramètres du Test" : "Nouveau Test Blanc"}
          <IconButton onClick={() => setTestModal({ open: false })} sx={{ position: 'absolute', right: 8, top: 8 }}><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TestForm 
            initialData={testModal.data} 
            onSubmit={handleCreateOrUpdateTest} 
            onCancel={() => setTestModal({ open: false })}
            loading={loading}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false })}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          Voulez-vous vraiment supprimer ce test ? Cette action est irréversible et supprimera toutes les questions associées.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false })}>Annuler</Button>
          <Button onClick={handleDeleteTest} color="error" variant="contained">Supprimer</Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default TestManagementPage;
