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
  MenuItem
} from '@mui/material';
import { ThemeCode, THEME_CODE_LABELS } from '../../enums';

const TestForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData || {
      titre: '',
      theme: ThemeCode.Signalisation,
      dureeMinutes: 40,
      nombreQuestions: 40,
      seuilReussite: 80
    }
  });

  return (
    <Paper elevation={0} sx={{ p: 1 }}>
      <Typography variant="h6" gutterBottom>
        {initialData ? "Modifier le Test" : "Créer un nouveau Test"}
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <TextField
            label="Titre du Test"
            fullWidth
            {...register('titre', { required: 'Le titre est requis' })}
            error={!!errors.titre}
            helperText={errors.titre?.message}
          />

          <TextField
            select
            label="Thème"
            fullWidth
            {...register('theme', { required: 'Le thème est requis', valueAsNumber: true })}
            defaultValue={initialData?.theme ?? ThemeCode.Signalisation}
          >
            {Object.entries(ThemeCode).map(([name, id]) => (
              <MenuItem key={id} value={id}>
                {THEME_CODE_LABELS[id]?.label || name}
              </MenuItem>
            ))}
          </TextField>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Durée (min)"
                type="number"
                fullWidth
                {...register('dureeMinutes', { 
                  required: 'Requis',
                  min: { value: 10, message: 'Min 10' },
                  max: { value: 120, message: 'Max 120' }
                })}
                error={!!errors.dureeMinutes}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Questions"
                type="number"
                fullWidth
                {...register('nombreQuestions', { 
                  required: 'Requis',
                  min: { value: 1, message: 'Min 1' },
                  max: { value: 100, message: 'Max 100' }
                })}
                error={!!errors.nombreQuestions}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Réussite (%)"
                type="number"
                fullWidth
                {...register('seuilReussite', { 
                  required: 'Requis',
                  min: { value: 50, message: 'Min 50' },
                  max: { value: 100, message: 'Max 100' }
                })}
                error={!!errors.seuilReussite}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button variant="outlined" onClick={onCancel}>Annuler</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
              sx={{ minWidth: 120 }}
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
