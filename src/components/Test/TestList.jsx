import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton, 
  Tooltip,
  Chip,
  Typography,
  Box,
  alpha,
  useTheme
} from '@mui/material';
import { Edit, Delete, AddCircle, Flag } from '@mui/icons-material';

const TestList = ({ tests, onEdit, onDelete, onManageQuestions }) => {
  const theme = useTheme();

  const getThemeLabel = (themeName) => {
    const themes = {
      "Signalisation": "Signalisation",
      "ConducteurVehicule": "Conducteur et Véhicule",
      "ArretStationnement": "Arrêt et Stationnement",
      "CroisementDepassement": "Croisement & Dépassement",
      "Priorite": "Priorités",
      "Circulation": "Circulation",
      "Delits": "Délits",
      "PremiersSecours": "Premiers Secours",
      "MaintenanceEnergie": "Maintenance & Énergie",
      "TransportMatieresDangereuses": "Transport Matières Dangereuses",
      "Général": "Général"
    };
    return themes[themeName] || themeName;
  };

  return (
    <TableContainer 
      component={Paper} 
      elevation={0} 
      sx={{ 
        borderRadius: 4, 
        border: '1px solid', 
        borderColor: 'divider', 
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.02)'
      }}
    >
      <Table>
        <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 800, color: 'text.primary' }}>ID</TableCell>
            <TableCell sx={{ fontWeight: 800, color: 'text.primary' }}>Titre</TableCell>
            <TableCell sx={{ fontWeight: 800, color: 'text.primary' }}>Thème</TableCell>
            <TableCell sx={{ fontWeight: 800, color: 'text.primary' }}>Seuil Réussite</TableCell>
            <TableCell sx={{ fontWeight: 800, color: 'text.primary' }}>Questions</TableCell>
            <TableCell align="right" sx={{ fontWeight: 800, color: 'text.primary', pr: 3 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tests.map((test) => (
            <TableRow key={test.id} hover sx={{ transition: '0.2s' }}>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>#{test.id}</TableCell>
              <TableCell sx={{ fontWeight: 800, color: 'text.primary' }}>{test.titre}</TableCell>
              <TableCell>
                <Chip 
                  label={getThemeLabel(test.themeName)} 
                  size="small" 
                  variant="outlined" 
                  color="primary"
                  sx={{ fontWeight: 650, borderRadius: 2 }}
                />
              </TableCell>
              <TableCell>
                <Chip 
                  icon={<Flag fontSize="small" />}
                  label={`${test.seuilReussite}%`} 
                  size="small" 
                  color="success"
                  variant="contained"
                  sx={{ fontWeight: 800, borderRadius: 2, px: 1 }}
                />
              </TableCell>
              <TableCell>
                <Chip 
                  label={`${test.totalQuestionsActual || 0} / ${test.nombreQuestions}`} 
                  color={test.totalQuestionsActual === test.nombreQuestions ? "success" : "warning"}
                  variant="outlined"
                  size="small"
                  sx={{ fontWeight: 750, borderRadius: 2 }}
                />
              </TableCell>
              <TableCell align="right" sx={{ pr: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                  <Tooltip title="Gérer les questions">
                    <IconButton 
                      color="primary" 
                      onClick={() => onManageQuestions(test)}
                      sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) } }}
                    >
                      <AddCircle />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Modifier">
                    <IconButton 
                      color="info" 
                      onClick={() => onEdit(test)}
                      sx={{ '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.08) } }}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton 
                      color="error" 
                      onClick={() => onDelete(test.id)}
                      sx={{ '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) } }}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
          {tests.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                <Typography color="textSecondary" fontWeight={600}>Aucune série d'entraînement trouvée.</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TestList;
