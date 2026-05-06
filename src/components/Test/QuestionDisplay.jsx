import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Card, CardMedia, Grid, Fade, LinearProgress } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { THEME_CODE_LABELS } from '../../enums';

const QuestionDisplay = ({ 
  question, 
  onSubmit, 
  currentIndex, 
  total,
  isLoading
}) => {
  const [selectedId, setSelectedId] = useState(null);

  // Reset selection when question changes
  useEffect(() => {
    setSelectedId(null);
  }, [question?.id]);

  if (!question) return null;

  const progress = ((currentIndex) / total) * 100;

  const handleSubmit = () => {
    if (selectedId !== null) {
      onSubmit(selectedId);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      {/* Barre de progression */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" fontWeight="bold" color="primary">
            Progression : {currentIndex + 1} / {total}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Thème : {THEME_CODE_LABELS[question.theme]?.label || question.theme}
          </Typography>
        </Box>
        <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4, bgcolor: '#e2e8f0' }} />
      </Box>
      
      <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
        <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold', lineHeight: 1.4 }}>
          {question.enonce}
        </Typography>

        {question.image && (
          <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 'none', border: '1px solid #f1f5f9' }}>
            <CardMedia
              component="img"
              height="350"
              image={question.image}
              alt="Illustration question"
              sx={{ objectFit: 'contain', bgcolor: '#f8fafc', p: 1 }}
            />
          </Card>
        )}

        <Grid container spacing={2.5}>
          {question.options.map((option) => {
            const isSelected = selectedId === option.id;

            return (
              <Grid item xs={12} md={6} key={option.id}>
                <Button
                  fullWidth
                  variant={isSelected ? "contained" : "outlined"}
                  color="primary"
                  onClick={() => setSelectedId(option.id)}
                  disabled={isLoading}
                  sx={{ 
                    py: 2.5, 
                    px: 3,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }
                  }}
                  startIcon={
                    <Box sx={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      border: '2px solid', 
                      borderColor: 'currentColor',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      mr: 1
                    }}>
                      {String.fromCharCode(65 + question.options.indexOf(option))}
                    </Box>
                  }
                >
                  {option.texte}
                </Button>
              </Grid>
            );
          })}
        </Grid>

        <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSubmit}
            disabled={selectedId === null || isLoading}
            size="large"
            endIcon={<ArrowForward />}
            sx={{ 
              py: 1.5,
              px: 4,
              borderRadius: 3, 
              fontSize: '1.1rem', 
              fontWeight: 'bold',
              boxShadow: selectedId ? '0 4px 14px 0 rgba(0,118,255,0.39)' : 'none'
            }}
          >
            {currentIndex + 1 === total ? "Terminer le test" : "Suivant"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default QuestionDisplay;
