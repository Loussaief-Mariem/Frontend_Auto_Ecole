import React from 'react';
import { useForm } from 'react-hook-form';
import { 
  Box, 
  Button, 
  TextField, 
  Stack, 
  Typography, 
  Paper,
  Grid,
  MenuItem,
  useTheme,
  alpha
} from '@mui/material';
import { ThemeCode, THEME_CODE_LABELS } from '../../enums';

const TestForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const theme = useTheme();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData || {
      titre: '',
      theme: ThemeCode.Signalisation,
      nombreQuestions: 40,
      seuilReussite: 80
    }
  });

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        borderRadius: 4, 
        border: '1px solid', 
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}
    >
      <Typography variant="h6" fontWeight={800} color="primary.main" gutterBottom sx={{ mb: 3 }}>
        {initialData ? "Modifier le Test Blanc" : "Créer une nouvelle série d'entraînement"}
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <TextField
            label="Titre de la Série"
            fullWidth
            {...register('titre', { required: 'Le titre est requis' })}
            error={!!errors.titre}
            helperText={errors.titre?.message}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />

          <TextField
            select
            label="Thème principal"
            fullWidth
            {...register('theme', { required: 'Le thème est requis', valueAsNumber: true })}
            defaultValue={initialData?.theme ?? ThemeCode.Signalisation}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          >
            {Object.entries(ThemeCode).map(([name, id]) => (
              <MenuItem key={id} value={id} sx={{ fontWeight: 600 }}>
                {THEME_CODE_LABELS[id]?.label || name}
              </MenuItem>
            ))}
          </TextField>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nombre total de questions"
                type="number"
                fullWidth
                {...register('nombreQuestions', { 
                  required: 'Requis',
                  min: { value: 1, message: 'Min 1' },
                  max: { value: 100, message: 'Max 100' }
                })}
                error={!!errors.nombreQuestions}
                helperText={errors.nombreQuestions?.message}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Seuil de réussite (%)"
                type="number"
                fullWidth
                {...register('seuilReussite', { 
                  required: 'Requis',
                  min: { value: 50, message: 'Min 50' },
                  max: { value: 100, message: 'Max 100' }
                })}
                error={!!errors.seuilReussite}
                helperText={errors.seuilReussite?.message}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button 
              variant="outlined" 
              onClick={onCancel}
              sx={{ borderRadius: 3, px: 3, fontWeight: 700, textTransform: 'none' }}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
              sx={{ 
                borderRadius: 3, 
                px: 4, 
                fontWeight: 700, 
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { boxShadow: 'none' }
              }}
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </Box>
        </Stack>
      </form>
    </Paper>
  );
};

export default TestForm;
