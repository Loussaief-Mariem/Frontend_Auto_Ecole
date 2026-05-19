import React from 'react';
import { 
  TextField, 
  InputAdornment, 
  Paper,
  Stack,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DateRangeIcon from '@mui/icons-material/DateRange';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AllInboxIcon from '@mui/icons-material/AllInbox';

const SeanceFilters = ({ searchTerm, setSearchTerm, dateFilter, setDateFilter }) => {
  const filterOptions = [
    { value: 'all', label: 'Toutes les dates', icon: <AllInboxIcon fontSize="small" /> },
    { value: 'today', label: "Aujourd'hui", icon: <CalendarTodayIcon fontSize="small" /> },
    { value: 'week', label: 'Cette semaine', icon: <DateRangeIcon fontSize="small" /> },
    { value: 'month', label: 'Ce mois-ci', icon: <EventNoteIcon fontSize="small" /> }
  ];

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        mb: 3, 
        border: '1px solid', 
        borderColor: 'divider', 
        borderRadius: 3,
        bgcolor: '#f8fafc' 
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" width="100%">
        <TextField
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
          sx={{ 
            flexGrow: 1, 
            minWidth: 200,
            bgcolor: 'white',
            borderRadius: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
        />
        
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {filterOptions.map((opt) => {
            const isSelected = dateFilter === opt.value;
            return (
              <Chip
                key={opt.value}
                label={opt.label}
                icon={opt.icon}
                clickable
                color={isSelected ? "primary" : "default"}
                variant={isSelected ? "filled" : "outlined"}
                onClick={() => setDateFilter(opt.value)}
                sx={{
                  fontWeight: isSelected ? 'bold' : 'normal',
                  borderRadius: 2.5,
                  px: 0.5,
                  py: 1.8,
                  bgcolor: isSelected ? 'primary.main' : 'white',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }
                }}
              />
            );
          })}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default SeanceFilters;
