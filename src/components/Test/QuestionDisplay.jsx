import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Card, 
  CardMedia, 
  Grid, 
  LinearProgress,
  useTheme,
  alpha
} from '@mui/material';
import { ArrowForward, ArrowBack, Check } from '@mui/icons-material';
import { THEME_CODE_LABELS } from '../../enums';

const QuestionDisplay = ({ 
  question, 
  currentIndex, 
  total, 
  onSubmit, 
  isLoading,
  previouslyAnsweredOptionId,
  onPrevious,
  onNext
}) => {
  const theme = useTheme();
  const [selectedId, setSelectedId] = useState(null);

  // Reset selection when question changes
  useEffect(() => {
    setSelectedId(previouslyAnsweredOptionId || null);
  }, [question?.id, previouslyAnsweredOptionId]);

  const getImageUrl = (path) => {
    if (!path) return '';
    const baseUrl = import.meta.env.VITE_API_URL || 'https://localhost:7057/api';
    const baseHost = baseUrl.replace('/api', '');

    if (path.startsWith('http://') || path.startsWith('https://')) {
      if (path.includes('https://localhost:7057')) {
        return path.replace('https://localhost:7057', baseHost);
      }
      return path;
    }
    return path.startsWith('/') ? `${baseHost}${path}` : `${baseHost}/${path}`;
  };

  if (!question) return null;

  const progress = ((currentIndex) / total) * 100;

  const handleSubmit = () => {
    if (selectedId !== null) {
      onSubmit(selectedId);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, md: 0 } }}>
      {/* Barre de progression */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="body2" fontWeight={800} color="primary.main">
            Question {currentIndex + 1} sur {total}
          </Typography>
          
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ 
            height: 8, 
            borderRadius: 4, 
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            '& .MuiLinearProgress-bar': { borderRadius: 4 }
          }} 
        />
      </Box>
      
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 3, md: 5 }, 
          borderRadius: 5, 
          border: '1px solid', 
          borderColor: 'divider', 
          bgcolor: 'background.paper',
          boxShadow: '0 8px 32px rgba(0,0,0,0.02)'
        }}
      >
        <Typography variant="h5" sx={{ mb: 4, fontWeight: 850, lineHeight: 1.4, color: 'text.primary' }}>
          {question.enonce}
        </Typography>

        {question.image && (
          <Card 
            elevation={0} 
            sx={{ 
              mb: 4, 
              borderRadius: 4, 
              border: '1px solid', 
              borderColor: 'divider',
              overflow: 'hidden'
            }}
          >
            <CardMedia
              component="img"
              height="350"
              image={getImageUrl(question.image)}
              alt="Illustration question"
              sx={{ objectFit: 'contain', bgcolor: '#f8fafc', p: 1.5 }}
            />
          </Card>
        )}

        <Grid container spacing={2.5}>
          {question.options.map((option, idx) => {
            const isSelected = selectedId === option.id;

            return (
              <Grid item xs={12} md={6} key={option.id}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setSelectedId(option.id)}
                  disabled={isLoading}
                  sx={{ 
                    py: 2.5, 
                    px: 3,
                    borderRadius: 4,
                    textTransform: 'none',
                    fontSize: '1.05rem',
                    fontWeight: isSelected ? 800 : 600,
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    color: isSelected ? 'primary.main' : 'text.primary',
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.04) : 'background.paper',
                    borderWidth: isSelected ? '2px' : '1px',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      borderColor: 'primary.main',
                      bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.06) : alpha(theme.palette.primary.main, 0.01),
                      boxShadow: '0 6px 20px rgba(0,0,0,0.03)',
                      borderWidth: isSelected ? '2px' : '1px',
                    }
                  }}
                  startIcon={
                    <Box sx={{ 
                      width: 28, 
                      height: 28, 
                      borderRadius: '50%', 
                      border: '2px solid', 
                      borderColor: isSelected ? 'primary.main' : 'text.secondary',
                      bgcolor: isSelected ? 'primary.main' : 'transparent',
                      color: isSelected ? 'white' : 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      mr: 1,
                      transition: 'all 0.2s ease'
                    }}>
                      {isSelected ? <Check sx={{ fontSize: 16 }} /> : String.fromCharCode(65 + idx)}
                    </Box>
                  }
                >
                  {option.texte}
                </Button>
              </Grid>
            );
          })}
        </Grid>

        <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={onPrevious}
            disabled={currentIndex === 0 || isLoading}
            size="large"
            startIcon={<ArrowBack />}
            sx={{ 
              py: 1.8,
              px: 4.5,
              borderRadius: 4, 
              fontSize: '1.05rem', 
              fontWeight: 800,
              textTransform: 'none',
              borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.02)
              }
            }}
          >
            Précédent
          </Button>

          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSubmit}
            disabled={selectedId === null || isLoading}
            size="large"
            endIcon={<ArrowForward />}
            sx={{ 
              py: 1.8,
              px: 4.5,
              borderRadius: 4, 
              fontSize: '1.05rem', 
              fontWeight: 800,
              textTransform: 'none',
              boxShadow: selectedId ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.35)}` : 'none',
              '&:hover': {
                boxShadow: selectedId ? `0 12px 30px ${alpha(theme.palette.primary.main, 0.45)}` : 'none',
              }
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
