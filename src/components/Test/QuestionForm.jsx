import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { 
  Box, 
  Button, 
  TextField, 
  Stack, 
  Typography, 
  IconButton,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  Paper,
  Divider,
  Alert
} from '@mui/material';
import { Delete, Add, CloudUpload } from '@mui/icons-material';

import { ThemeCode, THEME_CODE_LABELS } from '../../enums';

const QuestionForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: initialData || {
      enonce: '',
      explication: '',
      image: '',
      options: [
        { texte: '', estCorrect: true },
        { texte: '', estCorrect: false }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options"
  });

  const watchOptions = watch("options");

  const handleCorrectChange = (index) => {
    const updatedOptions = watchOptions.map((opt, i) => ({
      ...opt,
      estCorrect: i === index
    }));
    setValue("options", updatedOptions);
  };

  return (
    <Box sx={{ p: 1 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <TextField
            label="Énoncé de la question"
            multiline
            rows={2}
            fullWidth
            {...register('enonce', { required: 'L\'énoncé est requis' })}
            error={!!errors.enonce}
            helperText={errors.enonce?.message}
          />

          <TextField
            label="URL de l'image (optionnel)"
            fullWidth
            {...register('image')}
            placeholder="https://example.com/image.jpg"
          />

          {watch('image') && (
            <Box sx={{ mt: 1, textAlign: 'center' }}>
              <Typography variant="caption" display="block" gutterBottom>Prévisualisation de l'image :</Typography>
              <img 
                src={watch('image')} 
                alt="Prévisualisation" 
                style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, border: '1px solid #ddd' }} 
                onError={(e) => e.target.style.display = 'none'}
              />
            </Box>
          )}

          <TextField
            label="Explication (affichée après réponse)"
            multiline
            rows={2}
            fullWidth
            {...register('explication')}
          />

          <Divider>Options (2 à 4)</Divider>

          {fields.map((field, index) => (
            <Box key={field.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Radio
                checked={watchOptions[index]?.estCorrect}
                onChange={() => handleCorrectChange(index)}
                color="success"
              />
              <TextField
                label={`Option ${index + 1}`}
                fullWidth
                {...register(`options.${index}.texte`, { required: 'Le texte est requis' })}
                error={!!errors.options?.[index]?.texte}
              />
              {fields.length > 2 && (
                <IconButton onClick={() => remove(index)} color="error">
                  <Delete />
                </IconButton>
              )}
            </Box>
          ))}

          {fields.length < 4 && (
            <Button 
              startIcon={<Add />} 
              onClick={() => append({ texte: '', estCorrect: false })}
              sx={{ alignSelf: 'flex-start' }}
            >
              Ajouter une option
            </Button>
          )}

          {errors.options && (
            <Alert severity="error">Veuillez vérifier les options</Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
            <Button variant="outlined" onClick={onCancel}>Annuler</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              {loading ? "Chargement..." : initialData ? "Modifier" : "Créer la question"}
            </Button>
          </Box>
        </Stack>
      </form>
    </Box>
  );
};

export default QuestionForm;
