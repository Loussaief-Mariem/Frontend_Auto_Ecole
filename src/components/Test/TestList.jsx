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
  Box
} from '@mui/material';
import { Edit, Delete, Visibility, AddCircle } from '@mui/icons-material';

const TestList = ({ tests, onEdit, onDelete, onManageQuestions }) => {
  return (
    <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 3 }}>
      <Table>
        <TableHead sx={{ bgcolor: '#f8fafc' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Titre</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Thème</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Durée</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Questions</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tests.map((test) => (
            <TableRow key={test.id} hover>
              <TableCell>#{test.id}</TableCell>
              <TableCell sx={{ fontWeight: '500' }}>{test.titre}</TableCell>
              <TableCell>
                <Chip label={test.themeName} size="small" variant="outlined" />
              </TableCell>
              <TableCell>{test.dureeMinutes} min</TableCell>
              <TableCell>
                <Chip 
                  label={`${test.totalQuestionsActual} / ${test.nombreQuestions}`} 
                  color={test.totalQuestionsActual === test.nombreQuestions ? "success" : "warning"}
                  variant="outlined"
                  size="small"
                />
              </TableCell>
              <TableCell align="right">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Tooltip title="Gérer les questions">
                    <IconButton color="primary" onClick={() => onManageQuestions(test)}>
                      <AddCircle />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Modifier">
                    <IconButton color="info" onClick={() => onEdit(test)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton color="error" onClick={() => onDelete(test.id)}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
          {tests.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                <Typography color="textSecondary">Aucun test blanc trouvé.</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TestList;
