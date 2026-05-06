import React from 'react';
import { 
  Box, 
  TextField, 
  InputAdornment, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Paper,
  Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

const SeanceFilters = ({ searchTerm, setSearchTerm, dateFilter, setDateFilter }) => {
  return (
    <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
        <TextField
          fullWidth
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          size="small"
        />
        
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="date-filter-label">Période</InputLabel>
          <Select
            labelId="date-filter-label"
            value={dateFilter}
            label="Période"
            onChange={(e) => setDateFilter(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <FilterListIcon fontSize="small" color="action" />
              </InputAdornment>
            }
          >
            <MenuItem value="all">Toutes les dates</MenuItem>
            <MenuItem value="today">Aujourd'hui</MenuItem>
            <MenuItem value="week">Cette semaine</MenuItem>
            <MenuItem value="month">Ce mois-ci</MenuItem>
          </Select>
        </FormControl>
      </Stack>
    </Paper>
  );
};

export default SeanceFilters;
