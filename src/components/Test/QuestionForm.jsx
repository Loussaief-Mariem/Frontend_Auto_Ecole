import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { 
  Box, 
  Button, 
  TextField, 
  Stack, 
  Typography, 
  IconButton,
  Radio,
  Paper,
  Divider,
  Alert,
  alpha,
  useTheme,
  Card,
  CircularProgress
} from '@mui/material';
import { Delete, Add, InfoOutlined, ImageOutlined, HelpOutline, CloudUpload } from '@mui/icons-material';
import testService from '../../api/testService';

const QuestionForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const theme = useTheme();
  const [uploadingImage, setUploadingImage] = useState(false);

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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await testService.uploadQuestionImage(file);
      if (res.success && res.data?.imagePath) {
        setValue('image', res.data.imagePath);
      } else if (res.imagePath) {
        setValue('image', res.imagePath);
      }
    } catch (err) {
      console.error("Erreur lors du téléversement de l'image :", err);
    } finally {
      setUploadingImage(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const baseUrl = import.meta.env.VITE_API_URL || 'https://localhost:7057/api';
    const baseHost = baseUrl.replace('/api', '');
    return path.startsWith('/') ? `${baseHost}${path}` : `${baseHost}/${path}`;
  };

  return (
    <Box sx={{ p: 1 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <TextField
            label="Énoncé de la question"
            multiline
            rows={3}
            fullWidth
            {...register('enonce', { required: 'L\'énoncé est requis' })}
            error={!!errors.enonce}
            helperText={errors.enonce?.message}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            InputProps={{
              startAdornment: (
                <HelpOutline color="action" sx={{ mr: 1, alignSelf: 'flex-start', mt: 1 }} />
              )
            }}
          />

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="URL de l'image (optionnel)"
              fullWidth
              {...register('image')}
              placeholder="Chemin ou URL de l'image..."
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              InputProps={{
                startAdornment: (
                  <ImageOutlined color="action" sx={{ mr: 1 }} />
                )
              }}
            />
            <Button
              variant="outlined"
              component="label"
              disabled={uploadingImage}
              startIcon={uploadingImage ? <CircularProgress size={20} color="inherit" /> : <CloudUpload />}
              sx={{ 
                borderRadius: 3, 
                px: 3, 
                py: 1.8, 
                fontWeight: 700, 
                textTransform: 'none',
                whiteSpace: 'nowrap',
                height: 56
              }}
            >
              {uploadingImage ? "Envoi..." : "Importer"}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>
          </Box>

          {watch('image') && (
            <Card 
              variant="outlined" 
              sx={{ 
                p: 2, 
                borderRadius: 3, 
                textAlign: 'center', 
                bgcolor: alpha(theme.palette.primary.main, 0.01),
                borderColor: 'divider'
              }}
            >
              <Typography variant="caption" display="block" gutterBottom fontWeight={750} color="text.secondary">
                Prévisualisation de l'image :
              </Typography>
              <img 
                src={getImageUrl(watch('image'))} 
                alt="Prévisualisation" 
                style={{ maxWidth: '100%', maxHeight: 220, borderRadius: 8, border: '1px solid #ddd', marginTop: 8 }} 
                onError={(e) => e.target.style.display = 'none'}
              />
            </Card>
          )}

          <TextField
            label="Explication pédagogique (affichée après validation)"
            multiline
            rows={2}
            fullWidth
            {...register('explication')}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            InputProps={{
              startAdornment: (
                <InfoOutlined color="action" sx={{ mr: 1, alignSelf: 'flex-start', mt: 0.5 }} />
              )
            }}
          />

          <Divider sx={{ my: 1 }}>
            <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ letterSpacing: 1, textTransform: 'uppercase' }}>
              Options de réponse (2 à 4)
            </Typography>
          </Divider>

          <Stack spacing={2}>
            {fields.map((field, index) => {
              const isCorrect = watchOptions[index]?.estCorrect;
              return (
                <Card 
                  key={field.id}
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    borderRadius: 3, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    borderColor: isCorrect ? 'success.main' : 'divider',
                    bgcolor: isCorrect ? alpha(theme.palette.success.main, 0.01) : 'background.paper',
                    transition: '0.2s'
                  }}
                >
                  <Radio
                    checked={isCorrect || false}
                    onChange={() => handleCorrectChange(index)}
                    color="success"
                    sx={{ p: 0.5 }}
                  />
                  <TextField
                    label={`Option de réponse ${index + 1}`}
                    fullWidth
                    variant="standard"
                    {...register(`options.${index}.texte`, { required: 'Le texte de l\'option est requis' })}
                    error={!!errors.options?.[index]?.texte}
                    InputProps={{ disableUnderline: true }}
                    placeholder="Saisissez le choix de réponse..."
                    sx={{ px: 1 }}
                  />
                  {fields.length > 2 && (
                    <IconButton onClick={() => remove(index)} color="error" size="small">
                      <Delete />
                    </IconButton>
                  )}
                </Card>
              );
            })}
          </Stack>

          {fields.length < 4 && (
            <Button 
              variant="outlined"
              color="primary"
              startIcon={<Add />} 
              onClick={() => append({ texte: '', estCorrect: false })}
              sx={{ alignSelf: 'flex-start', borderRadius: 3, fontWeight: 700, textTransform: 'none' }}
            >
              Ajouter une option
            </Button>
          )}

          {errors.options && (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              Veuillez compléter toutes les options.
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
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
              {loading ? "Chargement..." : initialData ? "Modifier la question" : "Créer la question"}
            </Button>
          </Box>
        </Stack>
      </form>
    </Box>
  );
};

export default QuestionForm;
